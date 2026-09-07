import type { App } from 'vue'
import SvgIcon from './SvgIcon/index.vue'

export const setupGlobCom = (app: App<Element>): void => {
  app.component('SvgIcon', SvgIcon)
}
