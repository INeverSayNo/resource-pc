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
      icon: 'example',
      title: '资源应用工具'
    },
    children: [
      {
        path: 'station',
        component: () => import('@/views/railway/station/listNew.vue'),
        name: 'station',
        meta: {
          title: '车站信息'
        }
      },
      {
        path: 'station-dt',
        component: () => import('@/views/railway/station/index.vue'),
        name: 'stationDt',
        meta: {
          noTagsView: false,
          noCache: true,
          hidden: true,
          showMainRoute: true,
          followRoute: '/resource-app/station',
          activeMenu: '/resource-app/station',
          title: '车站详情'
        }
      },
      {
        path: 'station-map',
        component: () => import('@/views/railway/stationMap/map.vue'),
        name: 'station-map',
        meta: {
          title: '站点地图'
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
