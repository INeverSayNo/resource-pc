import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import router, { asyncRouterMap, constantRouterMap } from '@/router'
import type { BackendMenuResponse } from '@/api/login/types'
import {
  extractAuthorizedMenuPaths,
  normalizeBackendMenus,
  type MenuAuthorizationEntry,
  type MenuAuthorizationResult
} from '@/utils/menuAdapter'
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

interface IndexedRoute {
  route: AppRouteRecordRaw
  fullPath: string
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

const cloneRoutes = (routes: AppRouteRecordRaw[]): AppRouteRecordRaw[] =>
  routes.map((route) => ({
    ...route,
    meta: { ...route.meta },
    children: route.children ? cloneRoutes(route.children) : undefined
  }))

const getRelativePath = (rootPath: string, fullPath: string): string => {
  if (fullPath === rootPath) return ''
  return fullPath.startsWith(`${rootPath}/`) ? fullPath.slice(rootPath.length + 1) : fullPath
}

const getPathSegment = (path: string): string => path.split('/').filter(Boolean).at(-1) || ''

const indexRouteBranch = (
  route: AppRouteRecordRaw,
  parentPath = '/',
  result: IndexedRoute[] = []
): IndexedRoute[] => {
  const fullPath = resolveFullPath(parentPath, route.path)
  result.push({ route, fullPath })
  for (const child of route.children || []) {
    indexRouteBranch(child, fullPath, result)
  }
  return result
}

const getRouteName = (route: AppRouteRecordRaw): string =>
  typeof route.name === 'string' ? route.name.toLowerCase() : ''

const getMenuNames = (entry: MenuAuthorizationEntry): string[] =>
  [entry.menuCode, entry.code]
    .filter((name): name is string => Boolean(name))
    .map((name) => name.toLowerCase())

const getEntryMatchLevel = (
  staticEntry: IndexedRoute,
  menuEntry: MenuAuthorizationEntry,
  staticRootPath: string,
  menuRootPath: string
): number => {
  const staticRelativePath = getRelativePath(staticRootPath, staticEntry.fullPath)
  const menuRelativePath = getRelativePath(menuRootPath, menuEntry.path)
  if (staticRelativePath && staticRelativePath === menuRelativePath) return 3

  const routeName = getRouteName(staticEntry.route)
  if (routeName && getMenuNames(menuEntry).includes(routeName)) return 2

  return getPathSegment(staticEntry.fullPath) === getPathSegment(menuEntry.path) ? 1 : 0
}

const getMenuBranchEntries = (
  rootEntry: MenuAuthorizationEntry,
  entries: MenuAuthorizationEntry[]
): MenuAuthorizationEntry[] =>
  entries.filter(
    (entry) => entry.path === rootEntry.path || entry.path.startsWith(`${rootEntry.path}/`)
  )

const findStaticRoot = (
  routes: AppRouteRecordRaw[],
  menuRoot: MenuAuthorizationEntry,
  menuEntries: MenuAuthorizationEntry[],
  usedRoots: ReadonlySet<string>
): IndexedRoute | undefined => {
  const roots = routes
    .map((route) => indexRouteBranch(route)[0])
    .filter((entry) => !usedRoots.has(entry.fullPath))
  const exactRoot = roots.find((entry) => entry.fullPath === menuRoot.path)
  if (exactRoot) return exactRoot

  const scoredRoots = roots
    .map((root) => {
      const staticEntries = indexRouteBranch(root.route).slice(1)
      const score = menuEntries.slice(1).reduce((total, menuEntry) => {
        const level = staticEntries.reduce(
          (best, staticEntry) =>
            Math.max(
              best,
              getEntryMatchLevel(staticEntry, menuEntry, root.fullPath, menuRoot.path)
            ),
          0
        )
        return total + level
      }, 0)
      return { root, score }
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)

  if (!scoredRoots.length || scoredRoots[0].score === scoredRoots[1]?.score) return undefined
  return scoredRoots[0].root
}

const findStaticEntry = (
  staticEntries: IndexedRoute[],
  menuEntry: MenuAuthorizationEntry,
  staticRootPath: string,
  menuRootPath: string,
  usedPaths: ReadonlySet<string>
): IndexedRoute | undefined => {
  const candidates = staticEntries.filter((entry) => !usedPaths.has(entry.fullPath))
  for (const level of [3, 2, 1]) {
    const matches = candidates.filter(
      (entry) => getEntryMatchLevel(entry, menuEntry, staticRootPath, menuRootPath) === level
    )
    if (matches.length === 1) return matches[0]
    if (matches.length > 1) return undefined
  }
  return undefined
}

const translateMappedPath = (path: string, pathMap: ReadonlyMap<string, string>): string => {
  const normalizedPath = normalizePath(path)
  const directPath = pathMap.get(normalizedPath)
  if (directPath) return directPath

  const mappedAncestor = [...pathMap.entries()]
    .filter(([staticPath]) => normalizedPath.startsWith(`${staticPath}/`))
    .sort(([left], [right]) => right.length - left.length)[0]
  if (!mappedAncestor) return normalizedPath
  return `${mappedAncestor[1]}${normalizedPath.slice(mappedAncestor[0].length)}`
}

const rebaseFilteredRoutes = (
  routes: AppRouteRecordRaw[],
  pathMap: ReadonlyMap<string, string>,
  staticParentPath = '/',
  outputParentPath = '/'
): AppRouteRecordRaw[] =>
  routes.map((route) => {
    const staticFullPath = resolveFullPath(staticParentPath, route.path)
    const outputFullPath = translateMappedPath(staticFullPath, pathMap)
    const isRoot = outputParentPath === '/'
    const path =
      isRoot || !outputFullPath.startsWith(`${outputParentPath}/`)
        ? outputFullPath
        : outputFullPath.slice(outputParentPath.length + 1)
    const meta = { ...route.meta }
    if (meta.followRoute) meta.followRoute = translateMappedPath(meta.followRoute, pathMap)
    if (meta.activeMenu) meta.activeMenu = translateMappedPath(meta.activeMenu, pathMap)
    const children = route.children
      ? rebaseFilteredRoutes(route.children, pathMap, staticFullPath, outputFullPath)
      : undefined
    const rebasedRoute: AppRouteRecordRaw = { ...route, path, meta, children }

    if (typeof rebasedRoute.redirect === 'string') {
      rebasedRoute.redirect = translateMappedPath(
        resolveRedirectPath(rebasedRoute.redirect, staticFullPath),
        pathMap
      )
      if (children?.length) {
        const retainedPaths = collectRoutePaths(children, outputFullPath)
        if (!retainedPaths.has(rebasedRoute.redirect)) {
          const fallback = firstVisibleChildPath(children, outputFullPath)
          if (fallback) rebasedRoute.redirect = fallback
          else delete rebasedRoute.redirect
        }
      }
    }

    return rebasedRoute
  })

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

export const filterAsyncRoutesByMenus = (
  routes: AppRouteRecordRaw[],
  authorization: MenuAuthorizationResult
): AsyncRouteFilterResult => {
  const staticAuthorizedPaths = new Set<string>()
  const staticIcons = new Map<string, string>()
  const pathMap = new Map<string, string>()
  const usedRootPaths = new Set<string>()
  const warnings: string[] = []
  const menuRoots = authorization.entries.filter((entry) => entry.parentPath === '/')

  for (const menuRoot of menuRoots) {
    const menuEntries = getMenuBranchEntries(menuRoot, authorization.entries)
    const staticRoot = findStaticRoot(routes, menuRoot, menuEntries, usedRootPaths)
    if (!staticRoot) {
      for (const entry of menuEntries) {
        warnings.push(`菜单路径未在 asyncRouterMap 中登记，已忽略：${entry.path}`)
      }
      continue
    }

    usedRootPaths.add(staticRoot.fullPath)
    staticAuthorizedPaths.add(staticRoot.fullPath)
    pathMap.set(staticRoot.fullPath, menuRoot.path)
    const rootIcon = authorization.icons.get(menuRoot.path)
    if (rootIcon) staticIcons.set(staticRoot.fullPath, rootIcon)

    const staticEntries = indexRouteBranch(staticRoot.route).slice(1)
    const usedStaticPaths = new Set<string>()
    for (const menuEntry of menuEntries.slice(1)) {
      const staticEntry = findStaticEntry(
        staticEntries,
        menuEntry,
        staticRoot.fullPath,
        menuRoot.path,
        usedStaticPaths
      )
      if (!staticEntry) {
        warnings.push(`菜单路径未在 asyncRouterMap 中登记，已忽略：${menuEntry.path}`)
        continue
      }

      usedStaticPaths.add(staticEntry.fullPath)
      staticAuthorizedPaths.add(staticEntry.fullPath)
      pathMap.set(staticEntry.fullPath, menuEntry.path)
      const icon = authorization.icons.get(menuEntry.path)
      if (icon) staticIcons.set(staticEntry.fullPath, icon)
    }
  }

  const filtered = filterAsyncRoutes(routes, staticAuthorizedPaths, staticIcons)
  return {
    routes: rebaseFilteredRoutes(filtered.routes, pathMap),
    warnings: [...warnings, ...filtered.warnings]
  }
}

export const isProductionRouteEnvironment = (
  envType = import.meta.env.VITE_ENV_TYPE as string | undefined
): boolean => envType === 'pro'

export const resolvePermissionRoutes = (
  routes: AppRouteRecordRaw[],
  response: BackendMenuResponse | undefined,
  envType = import.meta.env.VITE_ENV_TYPE as string | undefined
): AsyncRouteFilterResult => {
  if (!isProductionRouteEnvironment(envType)) return { routes: cloneRoutes(routes), warnings: [] }

  const menus = response === undefined ? null : normalizeBackendMenus(response)
  if (!menus) throw new Error('菜单解析失败')
  const authorization = extractAuthorizedMenuPaths(menus)
  const filtered = filterAsyncRoutesByMenus(routes, authorization)
  return {
    routes: filtered.routes,
    warnings: [...authorization.warnings, ...filtered.warnings]
  }
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
    prepareRoutes(response?: BackendMenuResponse): AppRouteRecordRaw[] {
      const result = resolvePermissionRoutes(asyncRouterMap, response)
      for (const warning of result.warnings) console.warn(warning)
      return result.routes
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
