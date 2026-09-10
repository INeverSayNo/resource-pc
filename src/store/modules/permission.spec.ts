import { describe, expect, it } from 'vitest'
import { asyncRouterMap } from '@/router'
import { adaptBackendMenus } from '@/utils/menuAdapter'
import { generateRoutesByServer } from '@/utils/routerHelper'
import { mergeAuthorizedStaticRoutes } from './permission'

const page = () => Promise.resolve({ default: {} })

describe('mergeAuthorizedStaticRoutes', () => {
  it('resolves the backend waterway controller and injects its authorized detail route', () => {
    const adapted = adaptBackendMenus([
      {
        featureUrl: '/resource-app',
        featureName: '资源平台',
        childModules: [
          {
            featureUrl: 'waterwayport',
            featureName: '港口信息',
            featureControllerName: 'waterway/station/index'
          }
        ]
      }
    ])

    expect(adapted.warnings).toEqual([])
    const generated = generateRoutesByServer(adapted.routes)
    expect(generated[0].children?.[0].component).toBeTypeOf('function')

    const routes = mergeAuthorizedStaticRoutes(generated, asyncRouterMap)
    expect(routes[0].children?.map((route) => route.path)).toEqual([
      'waterwayport',
      'waterway-port-dt'
    ])
  })

  it('only exposes railway detail routes when station menu is authorized', () => {
    const serverRoutes = [
      {
        path: '/resource-app',
        name: 'server-resource-app',
        meta: {},
        children: [{ path: 'station', name: 'server-station', meta: {}, component: page }]
      }
    ] as AppRouteRecordRaw[]
    const staticRoutes = [
      {
        path: '/resource-app',
        name: 'pilot',
        meta: {},
        children: [
          { path: 'station', name: 'station', meta: {}, component: page },
          { path: 'station-dt', name: 'station-detail', meta: { hidden: true }, component: page },
          { path: 'station-map', name: 'station-map', meta: {}, component: page }
        ]
      }
    ] as AppRouteRecordRaw[]

    const routes = mergeAuthorizedStaticRoutes(serverRoutes, staticRoutes)
    expect(routes[0].children?.map((route) => route.path)).toEqual([
      'station',
      'station-dt',
      'station-map'
    ])
  })

  it('does not create a hidden back door without the station menu', () => {
    const serverRoutes = [
      {
        path: '/resource-app',
        name: 'server-resource-app',
        meta: {},
        children: [{ path: 'other', name: 'other', meta: {}, component: page }]
      }
    ] as AppRouteRecordRaw[]
    const staticRoutes = [
      {
        path: '/resource-app',
        name: 'pilot',
        meta: {},
        children: [
          { path: 'station', name: 'station', meta: {}, component: page },
          { path: 'station-dt', name: 'station-detail', meta: {}, component: page }
        ]
      }
    ] as AppRouteRecordRaw[]

    expect(mergeAuthorizedStaticRoutes(serverRoutes, staticRoutes)[0].children).toHaveLength(1)
  })

  it('authorizes each static slice by its own menu anchor', () => {
    const serverRoutes = [
      {
        path: '/resource-app',
        name: 'server-resource-app',
        meta: {},
        children: [{ path: 'waterwayport', name: 'server-waterway', meta: {}, component: page }]
      }
    ] as AppRouteRecordRaw[]
    const staticRoutes = [
      {
        path: '/resource-app',
        name: 'railway',
        meta: {},
        children: [
          { path: 'station', name: 'station', meta: {}, component: page },
          { path: 'station-dt', name: 'station-detail', meta: { hidden: true }, component: page }
        ]
      },
      {
        path: '/resource-app',
        name: 'waterway',
        meta: {},
        children: [
          { path: 'waterwayport', name: 'waterwayport', meta: {}, component: page },
          {
            path: 'waterway-port-dt',
            name: 'waterway-detail',
            meta: { hidden: true },
            component: page
          }
        ]
      }
    ] as AppRouteRecordRaw[]

    const routes = mergeAuthorizedStaticRoutes(serverRoutes, staticRoutes)
    expect(routes[0].children?.map((route) => route.path)).toEqual([
      'waterwayport',
      'waterway-port-dt'
    ])
    expect(routes[0].children?.some((route) => route.path === 'station-dt')).toBe(false)
  })

  it('does not expose waterway detail to a railway-only menu', () => {
    const serverRoutes = [
      {
        path: '/resource-app',
        name: 'server-resource-app',
        meta: {},
        children: [{ path: 'station', name: 'server-station', meta: {}, component: page }]
      }
    ] as AppRouteRecordRaw[]
    const waterwayRoutes = [
      {
        path: '/resource-app',
        name: 'waterway',
        meta: {},
        children: [
          { path: 'waterwayport', name: 'waterwayport', meta: {}, component: page },
          { path: 'waterway-port-dt', name: 'waterway-detail', meta: {}, component: page }
        ]
      }
    ] as AppRouteRecordRaw[]

    const routes = mergeAuthorizedStaticRoutes(serverRoutes, waterwayRoutes)
    expect(routes[0].children?.map((route) => route.path)).toEqual(['station'])
  })

  it('keeps railway and waterway slices independent when both menus are authorized', () => {
    const serverRoutes = [
      {
        path: '/resource-app',
        name: 'server-resource-app',
        meta: {},
        children: [
          { path: 'station', name: 'server-station', meta: {}, component: page },
          { path: 'waterwayport', name: 'server-waterway', meta: {}, component: page }
        ]
      }
    ] as AppRouteRecordRaw[]
    const staticRoutes = [
      {
        path: '/resource-app',
        name: 'railway',
        meta: {},
        children: [
          { path: 'station', name: 'station', meta: {}, component: page },
          { path: 'station-dt', name: 'station-detail', meta: {}, component: page }
        ]
      },
      {
        path: '/resource-app',
        name: 'waterway',
        meta: {},
        children: [
          { path: 'waterwayport', name: 'waterwayport', meta: {}, component: page },
          { path: 'waterway-port-dt', name: 'waterway-detail', meta: {}, component: page }
        ]
      }
    ] as AppRouteRecordRaw[]

    const routes = mergeAuthorizedStaticRoutes(serverRoutes, staticRoutes)
    expect(routes[0].children?.map((route) => route.path)).toEqual([
      'station',
      'waterwayport',
      'station-dt',
      'waterway-port-dt'
    ])
  })
})
