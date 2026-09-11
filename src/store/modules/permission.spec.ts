import { describe, expect, it } from 'vitest'
import { asyncRouterMap } from '@/router'
import { extractAuthorizedMenuPaths, normalizeBackendMenus } from '@/utils/menuAdapter'
import { filterAsyncRoutes } from './permission'

const page = () => Promise.resolve({ default: {} })

const authorize = (childModules: Array<Record<string, unknown>>) => {
  const authorization = extractAuthorizedMenuPaths([
    {
      featureUrl: '/resource-app',
      featureName: '接口中的资源平台标题',
      icon: 'remote-icon',
      childModules
    }
  ])
  return filterAsyncRoutes(asyncRouterMap, authorization.paths, authorization.icons)
}

describe('asyncRouterMap route authorization', () => {
  it('registers the station page and its hidden detail route only', () => {
    const filtered = authorize([
      {
        featureUrl: 'station',
        featureName: '接口车站标题',
        featureControllerName: 'missing/controller'
      }
    ])

    expect(filtered.warnings).toEqual([])
    expect(filtered.routes).toHaveLength(1)
    expect(filtered.routes[0].children?.map((route) => route.path)).toEqual([
      'station',
      'station-dt'
    ])
    expect(filtered.routes[0].children?.[0].meta.title).toBe('车站信息')
    expect(filtered.routes[0].children?.[0].component).toBe(
      asyncRouterMap[0].children?.[0].component
    )
    expect(filtered.routes[0].children?.[1].meta.hidden).toBe(true)
    expect(filtered.routes[0].children?.filter((route) => !route.meta.hidden)).toHaveLength(1)
  })

  it('merges backend meta icons without overriding static route metadata', () => {
    const filtered = authorize([
      {
        featureUrl: 'station',
        featureName: '接口车站标题',
        featureControllerName: 'missing/controller',
        meta: { icon: 'railway-station', title: '不应覆盖的标题' }
      }
    ])

    expect(filtered.routes[0].meta.icon).toBe('remote-icon')
    expect(filtered.routes[0].meta.title).toBe('资源应用工具')
    expect(filtered.routes[0].children?.[0].meta.icon).toBe('railway-station')
    expect(filtered.routes[0].children?.[0].meta.title).toBe('车站信息')
    expect(filtered.routes[0].children?.[0].component).toBe(
      asyncRouterMap[0].children?.[0].component
    )
    expect(asyncRouterMap[0].meta.icon).toBeUndefined()
    expect(asyncRouterMap[0].children?.[0].meta.icon).toBeUndefined()
  })

  it('registers the waterway page and changes an unauthorized redirect', () => {
    const filtered = authorize([
      {
        featureUrl: 'waterwayport?source=menu',
        featureControllerName: ''
      }
    ])

    expect(filtered.routes[0].redirect).toBe('/resource-app/waterwayport')
    expect(filtered.routes[0].children?.map((route) => route.path)).toEqual([
      'waterwayport',
      'waterway-port-dt'
    ])
  })

  it('keeps one parent route when multiple main pages are authorized', () => {
    const filtered = authorize([{ featureUrl: 'station' }, { featureUrl: 'waterwayport' }])

    expect(filtered.routes).toHaveLength(1)
    expect(filtered.routes[0].name).toBe('ResourceApp')
    expect(filtered.routes[0].children?.map((route) => route.path)).toEqual([
      'station',
      'station-dt',
      'waterwayport',
      'waterway-port-dt'
    ])
  })

  it('registers the private-line page when it is authorized', () => {
    const filtered = authorize([{ featureUrl: 'private-line' }])

    expect(filtered.routes).toHaveLength(1)
    expect(filtered.routes[0].redirect).toBe('/resource-app/private-line')
    expect(filtered.routes[0].children?.map((route) => route.path)).toEqual(['private-line'])
    expect(filtered.routes[0].children?.[0].meta.title).toBe('专用线信息库')
  })

  it('does not register the private-line page when it is unauthorized', () => {
    const filtered = authorize([{ featureUrl: 'station' }])

    expect(filtered.routes[0].children?.some((route) => route.path === 'private-line')).toBe(false)
  })

  it('does not register a hidden detail route when its main page is unauthorized', () => {
    const filtered = authorize([{ featureUrl: 'waterwayport' }])

    expect(filtered.routes[0].children?.some((route) => route.path === 'station-dt')).toBe(false)
  })

  it('allows an explicitly authorized hidden route without followRoute permission', () => {
    const routes = [
      {
        path: '/reports',
        name: 'Reports',
        meta: { title: '报表' },
        children: [
          {
            path: 'detail',
            name: 'ReportDetail',
            component: page,
            meta: { title: '详情', hidden: true }
          }
        ]
      }
    ] as AppRouteRecordRaw[]

    expect(filterAsyncRoutes(routes, new Set(['/reports/detail'])).routes[0].children).toHaveLength(
      1
    )
    expect(filterAsyncRoutes(routes, new Set(['/reports'])).routes).toEqual([])
  })

  it('warns and rejects a hidden route whose followRoute is not configured', () => {
    const routes = [
      {
        path: '/reports',
        name: 'Reports',
        meta: { title: '报表' },
        children: [
          {
            path: 'detail',
            name: 'ReportDetail',
            component: page,
            meta: { title: '详情', hidden: true, followRoute: '/reports/list' }
          }
        ]
      }
    ] as AppRouteRecordRaw[]
    const filtered = filterAsyncRoutes(routes, new Set(['/reports/list']))

    expect(filtered.routes).toEqual([])
    expect(filtered.warnings).toContain(
      '路由 /reports/detail 的 followRoute 未在 asyncRouterMap 中登记：/reports/list'
    )
  })

  it('warns about backend menu paths missing from asyncRouterMap', () => {
    const filtered = authorize([{ featureUrl: 'not-configured' }])

    expect(filtered.routes).toEqual([])
    expect(filtered.warnings).toContain(
      '菜单路径未在 asyncRouterMap 中登记，已忽略：/resource-app/not-configured'
    )
  })

  it('does not mutate asyncRouterMap while filtering', () => {
    const originalChildren = asyncRouterMap[0].children
    const originalRedirect = asyncRouterMap[0].redirect

    authorize([{ featureUrl: 'waterwayport' }])

    expect(asyncRouterMap[0].children).toBe(originalChildren)
    expect(asyncRouterMap[0].children).toHaveLength(5)
    expect(asyncRouterMap[0].redirect).toBe(originalRedirect)
  })
})

describe('backend menu authorization paths', () => {
  it('normalizes JSON responses, nested paths and query strings', () => {
    const menus = normalizeBackendMenus(
      JSON.stringify({
        featureUrl: '//resource-app/',
        childModules: [{ featureUrl: '/station?source=shortcut#top' }]
      })
    )
    expect(menus).not.toBeNull()

    const result = extractAuthorizedMenuPaths(menus ?? [])
    expect([...result.paths]).toEqual(['/resource-app', '/resource-app/station'])
    expect(result.icons.size).toBe(0)
  })

  it('extracts meta.icon and supports legacy top-level icon fields', () => {
    const result = extractAuthorizedMenuPaths([
      {
        featureUrl: '/resource-app',
        meta: { icon: ' resource-app ' },
        icon: 'ignored-icon',
        childModules: [
          { featureUrl: 'station', icon: 'station-icon' },
          { featureUrl: 'private-line', menuIcon: 'private-line-icon' }
        ]
      }
    ])

    expect([...result.icons]).toEqual([
      ['/resource-app', 'resource-app'],
      ['/resource-app/station', 'station-icon'],
      ['/resource-app/private-line', 'private-line-icon']
    ])
  })

  it('accepts an absolute child path that already contains its parent path', () => {
    const result = extractAuthorizedMenuPaths([
      {
        featureUrl: '/resource-app',
        childModules: [{ featureUrl: '/resource-app/station' }]
      }
    ])

    expect([...result.paths]).toEqual(['/resource-app', '/resource-app/station'])
  })

  it('uses menuCode as a path fallback and reports duplicates and missing paths', () => {
    const result = extractAuthorizedMenuPaths([
      { menuCode: 'resource-app' },
      { featureUrl: '/resource-app' },
      { featureName: '无路径菜单' }
    ])

    expect([...result.paths]).toEqual(['/resource-app'])
    expect(result.warnings).toEqual([
      '菜单路径重复，已忽略：/resource-app',
      '菜单 无路径菜单 缺少路径'
    ])
  })

  it('returns no dynamic routes for an empty authorization set', () => {
    expect(filterAsyncRoutes(asyncRouterMap, new Set()).routes).toEqual([])
  })
})
