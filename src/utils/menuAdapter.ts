import type { BackendMenuNode, BackendMenuResponse } from '@/api/login/types'
import { isUrl, pathResolve } from './routerHelper'

const isMenuNode = (value: unknown): value is BackendMenuNode =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const normalizeBackendMenus = (value: BackendMenuResponse): BackendMenuNode[] | null => {
  try {
    const parsed: unknown = typeof value === 'string' ? JSON.parse(value) : value
    if (Array.isArray(parsed)) {
      return parsed.every(isMenuNode) ? parsed : null
    }
    return isMenuNode(parsed) ? [parsed] : null
  } catch {
    return null
  }
}

const getMenuLabel = (node: BackendMenuNode): string =>
  node.featureName || node.name || node.menuCode || node.code || '未知'

const stripQueryAndHash = (path: string): string => path.split(/[?#]/, 1)[0]

const normalizeLocalPath = (path: string): string => {
  const normalized = path.replace(/\/+/g, '/')
  return normalized.length > 1 ? normalized.replace(/\/$/, '') : normalized
}

const resolveMenuPath = (node: BackendMenuNode, parentPath: string, isChild: boolean): string => {
  const source = (node.featureUrl || node.menuCode || node.code || '').trim()
  if (!source) return ''
  const path = stripQueryAndHash(source)
  if (!path) return ''
  if (isUrl(path)) return path
  const absolutePath = normalizeLocalPath(`/${path.replace(/^\/+/, '')}`)
  const resolved =
    isChild && absolutePath !== parentPath && !absolutePath.startsWith(`${parentPath}/`)
      ? pathResolve(parentPath, path.replace(/^\/+/, ''))
      : absolutePath
  return normalizeLocalPath(resolved)
}

export interface MenuAuthorizationResult {
  paths: Set<string>
  warnings: string[]
}

export const extractAuthorizedMenuPaths = (nodes: BackendMenuNode[]): MenuAuthorizationResult => {
  const paths = new Set<string>()
  const warnings: string[] = []

  const visit = (items: BackendMenuNode[], parentPath: string, isChild: boolean): void => {
    for (const node of items) {
      if (isChild && node.featureIsMenu === false) continue

      const fullPath = resolveMenuPath(node, parentPath, isChild)
      if (!fullPath) {
        warnings.push(`菜单 ${getMenuLabel(node)} 缺少路径`)
        continue
      }
      if (paths.has(fullPath)) {
        warnings.push(`菜单路径重复，已忽略：${fullPath}`)
      } else {
        paths.add(fullPath)
      }

      if (node.childModules?.length) visit(node.childModules, fullPath, true)
    }
  }

  visit(nodes, '/', false)
  return { paths, warnings }
}
