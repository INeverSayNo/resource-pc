import type { App } from 'vue'
import DAliIcon from './SvgIcon/AliIcon'
import ComDialog from './ComDialog/index.vue'

export const setupGlobCom = (app: App<Element>): void => {
  app.component('DAliIcon', DAliIcon)
  app.component('ComDialog', ComDialog)
}
