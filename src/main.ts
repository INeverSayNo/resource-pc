import 'vue/jsx'
import 'virtual:uno.css'

// 引入状态管理
import { setupStore } from '@/store'

// 全局组件
import { setupGlobCom } from '@/components'

// 引入element-plus
import { setupElementPlus } from '@/plugins/elementPlus'

// 引入全局样式
import '@/styles/index.less'

// 路由
import { setupRouter } from './router'

import { createApp } from 'vue'

import App from './App.vue'

import { setupPermission } from './permission'
import { setupAuth } from './auth/setup'
import { setupMonitor } from './plugins/monitor'
import { setupDirectives } from './directives'
import { createPrivatePhone } from '@/components/PrivatePhone/createPrivatePhone'
import setupDczyTiePC from './plugins/tiePc'

const getPrivatePhone = (value: string | number): string => {
  if (!value) return ''
  const phone = String(value)
  return `${phone.slice(0, 3)}${'*'.repeat(4)}${phone.slice(-4)}`
}

// 创建实例
const setupAll = async () => {
  const app = createApp(App)

  setupStore(app)

  setupMonitor(app)

  setupAuth()

  app.config.globalProperties.getPrivatePhone = getPrivatePhone
  app.config.globalProperties.createPrivatePhone = (value: string | number) =>
    createPrivatePhone(String(value))
  window.getPrivatePhone = getPrivatePhone

  setupDirectives(app)

  setupDczyTiePC(app)

  await setupPermission()

  setupGlobCom(app)

  setupElementPlus(app)

  setupRouter(app)

  app.mount('#app')
}

setupAll()
