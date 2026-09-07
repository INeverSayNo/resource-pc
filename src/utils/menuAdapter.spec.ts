import { describe, expect, it } from 'vitest'
import { adaptBackendMenus, normalizeBackendMenus } from './menuAdapter'

describe('menu adapter', () => {
  it('normalizes string and single-object responses', () => {
    expect(normalizeBackendMenus('{"code":"root"}')[1]).toHaveLength(1)
    expect(normalizeBackendMenus({ code: 'root' })[1]).toHaveLength(1)
    expect(normalizeBackendMenus('invalid')[0]).toBeInstanceOf(Error)
  })

  it('converts nested routes, query props and namespaced names', () => {
    const result = adaptBackendMenus([
      {
        featureUrl: '/orders',
        featureName: '订单',
        childModules: [
          {
            featureUrl: '/list?status=open',
            featureName: '列表',
            featureControllerName: 'Order/List',
            featureIsMenu: true
          }
        ]
      }
    ])
    expect(result.routes[0].name).toBe('remote:/orders')
    expect(result.routes[0].children?.[0]).toMatchObject({
      path: 'list',
      name: 'remote:/orders/list',
      component: 'views/Order/List',
      props: { status: 'open' }
    })
    expect(result.routes[0].redirect).toBe('/orders/list')
  })

  it('skips duplicate and reserved paths', () => {
    const result = adaptBackendMenus(
      [
        { featureUrl: '/dashboard', featureControllerName: 'Dashboard/index' },
        { featureUrl: '/same', featureControllerName: 'Level/Menu2' },
        { featureUrl: '/same', featureControllerName: 'Level/Menu2' }
      ],
      new Set(['/dashboard'])
    )
    expect(result.routes.map((route) => route.path)).toEqual(['/same'])
    expect(result.warnings).toHaveLength(2)
  })

  it('skips a leaf route without a page component', () => {
    const result = adaptBackendMenus([{ featureUrl: '/missing' }])
    expect(result.routes).toEqual([])
    expect(result.warnings[0]).toContain('缺少页面组件')
  })
})
