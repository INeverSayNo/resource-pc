import { BaseApi } from '@/request'
import { GATEWAY_URL, USE_CRY_PTO } from '@/request/config'

const api = new BaseApi({ baseURL: GATEWAY_URL, crypto: USE_CRY_PTO })

export const getAllDictionaries = () =>
  api.get<Record<string, unknown>>(
    '/api/resource/system-select-data/get-select-item-data',
    undefined,
    true
  )
