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
import type { LoginResponse, UserInfo } from '@/types/user'
import { decodeJwtUser, getUserId } from '@/utils/jwt'
import { monitor } from '@/plugins/monitor'
import { useDictionaryStore } from './dictionary'
import { useOrgUserStore } from './orgUser'
import { isProductionRouteEnvironment, usePermissionStore } from './permission'
import { useTagsViewStore } from './tagsView'
import { useFunPermissionStoreWithOut } from './funPermission'
import { useRailwayStationStoreWithOut } from '@/views/railway/station/store/index'
import { useWaterwayStationStoreWithOut } from '@/views/waterway/station/store/index'
import { store } from '../index'

type AuthSource = 'password' | 'external-token' | 'erp-cookie' | 'oa' | 'account-switch'

interface UserState {
  token: string
  userInfo: UserInfo | null
  accounts: LinkedAccount[]
}

let restorePromise: Promise<boolean> | null = null
let accountsPromise: Promise<void> | null = null
let sessionGeneration = 0

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
    async completeAuthentication(
      response: LoginResponse,
      source: AuthSource,
      previousUserId = ''
    ): Promise<UserInfo> {
      const token = response.access_token
      const userInfo = decodeJwtUser(token)
      if (!userInfo) throw new Error('Token 解析失败')

      const permissionStore = usePermissionStore()
      let routes: AppRouteRecordRaw[]
      if (isProductionRouteEnvironment()) {
        const [menuError, menuResponse] = await getUserMenus(token)
        if (menuError || !menuResponse) throw menuError || new Error('菜单加载失败')
        routes = permissionStore.prepareRoutes(menuResponse)
      } else {
        routes = permissionStore.prepareRoutes()
      }
      permissionStore.replaceRoutes(routes)

      this.token = token
      this.userInfo = userInfo
      this.accounts = []
      accountsPromise = null
      useTagsViewStore().removeAllViews(false)
      useFunPermissionStoreWithOut().reset()
      useRailwayStationStoreWithOut().reset()
      useWaterwayStationStoreWithOut().reset()

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
        void monitor
          .track('$AccountSwitch', {
            module: 'login',
            from_user_id: previousUserId,
            to_user_id: getUserId(userInfo)
          })
          .catch(() => undefined)
      } else {
        void monitor
          .track('$LoginSuccess', { module: 'login', auth_source: source })
          .catch(() => undefined)
      }
      return userInfo
    },
    async loginByPassword(credentials: LoginCredentials): Promise<UserInfo> {
      const [error, response] = await accountLogin(credentials)
      if (error || !response) throw error || new Error('登录失败')
      return this.completeAuthentication(response, 'password')
    },
    loginByExternalToken(token: string): Promise<UserInfo> {
      return this.completeAuthentication({ access_token: token }, 'external-token')
    },
    async loginByErpCookie(cookie: string): Promise<UserInfo> {
      const [error, response] = await exchangeErpCookie(cookie)
      if (error || !response) throw error || new Error('ERP 登录失败')
      return this.completeAuthentication(response, 'erp-cookie')
    },
    async loginByOa(credentials: OaLoginCredentials): Promise<UserInfo> {
      const [error, response] = await requestOaLogin(credentials)
      if (error || !response) throw error || new Error('OA 登录失败')
      return this.completeAuthentication(response, 'oa')
    },
    async switchAccount(accountId: string): Promise<UserInfo> {
      if (!this.token) throw new Error('当前会话不存在')
      const previousUserId = this.currentUserId
      const [error, response] = await switchLinkedAccount(accountId, this.token)
      if (error || !response) throw error || new Error('账号切换失败')
      return this.completeAuthentication(response, 'account-switch', previousUserId)
    },
    async loadAccounts(): Promise<void> {
      if (accountsPromise) return accountsPromise
      const generation = sessionGeneration
      const pending = (async (): Promise<void> => {
        const [error, response] = await getLinkedAccounts()
        if (generation !== sessionGeneration || error || !response) return
        try {
          const parsed = typeof response === 'string' ? JSON.parse(response) : response
          this.accounts = Array.isArray(parsed) ? parsed : [parsed]
        } catch {
          return
        }
      })().finally(() => {
        if (accountsPromise === pending) accountsPromise = null
      })
      accountsPromise = pending
      return pending
    },
    restoreSession(): Promise<boolean> {
      if (restorePromise) return restorePromise
      const pending = (async (): Promise<boolean> => {
        if (!this.token || !this.userInfo) {
          if (this.token || this.userInfo) this.clearSession()
          return false
        }

        const decodedUser = decodeJwtUser(this.token)
        if (!decodedUser) {
          this.clearSession()
          return false
        }

        const permissionStore = usePermissionStore()
        if (!permissionStore.isAddRouters) {
          try {
            let routes: AppRouteRecordRaw[]
            if (isProductionRouteEnvironment()) {
              const [menuError, menuResponse] = await getUserMenus(this.token)
              if (menuError || !menuResponse) throw menuError || new Error('菜单加载失败')
              routes = permissionStore.prepareRoutes(menuResponse)
            } else {
              routes = permissionStore.prepareRoutes()
            }
            permissionStore.replaceRoutes(routes)
          } catch {
            this.clearSession()
            return false
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
        return true
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
      useFunPermissionStoreWithOut().reset()
      useRailwayStationStoreWithOut().reset()
      useWaterwayStationStoreWithOut().reset()
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
