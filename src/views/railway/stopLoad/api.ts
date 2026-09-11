import { BaseApi } from '@/request'
import type { ApiResult } from '@/request'
import { PATH_URL, USE_CRY_PTO } from '@/request/config'
import type {
  StationPageItem,
  StopLoadConfig,
  StopLoadConfigPage,
  StopLoadConfigPayload,
  StopLoadConfigQuery,
  StopLoadImportItem,
  StopLoadNotice,
  StopLoadPage,
  StopLoadQuery
} from './types'

interface ResponseEnvelope<T> {
  isSuccessful?: boolean
  IsSuccessful?: boolean
  message?: string
  Message?: string
  data?: T | ResponseEnvelope<T>
  totalCount?: number
  items?: T extends { items?: infer I } ? I : unknown[]
}

const api = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })
const baseUrl = '/api/resource/railway'

const emptyPage = <T>(): { totalCount: number; items: T[]; isSuccessful: boolean; message: string } => ({
  totalCount: 0,
  items: [],
  isSuccessful: false,
  message: ''
})

const pageParams = (params: { page: number; pageSize: number; [key: string]: unknown }) => ({
  start: 0,
  sumfield: '',
  sort: "[{property:'id',direction:'desc'}]",
  totalRowsCount: 0,
  isExport: true,
  isAllPage: true,
  total: 0,
  totalpagecount: 0,
  ...params,
  limit: params.pageSize
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object'

const unwrapPayload = <T>(response: unknown): T | undefined => {
  if (!isRecord(response)) return undefined
  const nested = response.data
  if (isRecord(nested) && ('data' in nested || 'items' in nested || 'totalCount' in nested)) {
    return unwrapPayload<T>(nested) ?? (nested as T)
  }
  return (nested as T | undefined) ?? (response as T)
}

const unwrapPage = <T>(response: unknown): { totalCount: number; items: T[] } => {
  const payload = unwrapPayload<ResponseEnvelope<{ totalCount?: number; items?: T[] }>>(response)
  if (!isRecord(payload)) return { totalCount: 0, items: [] }
  return {
    totalCount: Number(payload.totalCount || 0),
    items: Array.isArray(payload.items) ? payload.items : []
  }
}

const unwrapBoolean = (response: unknown): boolean => {
  if (typeof response === 'boolean') return response
  const payload = unwrapPayload<unknown>(response)
  if (typeof payload === 'boolean') return payload
  if (isRecord(response)) {
    if (typeof response.isSuccessful === 'boolean') return response.isSuccessful
    if (typeof response.IsSuccessful === 'boolean') return response.IsSuccessful
  }
  return true
}

export const buildStopLoadPageParams = (params: StopLoadQuery) => pageParams(params)

export const queryStopLoads = (params: StopLoadQuery): ApiResult<StopLoadPage> =>
  api
    .post<ResponseEnvelope<StopLoadPage>>(
      `${baseUrl}/query-by-loadpage`,
      buildStopLoadPageParams(params),
      true
    )
    .then(([error, response]) => [
      error,
      error
        ? emptyPage<StopLoadNotice>()
        : { ...emptyPage<StopLoadNotice>(), ...unwrapPage<StopLoadNotice>(response), isSuccessful: true }
    ])

const parseImportedData = (
  endpoint: 'get-kuntie-databypath' | 'get-excel-databypath',
  path: string
): ApiResult<StopLoadImportItem[]> =>
  api
    .post<ResponseEnvelope<StopLoadImportItem[]>>(
      `${baseUrl}/${endpoint}?path=${encodeURIComponent(path)}`,
      undefined,
      true
    )
    .then(([error, response]) => {
      if (error) return [error, []]
      const payload = unwrapPayload<StopLoadImportItem[]>(response)
      return [null, Array.isArray(payload) ? payload : []]
    })

export const parseKuntieStopLoads = (path: string) =>
  parseImportedData('get-kuntie-databypath', path)

export const parseExcelStopLoads = (path: string) => parseImportedData('get-excel-databypath', path)

export const saveImportedStopLoads = (items: StopLoadImportItem[]): ApiResult<boolean> =>
  api
    .post<ResponseEnvelope<unknown>>(`${baseUrl}/update-stoplimitloading-data`, items, true)
    .then(([error, response]) => [error, error ? false : unwrapBoolean(response)])

export const queryStopLoadConfigs = (params: StopLoadConfigQuery): ApiResult<StopLoadConfigPage> =>
  api
    .post<ResponseEnvelope<StopLoadConfigPage>>(
      `${baseUrl}/query-by-loadpageconfig`,
      buildStopLoadPageParams(params),
      true
    )
    .then(([error, response]) => [
      error,
      error
        ? emptyPage<StopLoadConfig>()
        : { ...emptyPage<StopLoadConfig>(), ...unwrapPage<StopLoadConfig>(response), isSuccessful: true }
    ])

export const saveStopLoadConfig = (payload: StopLoadConfigPayload): ApiResult<boolean> =>
  api
    .post<ResponseEnvelope<unknown>>(`${baseUrl}/create-loadconfig`, payload, true)
    .then(([error, response]) => [error, error ? false : unwrapBoolean(response)])

export const deleteStopLoadConfig = (id: string): ApiResult<boolean> =>
  api
    .delete<ResponseEnvelope<unknown>>(`${baseUrl}/${encodeURIComponent(id)}/scrap-loadconfig`, true)
    .then(([error, response]) => [error, error ? false : unwrapBoolean(response)])

export const queryStopLoadStations = (
  params: Record<string, unknown>
): ApiResult<{ totalCount: number; items: StationPageItem[] }> =>
  api
    .post<ResponseEnvelope<{ totalCount?: number; items?: StationPageItem[] }>>(
      `${baseUrl}/query-dto-by-page`,
      pageParams({ page: 1, pageSize: 20, ...params }),
      true
    )
    .then(([error, response]) => [
      error,
      error ? { totalCount: 0, items: [] } : unwrapPage<StationPageItem>(response)
    ])
