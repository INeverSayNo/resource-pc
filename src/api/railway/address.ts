import { BaseApi } from '@/request'
import { PATH_URL, TGS_SOLUTION_V2_URL, USE_CRY_PTO } from '@/request/config'
import type { SearchRecordResponse, StationRecordItem } from '@/components/StationAddressSelect/type'

export interface CreateSearchRecordParams {
  recordType: number
  value: string
  valueId: string
  latlng: string
  province: string
  city: string
  district: string
}

interface ApiEnvelope<T> {
  data?: T
  isSuccessful?: boolean
  message?: string
}

const resourceApi = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })
const solutionApi = new BaseApi({ baseURL: TGS_SOLUTION_V2_URL, crypto: USE_CRY_PTO })
const silent = { disableResponseError: true }

export const getStationPorts = (keywords: string) =>
  resourceApi.post<StationRecordItem[]>(
    '/api/resource/tgssolution/common/get-tgspoint-by-keywords',
    undefined,
    true,
    { ...silent, params: { Keywords: keywords } }
  )

export const getGoodsNames = (keywords: string) =>
  solutionApi.get<unknown[]>(
    '/api/solution/goods/railway-goods-anonymous',
    { name: keywords },
    true,
    silent
  )

export const getSearchRecords = () =>
  resourceApi.get<ApiEnvelope<SearchRecordResponse>>(
    '/api/resource/tgsqueryrecord/getList',
    undefined,
    true,
    silent
  )

export const clearSearchRecords = () =>
  resourceApi.post<ApiEnvelope<unknown>>(
    '/api/resource/tgsqueryrecord/clear',
    undefined,
    true,
    silent
  )

export const createSearchRecord = (data: CreateSearchRecordParams) =>
  resourceApi.post<ApiEnvelope<unknown>>(
    '/api/resource/tgsqueryrecord/create',
    data,
    true,
    silent
  )
