import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import router, { constantRouterMap } from '@/router'
import type { BackendMenuResponse } from '@/api/login/types'
import { adaptBackendMenus, normalizeBackendMenus } from '@/utils/menuAdapter'
import { generateRoutesByServer, isUrl } from '@/utils/routerHelper'
import { store } from '../index'

const env = import.meta.env.VITE_ENV_TYPE || 'dev'

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
      const adapted = adaptBackendMenus(menus, getStaticPaths(constantRouterMap))
      for (const warning of adapted.warnings) console.warn(warning)
      console.log(adapted.routes)
      console.log(generateRoutesByServer(adapted.routes))
      return generateRoutesByServer(adapted.routes)
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
