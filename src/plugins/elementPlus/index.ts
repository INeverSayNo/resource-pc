import type { App } from 'vue'

import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

export const setupElementPlus = (app: App<Element>) => {
  app.use(ElementPlus, {
    locale: zhCn,
    zIndex: 2000
  })
}
