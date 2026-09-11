import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import router, { asyncRouterMap, constantRouterMap } from '@/router'
import type { BackendMenuResponse } from '@/api/login/types'
import { extractAuthorizedMenuPaths, normalizeBackendMenus } from '@/utils/menuAdapter'
import { isUrl, pathResolve } from '@/utils/routerHelper'
import { store } from '../index'

let dynamicRouteRemovers: Array<() => void> = []

export interface PermissionState {
  routers: AppRouteRecordRaw[]
  addRouters: AppRouteRecordRaw[]
  isAddRouters: boolean
}

export interface AsyncRouteFilterResult {
  routes: AppRouteRecordRaw[]
  warnings: string[]
}

const removeInstalledRoutes = (): void => {
  for (const removeRoute of [...dynamicRouteRemovers].reverse()) removeRoute()
  dynamicRouteRemovers = []
}

const normalizePath = (path: string): string => {
  if (isUrl(path)) return path
  const normalized = path.replace(/\/+/g, '/')
  return normalized.length > 1 ? normalized.replace(/\/$/, '') : normalized
}

const resolveFullPath = (parentPath: string, routePath: string): string =>
  normalizePath(isUrl(routePath) ? routePath : pathResolve(parentPath, routePath))

const collectRoutePaths = (
  routes: AppRouteRecordRaw[],
  parentPath = '/',
  result = new Set<string>()
): Set<string> => {
  for (const route of routes) {
    const fullPath = resolveFullPath(parentPath, route.path)
    result.add(fullPath)
    if (route.children) collectRoutePaths(route.children, fullPath, result)
  }
  return result
}

const resolveRedirectPath = (redirect: string, parentPath: string): string => {
  const path = redirect.split(/[?#]/, 1)[0]
  return resolveFullPath(parentPath, path)
}

const firstVisibleChildPath = (
  routes: AppRouteRecordRaw[],
  parentPath: string
): string | undefined => {
  for (const route of routes) {
    if (route.meta.hidden) continue
    return resolveFullPath(parentPath, route.path)
  }
  return undefined
}

export const filterAsyncRoutes = (
  routes: AppRouteRecordRaw[],
  authorizedPaths: ReadonlySet<string>,
  menuIcons: ReadonlyMap<string, string> = new Map()
): AsyncRouteFilterResult => {
  const normalizedAuthorizedPaths = new Set(
    [...authorizedPaths].map((path) => normalizePath(path.split(/[?#]/, 1)[0]))
  )
  const configuredPaths = collectRoutePaths(routes)
  const warnings: string[] = []

  for (const path of normalizedAuthorizedPaths) {
    if (!configuredPaths.has(path))
      warnings.push(`菜单路径未在 asyncRouterMap 中登记，已忽略：${path}`)
  }

  const visit = (items: AppRouteRecordRaw[], parentPath: string): AppRouteRecordRaw[] => {
    const result: AppRouteRecordRaw[] = []

    for (const route of items) {
      const fullPath = resolveFullPath(parentPath, route.path)
      const children = route.children ? visit(route.children, fullPath) : undefined

      if (route.children?.length) {
        if (!children?.length) continue
      } else {
        const followRoute = route.meta.hidden ? route.meta.followRoute : undefined
        const normalizedFollowRoute = followRoute
          ? resolveRedirectPath(followRoute, parentPath)
          : undefined
        if (normalizedFollowRoute && !configuredPaths.has(normalizedFollowRoute)) {
          warnings.push(
            `路由 ${fullPath} 的 followRoute 未在 asyncRouterMap 中登记：${followRoute}`
          )
        }
        const followsAuthorizedRoute = Boolean(
          normalizedFollowRoute &&
          configuredPaths.has(normalizedFollowRoute) &&
          normalizedAuthorizedPaths.has(normalizedFollowRoute)
        )
        if (!normalizedAuthorizedPaths.has(fullPath) && !followsAuthorizedRoute) continue
      }

      const filteredRoute: AppRouteRecordRaw = {
        ...route,
        meta: {
          ...route.meta,
          ...(menuIcons.get(fullPath) ? { icon: menuIcons.get(fullPath) } : {})
        },
        children
      }

      if (children && typeof filteredRoute.redirect === 'string') {
        const retainedPaths = collectRoutePaths(children, fullPath)
        const redirectPath = resolveRedirectPath(filteredRoute.redirect, fullPath)
        if (!retainedPaths.has(redirectPath)) {
          const fallback = firstVisibleChildPath(children, fullPath)
          if (fallback) filteredRoute.redirect = fallback
          else delete filteredRoute.redirect
        }
      }

      result.push(filteredRoute)
    }

    return result
  }

  return { routes: visit(routes, '/'), warnings }
}

const installRouteSet = (routes: AppRouteRecordRaw[]): void => {
  const removers: Array<() => void> = []
  try {
    for (const route of routes) {
      if (!isUrl(route.path)) removers.push(router.addRoute(route as RouteRecordRaw))
    }
    dynamicRouteRemovers = removers
  } catch (error) {
    for (const removeRoute of removers.reverse()) removeRoute()
    throw error instanceof Error ? error : new Error('动态路由注册失败')
  }
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: [...constantRouterMap],
    addRouters: [],
    isAddRouters: false
  }),
  getters: {
    homePath: () => '/dashboard'
  },
  actions: {
    prepareRoutes(response: BackendMenuResponse): AppRouteRecordRaw[] {
      const menus = normalizeBackendMenus(response)
      if (!menus) throw new Error('菜单解析失败')

      const authorization = extractAuthorizedMenuPaths(menus)
      const filtered = filterAsyncRoutes(asyncRouterMap, authorization.paths, authorization.icons)
      for (const warning of [...authorization.warnings, ...filtered.warnings]) console.warn(warning)
      return filtered.routes
    },
    replaceRoutes(routes: AppRouteRecordRaw[]): void {
      const previousRoutes = this.addRouters
      const previousIsAddRouters = this.isAddRouters
      removeInstalledRoutes()
      try {
        installRouteSet(routes)
      } catch (error) {
        this.addRouters = previousRoutes
        this.routers = constantRouterMap.concat(previousRoutes)
        this.isAddRouters = previousIsAddRouters
        try {
          installRouteSet(previousRoutes)
        } catch (rollbackError) {
          console.error('旧动态路由恢复失败', rollbackError)
          this.reset()
        }
        throw error
      }

      this.addRouters = routes
      this.routers = constantRouterMap.concat(routes)
      this.isAddRouters = true
    },
    removeDynamicRoutes(): void {
      removeInstalledRoutes()
      this.addRouters = []
      this.routers = [...constantRouterMap]
      this.isAddRouters = false
    },
    reset(): void {
      this.removeDynamicRoutes()
    }
  }
})

export const usePermissionStoreWithOut = () => usePermissionStore(store)
