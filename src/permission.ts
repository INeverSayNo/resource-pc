import NProgress from 'nprogress'
import router from './router'
import { consumeExternalAuthQuery } from '@/auth/external'
import { NO_REDIRECT_WHITE_LIST } from '@/constants'
import { useAppStoreWithOut } from '@/store/modules/app'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { useUserStoreWithOut } from '@/store/modules/user'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

export const ensureDynamicRoutes = async () => {
  const permissionStore = usePermissionStoreWithOut()
  if (permissionStore.isAddRouters) return [null, false] as const
  return useUserStoreWithOut().restoreSession()
}

export const setupPermission = async (): Promise<void> => {
  const userStore = useUserStoreWithOut()
  if (userStore.token && userStore.userInfo) await userStore.restoreSession()

  router.beforeEach(async (to) => {
    NProgress.start()
    useAppStoreWithOut().pageLoading = true

    const external = consumeExternalAuthQuery(to)
    const sanitizedLocation = { path: to.path, query: external.query, hash: to.hash }
    const sanitizedFullPath = router.resolve(sanitizedLocation).fullPath
    if (external.hasSensitiveParams) {
      const href = router.resolve(sanitizedLocation).href
      window.history.replaceState(window.history.state, '', href)
    }

    if (userStore.token || userStore.userInfo) {
      userStore.clearSession()
    }

    if (!userStore.isAuthenticated) {
      if (external.request) {
        const result =
          external.request.type === 'external-token'
            ? await userStore.loginByExternalToken(external.request.token)
            : external.request.type === 'erp-cookie'
              ? await userStore.loginByErpCookie(external.request.cookie)
              : await userStore.loginByOa({
                  username: external.request.username,
                  password: external.request.password
                })
        if (result[0]) {
          return {
            path: '/login',
            query: sanitizedFullPath === '/login' ? undefined : { redirect: sanitizedFullPath },
            replace: true
          }
        }
        return to.path === '/login'
          ? { path: usePermissionStoreWithOut().homePath, replace: true }
          : { ...sanitizedLocation, replace: true }
      }

      if (NO_REDIRECT_WHITE_LIST.includes(to.path)) {
        return external.hasSensitiveParams ? { ...sanitizedLocation, replace: true } : true
      }
      return { path: '/login', query: { redirect: sanitizedFullPath } }
    }

    if (to.path === '/login') return { path: usePermissionStoreWithOut().homePath, replace: true }
    if (external.hasSensitiveParams) return { ...sanitizedLocation, replace: true }

    const [routeError, routesAdded] = await ensureDynamicRoutes()
    if (routeError) {
      userStore.clearSession()
      return { path: '/login', query: { redirect: sanitizedFullPath } }
    }
    if (routesAdded) return { path: sanitizedFullPath, replace: true }
    if (to.name === 'Fallback') return { path: '/404', replace: true }
    return true
  })

  router.afterEach(() => {
    NProgress.done()
    useAppStoreWithOut().pageLoading = false
  })
}
