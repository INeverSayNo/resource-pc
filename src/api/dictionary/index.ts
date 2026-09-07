import { BaseApi } from '@/request'
import type { ApiResult } from '@/request'
import { GATEWAY_URL, USE_CRY_PTO } from '@/request/config'

const api = new BaseApi({ baseURL: GATEWAY_URL, crypto: USE_CRY_PTO })

export const getAllDictionaries = async (): Promise<ApiResult<Record<string, unknown>>> => {
  const [error, response] = await api.get<Record<string, unknown>>(
    '/api/resource/system-select-data/get-select-item-data',
    undefined,
    true
  )
  if (error || !response) return [error || new Error('字典加载失败'), null]
  const nested = response.data
  if (typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
    return [null, nested as Record<string, unknown>]
  }
  return [null, response]
}
