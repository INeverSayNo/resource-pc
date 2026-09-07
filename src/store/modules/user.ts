import { defineStore } from 'pinia'
import router from '@/router'
import {
  accountLogin,
  exchangeErpCookie,
  getLinkedAccounts,
  getUserMenus,
  loginByOa as requestOaLogin,
  switchLinkedAccount
} from '@/api/login'
import type { LinkedAccount, LoginCredentials, OaLoginCredentials } from '@/api/login'
import type { ApiResult } from '@/request'
import type { LoginResponse, UserInfo } from '@/types/user'
import { decodeJwtUser, getUserId } from '@/utils/jwt'
import { monitor } from '@/plugins/monitor'
import { useDictionaryStore } from './dictionary'
import { useOrgUserStore } from './orgUser'
import { usePermissionStore } from './permission'
import { useTagsViewStore } from './tagsView'
import { store } from '../index'

type AuthSource = 'password' | 'external-token' | 'erp-cookie' | 'oa' | 'account-switch'

interface UserState {
  token: string
  userInfo: UserInfo | null
  accounts: LinkedAccount[]
}

let restorePromise: Promise<ApiResult<boolean>> | null = null
let accountsPromise: Promise<ApiResult<LinkedAccount[]>> | null = null
let sessionGeneration = 0

const trackNonBlocking = (event: string, properties: Record<string, unknown>): void => {
  try {
    void monitor.track(event, properties).catch(() => undefined)
  } catch {
    // 埋点异常不能中断登录、恢复或账号切换。
  }
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: null,
    accounts: []
  }),
  getters: {
    isAuthenticated(state): boolean {
      return Boolean(state.token && state.userInfo)
    },
    currentUserId(state): string {
      return state.userInfo ? getUserId(state.userInfo) : ''
    }
  },
  actions: {
    isSessionValid(): boolean {
      if (!this.token || !this.userInfo) return false
      return decodeJwtUser(this.token)[0] === null
    },
    async completeAuthentication(
      response: LoginResponse,
      source: AuthSource,
      previousUserId = ''
    ): Promise<ApiResult<UserInfo>> {
      const token = response.access_token
      const [jwtError, userInfo] = decodeJwtUser(token)
      if (jwtError || !userInfo) return [jwtError || new Error('Token 解析失败'), null]

      const [menuError, menuResponse] = await getUserMenus(token)
      if (menuError || !menuResponse) return [menuError || new Error('菜单加载失败'), null]

      const permissionStore = usePermissionStore()
      const [prepareError, routes] = permissionStore.prepareRoutes(menuResponse)
      if (prepareError || !routes) return [prepareError || new Error('菜单转换失败'), null]

      const [installError] = permissionStore.replaceRoutes(routes)
      if (installError) return [installError, null]

      this.token = token
      this.userInfo = userInfo
      this.accounts = []
      accountsPromise = null
      useTagsViewStore().removeAllViews(false)

      sessionGeneration += 1
      const generation = sessionGeneration
      const dictionaryStore = useDictionaryStore()
      const orgUserStore = useOrgUserStore()
      dictionaryStore.reset(generation)
      orgUserStore.reset(generation)
      monitor.setUser({ ...userInfo, id: getUserId(userInfo) })

      void this.loadAccounts()
      void dictionaryStore.loadAll(generation)
      void orgUserStore.prefetch(generation)

      if (source === 'account-switch') {
        trackNonBlocking('$AccountSwitch', {
          module: 'login',
          from_user_id: previousUserId,
          to_user_id: getUserId(userInfo)
        })
      } else {
        trackNonBlocking('$LoginSuccess', { module: 'login', auth_source: source })
      }
      return [null, userInfo]
    },
    async loginByPassword(credentials: LoginCredentials): Promise<ApiResult<UserInfo>> {
      const [error, response] = await accountLogin(credentials)
      if (error || !response) return [error || new Error('登录失败'), null]
      return this.completeAuthentication(response, 'password')
    },
    loginByExternalToken(token: string): Promise<ApiResult<UserInfo>> {
      return this.completeAuthentication({ access_token: token }, 'external-token')
    },
    async loginByErpCookie(cookie: string): Promise<ApiResult<UserInfo>> {
      const [error, response] = await exchangeErpCookie(cookie)
      if (error || !response) return [error || new Error('ERP 登录失败'), null]
      return this.completeAuthentication(response, 'erp-cookie')
    },
    async loginByOa(credentials: OaLoginCredentials): Promise<ApiResult<UserInfo>> {
      const [error, response] = await requestOaLogin(credentials)
      if (error || !response) return [error || new Error('OA 登录失败'), null]
      return this.completeAuthentication(response, 'oa')
    },
    async switchAccount(accountId: string): Promise<ApiResult<UserInfo>> {
      if (!this.token) return [new Error('当前会话不存在'), null]
      const previousUserId = this.currentUserId
      const [error, response] = await switchLinkedAccount(accountId, this.token)
      if (error || !response) return [error || new Error('账号切换失败'), null]
      return this.completeAuthentication(response, 'account-switch', previousUserId)
    },
    async loadAccounts(): Promise<ApiResult<LinkedAccount[]>> {
      if (accountsPromise) return accountsPromise
      const generation = sessionGeneration
      const pending = (async (): Promise<ApiResult<LinkedAccount[]>> => {
        const [error, response] = await getLinkedAccounts()
        if (generation !== sessionGeneration) return [new Error('关联账号请求已失效'), null]
        if (error || !response) return [error || new Error('关联账号加载失败'), null]
        try {
          const parsed = typeof response === 'string' ? JSON.parse(response) : response
          this.accounts = Array.isArray(parsed) ? parsed : [parsed]
          return [null, this.accounts]
        } catch {
          return [new Error('关联账号响应格式无效'), null]
        }
      })().finally(() => {
        if (accountsPromise === pending) accountsPromise = null
      })
      accountsPromise = pending
      return pending
    },
    restoreSession(): Promise<ApiResult<boolean>> {
      if (restorePromise) return restorePromise
      const pending = (async (): Promise<ApiResult<boolean>> => {
        if (!this.token || !this.userInfo) {
          if (this.token || this.userInfo) this.clearSession()
          return [null, false]
        }

        const [jwtError, decodedUser] = decodeJwtUser(this.token)
        if (jwtError || !decodedUser || !this.isSessionValid()) {
          this.clearSession()
          return [jwtError || new Error('登录会话已过期'), null]
        }

        const permissionStore = usePermissionStore()
        if (!permissionStore.isAddRouters) {
          const [menuError, menuResponse] = await getUserMenus(this.token)
          if (menuError || !menuResponse) {
            this.clearSession()
            return [menuError || new Error('菜单恢复失败'), null]
          }
          const [prepareError, routes] = permissionStore.prepareRoutes(menuResponse)
          if (prepareError || !routes) {
            this.clearSession()
            return [prepareError || new Error('菜单恢复失败'), null]
          }
          const [installError] = permissionStore.replaceRoutes(routes)
          if (installError) {
            this.clearSession()
            return [installError, null]
          }
        }

        this.userInfo = decodedUser
        this.accounts = []
        accountsPromise = null
        monitor.setUser({ ...decodedUser, id: getUserId(decodedUser) })
        sessionGeneration += 1
        const generation = sessionGeneration
        useDictionaryStore().reset(generation)
        useOrgUserStore().reset(generation)
        void this.loadAccounts()
        void useDictionaryStore().loadAll(generation)
        void useOrgUserStore().prefetch(generation)
        return [null, true]
      })().finally(() => {
        if (restorePromise === pending) restorePromise = null
      })
      restorePromise = pending
      return pending
    },
    clearSession(): void {
      sessionGeneration += 1
      this.token = ''
      this.userInfo = null
      this.accounts = []
      accountsPromise = null
      usePermissionStore().reset()
      useTagsViewStore().removeAllViews(false)
      useDictionaryStore().reset(sessionGeneration)
      useOrgUserStore().reset(sessionGeneration)
      monitor.clearUser()
      sessionStorage.removeItem('vea-auth-session-v2')
      localStorage.removeItem('JsToken')
      localStorage.removeItem('CurUser')
      sessionStorage.removeItem('userInfo')
    },
    async expireSession(): Promise<void> {
      const currentPath = router.currentRoute.value.fullPath
      this.clearSession()
      if (router.currentRoute.value.path !== '/login') {
        await router.replace({
          path: '/login',
          query: currentPath && currentPath !== '/' ? { redirect: currentPath } : undefined
        })
      }
    },
    async logout(): Promise<void> {
      this.clearSession()
      await router.replace('/login')
    }
  },
  persist: {
    key: 'vea-auth-session-v2',
    storage: sessionStorage,
    pick: ['token', 'userInfo']
  }
})

export const useUserStoreWithOut = () => useUserStore(store)
