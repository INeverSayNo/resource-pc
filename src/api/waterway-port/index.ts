import { BaseApi, getDownloadFilename, saveBlob, toResponseError } from '@/request'
import { PATH_URL, USE_CRY_PTO } from '@/request/config'
import type { ApiResult } from '@/request'
import type { PagedResultDto } from '@/utils/base-entity'
import type { WaterwayQueryDto, WaterwayStationDto } from '@/views/waterway/station/types'

export interface WaterwayPortDetail {
  waterPort?: Record<string, any>
  fileAttach?: any[]
  portImage?: any[]
  portSupplier?: any[]
  portWorkZone?: any[]
  portWharf?: any[]
  portJobFee?: any[]
  portStowage?: any[]
  portContact?: any[]
  portTrafficability?: any[]
  tags?: string[]
}

export interface WaterwayVisitQuery {
  page: number
  pageSize: number
  businessId: string
}

interface BusinessResponse<T> {
  data?: T
  isSuccessful?: boolean
  IsSuccessful?: boolean
  message?: string
  Message?: string
}

interface RequestOptions {
  signal?: AbortSignal
}

const client = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })
const baseUrl = '/api/resource/water-port'
const imageBaseUrl = '/api/resource/railway-image'
const visitBaseUrl = '/api/resource/resource-visit'

const legacyPaginationParams = {
  limit: 25,
  page: 1,
  start: 0,
  sumfield: '',
  sort: "[{property:'id',direction:'desc'}]",
  totalRowsCount: 0,
  isExport: true,
  isAllPage: true,
  total: 0,
  totalpagecount: 0
}

const buildPageParams = <T extends Record<string, any>>(params: T): T & Record<string, any> => ({
  ...params,
  limit: params.pageSize,
  KeyWords: params.KeyWords || params.key || params.keywords
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

const requestData = <T>(
  path: string,
  method: 'GET' | 'POST' | 'DELETE',
  payload: unknown,
  fallback: T,
  options: RequestOptions = {}
): ApiResult<T> => {
  const config = options.signal ? { signal: options.signal } : undefined
  if (method === 'GET') {
    return unwrapData(
      client.get<BusinessResponse<T>>(
        `${baseUrl}/${path}`,
        payload as Record<string, any>,
        true,
        config
      ),
      fallback
    )
  }
  if (method === 'DELETE') {
    return unwrapData(
      client.delete<BusinessResponse<T>>(`${baseUrl}/${path}`, true, { ...config, data: payload }),
      fallback
    )
  }
  return unwrapData(
    client.post<BusinessResponse<T>>(`${baseUrl}/${path}`, payload, true, config),
    fallback
  )
}

const requestSuccess = (
  path: string,
  method: 'POST' | 'DELETE',
  payload?: unknown
): ApiResult<boolean> => {
  if (method === 'DELETE') {
    return unwrapSuccess(
      client.delete<BusinessResponse<unknown>>(`${baseUrl}/${path}`, true, { data: payload })
    )
  }
  return unwrapSuccess(client.post<BusinessResponse<unknown>>(`${baseUrl}/${path}`, payload, true))
}

export const queryPorts = (params: WaterwayQueryDto, options: RequestOptions = {}) =>
  requestData<PagedResultDto<WaterwayStationDto>>(
    'query-by-portpage',
    'POST',
    buildPageParams(params),
    {} as PagedResultDto<WaterwayStationDto>,
    options
  )

export const getPortDetail = (id: string, options: RequestOptions = {}) =>
  requestData<WaterwayPortDetail>(
    `query-by-portid?id=${encodeURIComponent(id)}`,
    'GET',
    undefined,
    {},
    options
  )

export const createPort = (payload: unknown) =>
  requestData<string>('port-create', 'POST', payload, '')
export const updatePort = (id: string, payload: unknown) =>
  requestSuccess(`${id}/port-update`, 'POST', payload)

export const listContacts = (portId: string) =>
  requestData<any[]>(`${portId}/contact-byPortId`, 'GET', undefined, [])
export const createContact = (payload: unknown) => requestSuccess('contact-create', 'POST', payload)
export const updateContact = (id: string, payload: unknown) =>
  requestSuccess(`${id}/contact-update`, 'POST', payload)
export const deleteContact = (id: string) => requestSuccess(`${id}/contact-scrap`, 'DELETE')

export const listWharfs = (portId: string) =>
  requestData<any[]>(`${portId}/wharf-byPortId`, 'GET', undefined, [])
export const createWharf = (payload: unknown) => requestSuccess('wharf-create', 'POST', payload)
export const updateWharf = (id: string, payload: unknown) =>
  requestSuccess(`wharf-update?id=${encodeURIComponent(id)}`, 'POST', payload)

export const listWorkZones = (portId: string) =>
  requestData<any[]>(`workZone-queryById?ids=${encodeURIComponent(portId)}`, 'GET', undefined, [])
export const createWorkZone = (payload: unknown) =>
  requestSuccess('workzone-create', 'POST', payload)
export const updateWorkZone = (id: string, payload: unknown) =>
  requestSuccess(`${id}/workzone-update`, 'POST', payload)

export const listTrafficability = (portId: string) =>
  requestData<any[]>(
    `trafficability-queryById?id=${encodeURIComponent(portId)}`,
    'GET',
    undefined,
    []
  )
export const createTrafficability = (payload: unknown) =>
  requestSuccess('trafficability-create', 'POST', payload)
export const updateTrafficability = (id: string, payload: unknown) =>
  requestSuccess(`${id}/trafficability-update`, 'POST', payload)
export const deleteTrafficability = (id: string) =>
  requestSuccess(`${id}/trafficability-scrap`, 'DELETE')

export const listStowage = (portId: string) =>
  requestData<any[]>(`${portId}/stowage-byPortId`, 'GET', undefined, [])
export const createStowage = (payload: unknown) => requestSuccess('stowage-create', 'POST', payload)
export const updateStowage = (id: string, payload: unknown) =>
  requestSuccess(`${id}/stowage-update`, 'POST', payload)
export const deleteStowage = (id: string) => requestSuccess(`${id}/stowage-scrap`, 'DELETE')
export const importStowage = (portId: string, path: string) =>
  unwrapSuccess(
    client.get<BusinessResponse<unknown>>(
      `${baseUrl}/${portId}/import-stowageV2?path=${encodeURIComponent(path)}`,
      undefined,
      true
    )
  )

export const listWorkFees = (portId: string) =>
  requestData<any[]>(
    `jobfee-queryById-new?ids=${encodeURIComponent(portId)}`,
    'POST',
    legacyPaginationParams,
    []
  )
export const createWorkFee = (payload: unknown) =>
  requestSuccess('create-workfee-new', 'POST', payload)
export const updateWorkFee = (payload: unknown) =>
  requestSuccess('update-workfee-new', 'POST', payload)
export const deleteWorkFee = (id: string) =>
  requestSuccess(`delete-workfee-new?id=${encodeURIComponent(id)}`, 'POST')
export const importWorkFees = (portId: string, path: string) =>
  requestSuccess(`${portId}/import-workfee-new?path=${encodeURIComponent(path)}`, 'POST')

export const listFiles = (portId: string) =>
  requestData<any[]>(`${portId}/getFile-byPortId`, 'GET', undefined, [])
export const bindFiles = (portId: string, payload: unknown) =>
  requestSuccess(`${portId}/upload-file`, 'POST', payload)
export const deleteFile = (id: string) => requestSuccess(`${id}/delete-file`, 'DELETE')

export const listImages = (portId: string) =>
  unwrapData(
    client.get<BusinessResponse<any[]>>(`${imageBaseUrl}/${portId}/getbyid`, undefined, true),
    []
  )
export const createImages = (payload: unknown) =>
  unwrapSuccess(client.post<BusinessResponse<unknown>>(`${imageBaseUrl}/list`, payload, true))
export const createImage = (payload: unknown) =>
  unwrapSuccess(client.post<BusinessResponse<unknown>>(`${imageBaseUrl}/create`, payload, true))
export const deleteImage = (id: string) =>
  unwrapSuccess(client.delete<BusinessResponse<unknown>>(`${imageBaseUrl}/${id}/delete`, true))

export const queryVisits = (params: WaterwayVisitQuery) =>
  unwrapData(
    client.post<BusinessResponse<PagedResultDto<any>>>(
      `${visitBaseUrl}/query-by-page`,
      buildPageParams(params),
      true
    ),
    {} as PagedResultDto<any>
  )
export const createVisit = (payload: unknown) =>
  unwrapSuccess(client.post<BusinessResponse<unknown>>(`${visitBaseUrl}/create`, payload, true))

const downloadTemplate = async (path: string, fileName: string): ApiResult<void> => {
  const [error, response] = await client.requestResponse<Blob>({
    url: `${baseUrl}/${path}`,
    method: 'GET',
    responseType: 'blob'
  })
  if (error) return [error, undefined]
  if (!response) return [toResponseError(new Error('文件下载失败')), undefined]
  saveBlob(response.data, getDownloadFilename(response, fileName))
  return [null, undefined]
}

export const downloadStowageTemplate = () =>
  downloadTemplate('stowage/get-temp', '堆存费导入模板.xlsx')
export const downloadWorkFeeTemplate = () =>
  downloadTemplate('workfee/get-temp', '作业包干费导入模板.xlsx')
