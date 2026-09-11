import { BaseApi } from '@/request'
import { PATH_URL, USE_CRY_PTO } from '@/request/config'
import type { ApiResult } from '@/request'
import type { PagedResultDto } from '@/utils/base-entity'
import type { RailWayPrivatelLineCrudDto } from '@/views/railway/station/types'
import type { PrivateLineItem, PrivateLineQuery } from './type'

interface BusinessResponse<T> {
  data?: T
  isSuccessful?: boolean
  IsSuccessful?: boolean
}

interface RequestOptions {
  signal?: AbortSignal
}

const client = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })
const baseUrl = '/api/resource/railway'

const emptyPage = (): PagedResultDto<PrivateLineItem> => ({
  totalCount: 0,
  items: [],
  isSuccessful: false,
  message: ''
})

export const buildPrivateLinePageParams = (params: PrivateLineQuery) => ({
  start: 0,
  sumfield: '',
  sort: "[{property:'id',direction:'desc'}]",
  totalRowsCount: 0,
  isExport: true,
  isAllPage: true,
  total: 0,
  totalpagecount: 0,
  ...params,
  limit: params.pageSize,
  KeyWords: undefined
})

const unwrapData = async <T>(result: ApiResult<BusinessResponse<T>>, fallback: T): ApiResult<T> => {
  const [error, response] = await result
  return error ? [error, fallback] : [null, response?.data ?? fallback]
}

const unwrapSuccess = async (result: ApiResult<BusinessResponse<unknown>>): ApiResult<boolean> => {
  const [error, response] = await result
  if (error) return [error, false]
  const successful = response?.isSuccessful ?? response?.IsSuccessful
  if (successful === false) return [null, false]
  return [null, typeof response?.data === 'boolean' ? response.data : true]
}

export const queryPrivateLines = (
  params: PrivateLineQuery,
  options: RequestOptions = {}
): ApiResult<PagedResultDto<PrivateLineItem>> =>
  unwrapData(
    client.post<BusinessResponse<PagedResultDto<PrivateLineItem>>>(
      `${baseUrl}/private-page`,
      buildPrivateLinePageParams(params),
      true,
      options.signal ? { signal: options.signal } : undefined
    ),
    emptyPage()
  )

export const getPrivateLineDetail = (
  id: string,
  options: RequestOptions = {}
): ApiResult<PrivateLineItem> =>
  unwrapData(
    client.get<BusinessResponse<PrivateLineItem>>(
      `${baseUrl}/${encodeURIComponent(id)}/private-line`,
      undefined,
      true,
      options.signal ? { signal: options.signal } : undefined
    ),
    {} as PrivateLineItem
  )

export const createPrivateLine = (
  stationId: string,
  payload: RailWayPrivatelLineCrudDto
): ApiResult<boolean> =>
  unwrapSuccess(
    client.post<BusinessResponse<unknown>>(
      `${baseUrl}/${encodeURIComponent(stationId)}/private-line`,
      payload,
      true
    )
  )

export const updatePrivateLine = (
  id: string,
  payload: RailWayPrivatelLineCrudDto
): ApiResult<boolean> =>
  unwrapSuccess(
    client.put<BusinessResponse<unknown>>(
      `${baseUrl}/${encodeURIComponent(id)}/private-line`,
      payload,
      true
    )
  )
