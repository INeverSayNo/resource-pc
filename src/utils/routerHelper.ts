export const Layout = () => import('@/layout/Layout.vue')

export const isUrl = (path: string) => /^(?:https?:|mailto:|tel:)/.test(path)

export const pathResolve = (parentPath: string, path: string) => {
  if (isUrl(path) || path.startsWith('/')) return path
  const childPath = path ? `/${path}` : path
  return `${parentPath}${childPath}`.replace(/\/\//g, '/').trim()
}
