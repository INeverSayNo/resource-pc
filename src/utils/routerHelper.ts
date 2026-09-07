import { defineComponent, h } from 'vue'
import { RouterView } from 'vue-router'

const modules = import.meta.glob('../views/**/*.{vue,tsx}')

export const Layout = () => import('@/layout/Layout.vue')

export const isUrl = (path: string) => /^(?:https?:|mailto:|tel:)/.test(path)

const createParentView = (name: string) =>
  defineComponent({
    name: name || 'ParentView',
    setup: () => () => h(RouterView)
  })

export const generateRoutesByServer = (routes: AppCustomRouteRecordRaw[]): AppRouteRecordRaw[] => {
  const result: AppRouteRecordRaw[] = []

  for (const route of routes) {
    const component = route.component
    let resolvedComponent: AppRouteRecordRaw['component']
    if (component === '#') {
      resolvedComponent = Layout
    } else if (component.startsWith('##')) {
      resolvedComponent = createParentView(component.slice(2))
    } else {
      resolvedComponent = modules[`../${component}.vue`] || modules[`../${component}.tsx`]
      if (!resolvedComponent) {
        console.error(`未找到 ${component}.vue 或 ${component}.tsx，已跳过该菜单`)
        continue
      }
    }

    const children = route.children ? generateRoutesByServer(route.children) : undefined
    if (route.children?.length && !children?.length) continue

    result.push({
      path: route.path,
      name: route.name,
      redirect: route.redirect,
      meta: route.meta,
      props: route.props,
      component: resolvedComponent,
      children
    } as AppRouteRecordRaw)
  }
  return result
}

export const pathResolve = (parentPath: string, path: string) => {
  if (isUrl(path) || path.startsWith('/')) return path
  const childPath = path ? `/${path}` : path
  return `${parentPath}${childPath}`.replace(/\/\//g, '/').trim()
}
