const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`

export const publicAssetUrl = (path: string): string => `${base}${path.replace(/^\//, '')}`

const scriptPromises = new Map<string, Promise<void>>()

export const loadExternalScript = (path: string, id: string): Promise<void> => {
  const url = publicAssetUrl(path)
  const existing = scriptPromises.get(url)
  if (existing) return existing
  const pending = new Promise<void>((resolve, reject) => {
    const current = document.getElementById(id) as HTMLScriptElement | null
    if (current?.dataset.loaded === 'true') return resolve()
    const script = current || document.createElement('script')
    script.id = id
    script.src = url
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`脚本加载失败：${url}`))
    if (!current) document.head.appendChild(script)
  })
  scriptPromises.set(url, pending)
  return pending
}
