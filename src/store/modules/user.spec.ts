import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const loginApi = vi.hoisted(() => ({
  accountLogin: vi.fn(),
  exchangeErpCookie: vi.fn(),
  getLinkedAccounts: vi.fn(),
  getUserMenus: vi.fn(),
  loginByOa: vi.fn(),
  switchLinkedAccount: vi.fn()
}))
const monitor = vi.hoisted(() => ({
  setUser: vi.fn(),
  clearUser: vi.fn(),
  track: vi.fn(async () => undefined)
}))
const dictionary = vi.hoisted(() => ({
  reset: vi.fn(),
  loadAll: vi.fn(async () => undefined)
}))
const orgUser = vi.hoisted(() => ({
  reset: vi.fn(),
  prefetch: vi.fn(async () => undefined)
}))

vi.mock('@/api/login', () => loginApi)
vi.mock('@/plugins/monitor', () => ({ monitor }))
vi.mock('./dictionary', () => ({ useDictionaryStore: () => dictionary }))
vi.mock('./orgUser', () => ({ useOrgUserStore: () => orgUser }))

import { useUserStore } from './user'
import { usePermissionStore } from './permission'
import router from '@/router'

const createToken = (userId: string, exp = 4_102_444_800): string => {
  const payload = btoa(JSON.stringify({ erp_userid: userId, exp }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `header.${payload}.signature`
}

describe('user authentication store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    localStorage.clear()
    sessionStorage.clear()
    loginApi.getLinkedAccounts.mockResolvedValue([null, []])
    loginApi.getUserMenus.mockResolvedValue([null, []])
  })

  it('commits a new login only after its menu is ready', async () => {
    const accessToken = createToken('user-a')
    loginApi.accountLogin.mockResolvedValue([null, { access_token: accessToken }])
    const userStore = useUserStore()
    const result = await userStore.loginByPassword({ username: 'a', password: 'p' })

    expect(result.erp_userid).toBe('user-a')
    expect(userStore.token).toBe(accessToken)
    expect(usePermissionStore().isAddRouters).toBe(true)
    expect(loginApi.getUserMenus).toHaveBeenCalledWith(accessToken)
    expect(monitor.track).toHaveBeenCalledWith('$LoginSuccess', {
      module: 'login',
      auth_source: 'password'
    })
  })

  it('supports raw-token, ERP-cookie and OA authentication sources', async () => {
    const userStore = useUserStore()

    const externalToken = createToken('external-user')
    expect((await userStore.loginByExternalToken(externalToken)).erp_userid).toBe('external-user')
    expect(monitor.track).toHaveBeenLastCalledWith('$LoginSuccess', {
      module: 'login',
      auth_source: 'external-token'
    })

    const erpToken = createToken('erp-user')
    loginApi.exchangeErpCookie.mockResolvedValue([null, { access_token: erpToken }])
    expect((await userStore.loginByErpCookie('erp-cookie')).erp_userid).toBe('erp-user')
    expect(loginApi.exchangeErpCookie).toHaveBeenCalledWith('erp-cookie')
    expect(monitor.track).toHaveBeenLastCalledWith('$LoginSuccess', {
      module: 'login',
      auth_source: 'erp-cookie'
    })

    const oaToken = createToken('oa-user')
    loginApi.loginByOa.mockResolvedValue([null, { access_token: oaToken }])
    expect(
      (await userStore.loginByOa({ username: 'oa-name', password: 'oa-password' })).erp_userid
    ).toBe('oa-user')
    expect(loginApi.loginByOa).toHaveBeenCalledWith({
      username: 'oa-name',
      password: 'oa-password'
    })
    expect(monitor.track).toHaveBeenLastCalledWith('$LoginSuccess', {
      module: 'login',
      auth_source: 'oa'
    })
    expect(JSON.stringify(monitor.track.mock.calls)).not.toContain(oaToken)
    expect(JSON.stringify(monitor.track.mock.calls)).not.toContain('oa-password')
  })

  it('does not let a failed monitor transport fail authentication', async () => {
    const accessToken = createToken('tracked-user')
    loginApi.accountLogin.mockResolvedValue([null, { access_token: accessToken }])
    monitor.track.mockRejectedValueOnce(new Error('transport failed'))

    const result = await useUserStore().loginByPassword({ username: 'a', password: 'p' })
    expect(result.erp_userid).toBe('tracked-user')
  })

  it('throws the request error without committing a failed login', async () => {
    const requestError = { error_description: '账号或密码错误' }
    loginApi.accountLogin.mockResolvedValue([requestError, null])
    const userStore = useUserStore()

    await expect(userStore.loginByPassword({ username: 'a', password: 'wrong' })).rejects.toBe(
      requestError
    )
    expect(userStore.token).toBe('')
  })

  it('keeps the previous account when the new menu fails', async () => {
    const oldToken = createToken('old-user')
    loginApi.accountLogin.mockResolvedValue([null, { access_token: oldToken }])
    const userStore = useUserStore()
    await userStore.loginByPassword({ username: 'old', password: 'p' })

    const newToken = createToken('new-user')
    loginApi.switchLinkedAccount.mockResolvedValue([null, { access_token: newToken }])
    loginApi.getUserMenus.mockResolvedValueOnce([new Error('menu failed'), null])
    const result = userStore.switchAccount('new-user')

    await expect(result).rejects.toThrow('menu failed')
    expect(userStore.token).toBe(oldToken)
    expect(userStore.currentUserId).toBe('old-user')
    expect(monitor.track).not.toHaveBeenCalledWith('$AccountSwitch', expect.anything())
  })

  it('commits a successful account switch and records one switch event', async () => {
    const oldToken = createToken('old-user')
    loginApi.accountLogin.mockResolvedValue([null, { access_token: oldToken }])
    const userStore = useUserStore()
    await userStore.loginByPassword({ username: 'old', password: 'p' })
    monitor.track.mockClear()

    const newToken = createToken('new-user')
    loginApi.switchLinkedAccount.mockResolvedValue([null, { access_token: newToken }])
    const result = await userStore.switchAccount('new-user')

    expect(result.erp_userid).toBe('new-user')
    expect(userStore.token).toBe(newToken)
    expect(monitor.track).toHaveBeenCalledTimes(1)
    expect(monitor.track).toHaveBeenCalledWith('$AccountSwitch', {
      module: 'login',
      from_user_id: 'old-user',
      to_user_id: 'new-user'
    })
  })

  it('restores a persisted session without checking exp or recording a new login', async () => {
    const accessToken = createToken('restored-user', 1)
    const userStore = useUserStore()
    userStore.$patch({
      token: accessToken,
      userInfo: { erp_userid: 'restored-user' }
    })
    monitor.track.mockClear()

    const result = await userStore.restoreSession()
    expect(result).toBe(true)
    expect(monitor.setUser).toHaveBeenCalled()
    expect(monitor.track).not.toHaveBeenCalled()
  })

  it('deduplicates concurrent session restoration', async () => {
    const accessToken = createToken('restored-user')
    const userStore = useUserStore()
    userStore.$patch({
      token: accessToken,
      userInfo: { erp_userid: 'restored-user' }
    })

    const [first, second] = await Promise.all([
      userStore.restoreSession(),
      userStore.restoreSession()
    ])
    expect(first).toBe(true)
    expect(second).toBe(true)
    expect(loginApi.getUserMenus).toHaveBeenCalledTimes(1)
  })

  it('clears all login-owned state on logout', async () => {
    const accessToken = createToken('logout-user')
    loginApi.accountLogin.mockResolvedValue([null, { access_token: accessToken }])
    const userStore = useUserStore()
    await userStore.loginByPassword({ username: 'logout-user', password: 'p' })

    const replace = vi.spyOn(router, 'replace').mockResolvedValue(undefined)
    await userStore.logout()

    expect(userStore.token).toBe('')
    expect(userStore.userInfo).toBeNull()
    expect(usePermissionStore().isAddRouters).toBe(false)
    expect(dictionary.reset).toHaveBeenCalled()
    expect(orgUser.reset).toHaveBeenCalled()
    expect(monitor.clearUser).toHaveBeenCalled()
    expect(replace).toHaveBeenCalledWith('/login')
  })
})
