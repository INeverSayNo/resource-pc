import { BaseApi } from '@/request'
import { GATEWAY_URL, USE_CRY_PTO } from '@/request/config'

const api = new BaseApi({ baseURL: GATEWAY_URL, crypto: USE_CRY_PTO })

export interface DictionaryOption {
  label: string
  value: string
  [key: string]: unknown
}

export const GetDownMarkList = async (mark: string, cache = true): Promise<DictionaryOption[]> => {
  const cacheKey = `resource_down_${mark}`
  if (cache) {
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey) || '[]')
      if (Array.isArray(cached) && cached.length) return cached
    } catch {
      sessionStorage.removeItem(cacheKey)
    }
  }
  const [error, response] = await api.get<{ data?: DictionaryOption[] }>(
    '/api/resource/system-select-data/get-select-item-data-by-mark',
    { SelectMark: mark },
    true
  )
  if (error || !response) throw error || new Error('字典加载失败')
  const data = response.data || []
  if (cache) sessionStorage.setItem(cacheKey, JSON.stringify(data))
  return data
}

export const getAllDictionaries = () =>
  api.get<Record<string, unknown>>(
    '/api/resource/system-select-data/get-select-item-data',
    undefined,
    true
  )
