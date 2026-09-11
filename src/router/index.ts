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
        path: 'good-price-policy',
        component: () => import('@/views/railway/good-price-policy/search.vue'),
        name: 'GoodPricePolicySearch',
        meta: { title: '优价政策查询' }
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
      },
      {
        path: 'stop-loading',
        component: () => import('@/views/railway/stopLoad/index.vue'),
        name: 'StopLoading',
        meta: { title: '停限装解析' }
      },
      {
        path: 'stop-loading-config',
        component: () => import('@/views/railway/stopLoad/config.vue'),
        name: 'StopLoadingConfig',
        meta: { title: '停限装提醒配置' }
      }
    ]
  },
   {
    path: "/user-auth",
    name: "UserAuth",
    component: Layout,
    redirect: "/user-auth/user-manager",
    meta: {
      title: "会员权限"
    },
    children: [
      {
        path: "user-manager",
        component: () => import("@/views/userManage/index.vue"),
        name: "UserManager",
        meta: {
          title: "用户管理"
        }
      },
      // {
      //   path: "feature-manager",
      //   component: () => import("_v/featureManage/index.vue"),
      //   name: "FeatureManager",
      //   meta: {
      //     title: "功能管理"
      //   }
      // },
      // {
      //   path: "auth-manager",
      //   component: () => import("_v/authManage/index.vue"),
      //   name: "AuthManager",
      //   meta: {
      //     title: "权限管理"
      //   }
      // },
      // {
      //   path: "/membership-index",
      //   component: () =>
      //     import("_v/DCZY/MembershipBenefits/BenefitsConfig/index.vue"),
      //   name: "MembershipIndex",
      //   meta: {
      //     title: "会员权益配置"
      //   }
      // },
      // {
      //   path: "/membership-remark",
      //   component: () =>
      //     import("_v/DCZY/MembershipBenefits/MembershipRemark/index.vue"),
      //   name: "MembershipRemark",
      //   meta: {
      //     title: "会员权益描述"
      //   }
      // },
      // {
      //   path: "/priceDiscountConfig-index",
      //   component: () =>
      //     import("_v/DCZY/MembershipBenefits/PriceDiscountConfig/index.vue"),
      //   name: "PriceDiscountConfigIndex",
      //   meta: {
      //     title: "付费折扣配置"
      //   }
      // },
      // {
      //   path: "/tasksAndRewards-index",
      //   component: () => import("_v/DCZY/UserTasks/TasksAndRewards/index.vue"),
      //   name: "TasksAndRewardsIndex",
      //   meta: {
      //     title: "任务奖励配置"
      //   }
      // },
      // {
      //   path: "/sales-index",
      //   component: () => import("_v/DCZY/Sales/config.vue"),
      //   name: "SalesIndex",
      //   meta: {
      //     title: "销售档位配置"
      //   }
      // }
    ]
  },
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
