import type { BackendMenuNode, BackendMenuResponse } from '@/api/login/types'
import type { ApiResult } from '@/request'
import { isUrl, pathResolve } from './routerHelper'

const isMenuNode = (value: unknown): value is BackendMenuNode =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const normalizeBackendMenus = (value: BackendMenuResponse): ApiResult<BackendMenuNode[]> => {
  try {
    const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value
    if (Array.isArray(parsed)) {
      if (!parsed.every(isMenuNode)) return [new Error('菜单响应包含无效节点'), null]
      return [null, parsed]
    }
    if (isMenuNode(parsed)) return [null, [parsed]]
    return [new Error('菜单响应格式无效'), null]
  } catch {
    return [new Error('菜单响应不是合法 JSON'), null]
  }
}

const getNodePath = (node: BackendMenuNode, isChild: boolean): string => {
  const fallback = node.menuCode || node.code || ''
  const source = (node.featureUrl || fallback).trim()
  if (!source) return ''
  if (isUrl(source)) return source
  const absolute = source.startsWith('/') ? source : `/${source}`
  return isChild ? absolute.slice(1) : absolute
}

const splitPathAndProps = (path: string): { path: string; props?: Record<string, string> } => {
  if (isUrl(path)) return { path }
  const url = new URL(path.startsWith('/') ? path : `/${path}`, window.location.origin)
  const props = Object.fromEntries(url.searchParams.entries())
  const cleanPath = path.split('?')[0]
  return Object.keys(props).length ? { path: cleanPath, props } : { path: cleanPath }
}

export interface MenuAdaptResult {
  routes: AppCustomRouteRecordRaw[]
  warnings: string[]
}

export const adaptBackendMenus = (
  nodes: BackendMenuNode[],
  reservedPaths: ReadonlySet<string> = new Set()
): MenuAdaptResult => {
  const paths = new Set<string>()
  const warnings: string[] = []

  const visit = (
    items: BackendMenuNode[],
    parentPath: string,
    isChild: boolean
  ): AppCustomRouteRecordRaw[] => {
    const routes: AppCustomRouteRecordRaw[] = []

    for (const node of items) {
      if (isChild && node.featureIsMenu === false) continue
      const rawPath = getNodePath(node, isChild)
      if (!rawPath) {
        warnings.push(`菜单 ${node.featureName || node.name || node.code || '未知'} 缺少路径`)
        continue
      }

      const { path, props } = splitPathAndProps(rawPath)
      const fullPath = isUrl(path) ? path : pathResolve(parentPath, path)
      if (reservedPaths.has(fullPath)) {
        warnings.push(`菜单路径与静态路由冲突，已跳过：${fullPath}`)
        continue
      }
      if (paths.has(fullPath)) {
        warnings.push(`菜单路径重复，已跳过：${fullPath}`)
        continue
      }
      paths.add(fullPath)

      const children = node.childModules?.length
        ? visit(node.childModules, fullPath, true)
        : undefined
      if (node.childModules?.length && !children?.length) {
        warnings.push(`菜单 ${fullPath} 没有有效子页面，已跳过`)
        continue
      }

      const title = node.featureName || node.name || node.menuCode || node.code || fullPath
      const rawComponent = node.featureControllerName?.trim()
      if (!children?.length && !isUrl(fullPath) && !rawComponent) {
        warnings.push(`菜单 ${fullPath} 缺少页面组件，已跳过`)
        continue
      }
      const componentName = rawComponent
        ?.replace(/^\/+/, '')
        .replace(/^views\//, '')
        .replace(/\.(?:vue|tsx)$/, '')
      const component = children?.length
        ? '#'
        : componentName?.startsWith('#')
          ? componentName
          : componentName
            ? `views/${componentName}`
            : '#'
      const route: AppCustomRouteRecordRaw = {
        path,
        name: `remote:${fullPath}`,
        component,
        meta: {
          title,
          icon: node.icon || node.menuIcon,
          alwaysShow: Boolean(children?.length),
          noCache: false,
          showMainRoute: node.featureIsShortCut === undefined ? false : !node.featureIsShortCut,
          hidden: node.featureIsShortCut === undefined ? false : !node.featureIsShortCut,
          menuCode: node.menuCode || node.code
        }
      }
      if (props) route.props = props
      if (children?.length) {
        route.children = children
        route.redirect = children[0].path.startsWith('/')
          ? children[0].path
          : pathResolve(fullPath, children[0].path)
      }
      routes.push(route)
    }
    return routes
  }

  return { routes: visit(nodes, '/', false), warnings }
}
