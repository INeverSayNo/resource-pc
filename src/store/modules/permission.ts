import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import router, { constantRouterMap } from '@/router'
import type { BackendMenuResponse } from '@/api/login/types'
import type { ApiResult } from '@/request'
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

const installRouteSet = (routes: AppRouteRecordRaw[]): ApiResult<boolean> => {
  const removers: Array<() => void> = []
  try {
    for (const route of routes) {
      if (!isUrl(route.path)) removers.push(router.addRoute(route as RouteRecordRaw))
    }
    dynamicRouteRemovers = removers
    return [null, true]
  } catch (error) {
    for (const removeRoute of removers.reverse()) removeRoute()
    return [error instanceof Error ? error : new Error('动态路由注册失败'), null]
  }
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: [...constantRouterMap],
    addRouters: [],
    isAddRouters: false
  }),
  getters: {
    homePath: () => '/dashboard/index'
  },
  actions: {
    prepareRoutes(response: BackendMenuResponse): ApiResult<AppRouteRecordRaw[]> {
      const [normalizeError, menus] = normalizeBackendMenus(response)
      if (normalizeError || !menus) return [normalizeError || new Error('菜单解析失败'), null]
      const adapted = adaptBackendMenus(menus, getStaticPaths(constantRouterMap))
      for (const warning of adapted.warnings) console.warn(warning)
      return [null, generateRoutesByServer(adapted.routes)]
    },
    replaceRoutes(routes: AppRouteRecordRaw[]): ApiResult<boolean> {
      const previousRoutes = this.addRouters
      removeInstalledRoutes()
      const [installError] = installRouteSet(routes)
      if (installError) {
        const [rollbackError] = installRouteSet(previousRoutes)
        this.addRouters = previousRoutes
        this.routers = constantRouterMap.concat(previousRoutes)
        this.isAddRouters = true
        if (rollbackError) {
          console.error('旧动态路由恢复失败', rollbackError)
          this.reset()
        }
        return [installError, null]
      }

      this.addRouters = routes
      this.routers = constantRouterMap.concat(routes)
      this.isAddRouters = true
      return [null, true]
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
