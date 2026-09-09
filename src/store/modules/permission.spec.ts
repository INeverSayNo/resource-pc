import { describe, expect, it } from 'vitest'
import { mergeAuthorizedStaticRoutes } from './permission'

const page = () => Promise.resolve({ default: {} })

describe('mergeAuthorizedStaticRoutes', () => {
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
})
