import { describe, expect, it } from 'vitest'
import { generateRoutesByServer } from './routerHelper'

describe('server route component resolution', () => {
  it('skips a missing page and its now-empty parent', () => {
    const routes = generateRoutesByServer([
      {
        path: '/missing-parent',
        name: 'remote:/missing-parent',
        component: '#',
        meta: {},
        children: [
          {
            path: 'missing-child',
            name: 'remote:/missing-parent/missing-child',
            component: 'views/DoesNotExist/index',
            meta: {}
          }
        ]
      }
    ])

    expect(routes).toEqual([])
  })

  it('creates a real Parent View for ## components', () => {
    const routes = generateRoutesByServer([
      {
        path: '/nested',
        name: 'remote:/nested',
        component: '##NestedParent',
        meta: {},
        children: [
          {
            path: 'dashboard',
            name: 'remote:/nested/dashboard',
            component: 'views/Dashboard/index',
            meta: {}
          }
        ]
      }
    ])

    expect(routes).toHaveLength(1)
    expect(routes[0].component).toMatchObject({ name: 'NestedParent' })
    expect(routes[0].children).toHaveLength(1)
  })
})
