import { BaseApi } from '@/request'
import type { ApiResult } from '@/request'
import { PATH_URL, USE_CRY_PTO } from '@/request/config'
import type { PagedResultDto } from '@/utils/base-entity'
import type {
  GoodsItems,
  PolicyAllSimpleRecordDto,
  PolicyAllSimpleUpdateDto,
  PolicyShowDto,
  PricePolicyQueryLineParam,
  PricePolicyQueryParam,
  PricePolicyResult,
  RailwayGppStatistics,
  RailwayGppStatisticsParam,
  PolicySimpleResultWithMap
} from './types'

interface BusinessResponse<T> {
  data?: T
  isSuccessful?: boolean
  IsSuccessful?: boolean
}

interface RequestOptions {
  signal?: AbortSignal
}

const client = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })
const railwayBaseUrl = '/api/resource/railway'

const emptyPage = (): PagedResultDto<PolicyAllSimpleRecordDto> => ({
  totalCount: 0,
  items: [],
  isSuccessful: false,
  message: ''
})

const unwrapData = async <T>(result: ApiResult<BusinessResponse<T>>, fallback: T): ApiResult<T> => {
  const [error, response] = await result
  return error ? [error, fallback] : [null, response?.data ?? fallback]
}

const unwrapSuccess = async (result: ApiResult<BusinessResponse<unknown>>): ApiResult<boolean> => {
  const [error, response] = await result
  if (error) return [error, false]
  const successful = response?.isSuccessful ?? response?.IsSuccessful
  return [null, successful !== false]
}

const withSignal = (options: RequestOptions) =>
  options.signal ? { signal: options.signal } : undefined

export const buildPolicyPageParams = (params: PricePolicyQueryParam) => ({
  start: 0,
  sumfield: '',
  sort: "[{property:'id',direction:'desc'}]",
  totalRowsCount: 0,
  isExport: true,
  isAllPage: true,
  total: 0,
  totalpagecount: 0,
  ...params,
  limit: params.pageSize || 50,
  KeyWords: undefined
})

export const searchPolicies = (
  params: PricePolicyQueryParam,
  options: RequestOptions = {}
): ApiResult<PagedResultDto<PolicyAllSimpleRecordDto>> =>
  unwrapData(
    client.post<BusinessResponse<PagedResultDto<PolicyAllSimpleRecordDto>>>(
      `${railwayBaseUrl}/search-policy-inner`,
      buildPolicyPageParams(params),
      true,
      withSignal(options)
    ),
    emptyPage()
  )

export const getPolicyDetails = (
  policyId: string,
  options: RequestOptions = {}
): ApiResult<PricePolicyResult[]> =>
  unwrapData(
    client.get<BusinessResponse<PricePolicyResult[]>>(
      `${railwayBaseUrl}/${encodeURIComponent(policyId)}/policy-details`,
      undefined,
      true,
      withSignal(options)
    ),
    []
  )

export const getAllPolicyGoods = (
  goodsName: string,
  options: RequestOptions = {}
): ApiResult<GoodsItems[]> =>
  unwrapData(
    client.get<BusinessResponse<GoodsItems[]>>(
      `${railwayBaseUrl}/all-goods`,
      { goodsName },
      true,
      withSignal(options)
    ),
    []
  )

export const searchPolicyLine = (
  params: PricePolicyQueryLineParam,
  options: RequestOptions = {}
): ApiResult<PolicyShowDto[]> =>
  unwrapData(
    client.post<BusinessResponse<PolicyShowDto[]>>(
      `${railwayBaseUrl}/goods-policy-query`,
      params,
      true,
      withSignal(options)
    ),
    []
  )

export const updatePolicyContainerAndRemark = (
  params: PolicyAllSimpleUpdateDto
): ApiResult<boolean> => {
  const payload: PolicyAllSimpleUpdateDto = {
    ...params,
    containerTypes: [...params.containerTypes],
    containerType: params.containerTypes.join(',')
  }
  return unwrapSuccess(
    client.post<BusinessResponse<unknown>>(`${railwayBaseUrl}/update-policy-cr`, payload, true)
  )
}

export const queryPolicyChannels = (
  params: RailwayGppStatisticsParam,
  options: RequestOptions = {}
): ApiResult<RailwayGppStatistics> =>
  unwrapData(
    client.post<BusinessResponse<RailwayGppStatistics>>(
      `${railwayBaseUrl}/policy-channel`,
      params,
      true,
      withSignal(options)
    ),
    { policyList: [], cities: [] }
  )

export const getPolicyChannelStations = (
  policyId: string,
  options: RequestOptions = {}
): ApiResult<PolicySimpleResultWithMap> =>
  unwrapData(
    client.get<BusinessResponse<PolicySimpleResultWithMap>>(
      `${railwayBaseUrl}/${encodeURIComponent(policyId)}/policy-channel`,
      undefined,
      true,
      withSignal(options)
    ),
    { policyId, xfkey: '', policyType: '', coefficient: 0, mapItems: [] }
  )

export const batchQueryPolicies = (file: File): ApiResult<string> => {
  const formData = new FormData()
  formData.append('file', file, file.name)
  return unwrapData(
    client.post<BusinessResponse<string>>(
      `${railwayBaseUrl}/search-policy-bymulti-bypath`,
      formData,
      true,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),
    ''
  )
}

export const importPolicies = (file: File): ApiResult<boolean> => {
  const formData = new FormData()
  formData.append('file', file, file.name)
  return unwrapSuccess(
    client.post<BusinessResponse<unknown>>(
      '/api/resource/railway-highway-platform-sync/import-railway-goodsprice',
      formData,
      true,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  )
}
