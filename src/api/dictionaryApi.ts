import { BaseApi, requireApiData } from '@/request'
import { SYSTEM_BASE_DATA_URL, USE_CRY_PTO } from '@/request/config'

export type BaseData = Record<'value' | 'text' | 'name', string>

const api = new BaseApi({ baseURL: SYSTEM_BASE_DATA_URL, crypto: USE_CRY_PTO })

export async function GetSystemBaseDataAsync(code: string): Promise<BaseData[]> {
  const cacheKey = `abp_basedata_${code}`
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || '[]')
    if (Array.isArray(cached) && cached.length) return cached
  } catch {
    sessionStorage.removeItem(cacheKey)
  }

  const response = await requireApiData(
    api.get<{ items?: Array<{ defaultValue: unknown; displayName: unknown; name: unknown }> }>(
      `/api/platform/datas/by-name/${encodeURIComponent(code)}`,
      undefined,
      true
    )
  )
  const data = (response?.items || [])
    .map((item) => ({
      value: String(item.defaultValue),
      text: String(item.displayName),
      name: String(item.name)
    }))
    .sort((a, b) => Number(a.value) - Number(b.value))
  sessionStorage.setItem(cacheKey, JSON.stringify(data))
  return data
}
