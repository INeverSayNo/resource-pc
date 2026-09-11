import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout } from '@/utils/routerHelper'

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'Root',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: {
          title: '首页',
          affix: true,
          alwaysShow: true,
          icon: 'solution-map'
        }
      }
    ],
    meta: {}
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'RedirectWrap',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: '登录',
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/Error/404.vue'),
    name: 'Fallback',
    meta: {
      hidden: true,
      breadcrumb: false,
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/resource-app',
    component: Layout,
    name: 'ResourceApp',
    redirect: '/resource-app/station',
    meta: {
      alwaysShow: true,
      title: '资源应用工具'
    },
    children: [
      {
        path: 'station',
        component: () => import('@/views/railway/station/listNew.vue'),
        name: 'RailwayStation',
        meta: { title: '车站信息' }
      },
      {
        path: 'station-dt',
        component: () => import('@/views/railway/station/index.vue'),
        name: 'RailwayStationDetail',
        meta: {
          title: '车站详情',
          hidden: true,
          noCache: true,
          noTagsView: false,
          showMainRoute: true,
          followRoute: '/resource-app/station',
          activeMenu: '/resource-app/station'
        }
      },
      {
        path: 'private-line',
        component: () => import('@/views/railway/privateLine/index.vue'),
        name: 'RailwayPrivateLine',
        meta: { title: '专用线信息库' }
      },
      {
        path: 'waterwayport',
        component: () => import('@/views/waterway/station/index.vue'),
        name: 'WaterwayPort',
        meta: { title: '港口信息' }
      },
      {
        path: 'waterway-port-dt',
        component: () => import('@/views/waterway/station/details.vue'),
        name: 'WaterwayPortDetail',
        meta: {
          title: '港口详情',
          hidden: true,
          noCache: true,
          noTagsView: false,
          showMainRoute: true,
          followRoute: '/resource-app/waterwayport',
          activeMenu: '/resource-app/waterwayport'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
