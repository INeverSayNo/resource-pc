import { BaseApi, requireApiData } from '@/request'
import { PATH_URL, USE_CRY_PTO } from '@/request/config'

const api = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })

export async function getSystemDataShow(
  showMark: string,
  keyWords: string,
  page?: number,
  pageSize?: number,
  param?: unknown,
  needCache = false
): Promise<any[]> {
  const cacheKey = `system-data-show-set_${showMark}`
  if (needCache) {
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null')
      if (Array.isArray(cached)) return cached
    } catch {
      sessionStorage.removeItem(cacheKey)
    }
  }

  const response = await requireApiData(
    api.get<any>(
      '/api/resource/system-data-show-set/get-show-data-by-mark',
      {
        ShowMark: showMark,
        KeyWords: keyWords,
        page: page || '',
        limit: pageSize || '',
        dataSourceParamsJson: param || ''
      },
      true
    )
  )
  const data = response?.data?.items || response?.data || []
  if (needCache) sessionStorage.setItem(cacheKey, JSON.stringify(data))
  return data
}
