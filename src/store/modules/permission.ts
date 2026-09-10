import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import router, { asyncRouterMap, constantRouterMap } from '@/router'
import type { BackendMenuResponse } from '@/api/login/types'
import { adaptBackendMenus, normalizeBackendMenus } from '@/utils/menuAdapter'
import { generateRoutesByServer, isUrl } from '@/utils/routerHelper'
import { store } from '../index'

let dynamicRouteRemovers: Array<() => void> = []

export interface PermissionState {
  routers: AppRouteRecordRaw[]
  addRouters: AppRouteRecordRaw[]
  isAddRouters: boolean
}

const removeInstalledRoutes = (): void => {
  for (const removeRoute of [...dynamicRouteRemovers].reverse()) removeRoute()
  dynamicRouteRemovers = []
}

const getStaticPaths = (
  routes: AppRouteRecordRaw[],
  parentPath = '/',
  result = new Set<string>()
): Set<string> => {
  for (const route of routes) {
    const fullPath = isUrl(route.path)
      ? route.path
      : route.path.startsWith('/')
        ? route.path
        : `${parentPath}/${route.path}`.replace(/\/+/g, '/')
    result.add(fullPath)
    if (route.children) getStaticPaths(route.children, fullPath, result)
  }
  return result
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

export const mergeAuthorizedStaticRoutes = (
  serverRoutes: AppRouteRecordRaw[],
  staticRoutes: AppRouteRecordRaw[] = asyncRouterMap
): AppRouteRecordRaw[] => {
  const result = [...serverRoutes]
  for (const staticParent of staticRoutes) {
    const serverParent = result.find((route) => route.path === staticParent.path)
    if (!serverParent?.children?.length || !staticParent.children?.length) continue
    const authorizedPilot = staticParent.children[0]
    if (!authorizedPilot) continue
    const serverPilot = serverParent.children.find((child) => child.path === authorizedPilot.path)
    if (!serverPilot) continue

    if (authorizedPilot?.component) serverPilot.component = authorizedPilot.component
    serverPilot.meta = { ...serverPilot.meta, ...authorizedPilot?.meta }

    for (const child of staticParent.children) {
      if (child.path === authorizedPilot.path) continue
      const existing = serverParent.children.find((item) => item.path === child.path)
      if (existing) {
        existing.component = child.component
        existing.meta = { ...existing.meta, ...child.meta }
      } else {
        serverParent.children.push(child)
      }
    }
  }
  return result
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
      const adapted = adaptBackendMenus(menus, getStaticPaths([...constantRouterMap]))
      for (const warning of adapted.warnings) console.warn(warning)
      return mergeAuthorizedStaticRoutes(generateRoutesByServer(adapted.routes))
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
