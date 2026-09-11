import { BaseApi, getDownloadFilename, saveBlob, toResponseError } from '@/request'
import type { ApiResult } from '@/request'
import { PATH_URL, USE_CRY_PTO } from '@/request/config'
import type {
  CenterDetail,
  CenterFormPayload,
  CenterLabel,
  CenterListItem,
  CenterQuery,
  ContactFormPayload,
  ContactItem,
  OrganizationDetail,
  OrganizationFormPayload,
  OrganizationListItem,
  OrganizationRelation,
  PageData,
  PageQuery,
  StationRecord,
  VisitRecord
} from './types'

interface BusinessResponse<T> {
  data?: T
  isSuccessful?: boolean
  IsSuccessful?: boolean
  message?: string | null
  Message?: string | null
}

interface RequestOptions {
  signal?: AbortSignal
}

const client = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })
const organizationUrl = '/api/resource/LogisticCenterOrganization'
const contactUrl = '/api/resource/CenterOrganizationContactPersonInfo'
const stationRelationUrl = '/api/resource/CenterOrganizationStationInfo'
const labelUrl = '/api/resource/CenterOrganizationLabelInfo'
const railwayUrl = '/api/resource/railway'

export const legacyPageParams = <T extends PageQuery>(params: T) => ({
  start: 0,
  sumfield: '',
  sort: "[{property:'id',direction:'desc'}]",
  totalRowsCount: 0,
  isExport: true,
  isAllPage: true,
  total: 0,
  totalpagecount: 0,
  ...params
})

const emptyPage = <T>(): PageData<T> => ({ totalCount: 0, items: [] })

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

export const queryCenters = (params: CenterQuery, options: RequestOptions = {}) =>
  unwrapData(
    client.post<BusinessResponse<PageData<CenterListItem>>>(
      `${organizationUrl}/QueryFirstLevelByPage`,
      legacyPageParams(params),
      true,
      withSignal(options)
    ),
    emptyPage<CenterListItem>()
  )

export const getCenterDetail = (id: string, options: RequestOptions = {}) =>
  unwrapData(
    client.get<BusinessResponse<CenterDetail>>(
      `${organizationUrl}/GetFirstLevelDetail`,
      { id },
      true,
      withSignal(options)
    ),
    {} as CenterDetail
  )

export const getOrganizationDetail = (id: string, options: RequestOptions = {}) =>
  unwrapData(
    client.get<BusinessResponse<OrganizationDetail>>(
      `${organizationUrl}/GetOtherLevelDetail`,
      { id },
      true,
      withSignal(options)
    ),
    {} as OrganizationDetail
  )

export const getOrganizationRelation = (id: string, options: RequestOptions = {}) =>
  unwrapData(
    client.get<BusinessResponse<OrganizationRelation>>(
      `${organizationUrl}/GetLogisticsCenterStructureInfo`,
      { id },
      true,
      withSignal(options)
    ),
    { otherRelationList: [], centerOrganizationList: [] }
  )

export const queryOrganizations = (
  params: PageQuery & { parentId: string; keyName: string },
  options: RequestOptions = {}
) =>
  unwrapData(
    client.post<BusinessResponse<PageData<OrganizationListItem>>>(
      `${organizationUrl}/QueryLogisticsCenterAllChildInfoPageList`,
      legacyPageParams(params),
      true,
      withSignal(options)
    ),
    emptyPage<OrganizationListItem>()
  )

export const createOrganization = async (payload: OrganizationFormPayload): ApiResult<string> => {
  const [error, response] = await client.post<BusinessResponse<string>>(
    `${organizationUrl}/Create`,
    payload,
    true
  )
  return error ? [error, ''] : [null, String(response?.data || '')]
}

export const updateOrganization = (payload: CenterFormPayload | OrganizationFormPayload) =>
  unwrapSuccess(client.put<BusinessResponse<unknown>>(`${organizationUrl}/Update`, payload, true))

export const deleteOrganization = (id: string) =>
  unwrapSuccess(
    client.delete<BusinessResponse<unknown>>(
      `${organizationUrl}/${encodeURIComponent(id)}/delete`,
      true
    )
  )

export const queryContacts = (
  params: PageQuery & { organizationId: string; keyName: string },
  options: RequestOptions = {}
) =>
  unwrapData(
    client.post<BusinessResponse<PageData<ContactItem>>>(
      `${contactUrl}/QuerypageList`,
      legacyPageParams(params),
      true,
      withSignal(options)
    ),
    emptyPage<ContactItem>()
  )

export const createContact = (payload: ContactFormPayload) =>
  unwrapSuccess(client.post<BusinessResponse<unknown>>(`${contactUrl}/create`, payload, true))

export const updateContact = (payload: ContactFormPayload) =>
  unwrapSuccess(client.put<BusinessResponse<unknown>>(`${contactUrl}/update`, payload, true))

export const deleteContact = (id: string) =>
  unwrapSuccess(
    client.delete<BusinessResponse<unknown>>(`${contactUrl}/${encodeURIComponent(id)}/delete`, true)
  )

export const queryVisitRecords = (
  params: PageQuery & { businessId: string },
  options: RequestOptions = {}
) =>
  unwrapData(
    client.post<BusinessResponse<PageData<VisitRecord>>>(
      `${organizationUrl}/QueryAllOrgVisitRecordByPage`,
      params,
      true,
      withSignal(options)
    ),
    emptyPage<VisitRecord>()
  )

export const saveOrganizationStations = (payload: {
  centerOrganizationId: string
  stationList: Array<{ stationId: string; stationName: string }>
}) =>
  unwrapSuccess(
    client.post<BusinessResponse<unknown>>(
      `${stationRelationUrl}/CreateOrUpdateList`,
      payload,
      true
    )
  )

export const queryStations = (
  params: PageQuery & { isHyStation: boolean; railwayStationName?: string },
  options: RequestOptions = {}
) =>
  unwrapData(
    client.post<BusinessResponse<PageData<StationRecord>>>(
      `${railwayUrl}/query-dto-by-page`,
      legacyPageParams(params),
      true,
      withSignal(options)
    ),
    emptyPage<StationRecord>()
  )

export const getCenterLabels = (centerOrganizationId: string) =>
  unwrapData(
    client.get<BusinessResponse<CenterLabel[]>>(
      `${labelUrl}/GetAllList`,
      { centerOrganizationId },
      true
    ),
    []
  )

export const saveCenterLabels = (centerOrganizationId: string, labelNameList: string[]) =>
  unwrapSuccess(
    client.post<BusinessResponse<unknown>>(
      `${labelUrl}/CreateOrUpdateList`,
      { centerOrganizationId, labelNameList },
      true
    )
  )

const importExcel = (url: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file, file.name)
  return unwrapSuccess(
    client.post<BusinessResponse<unknown>>(url, formData, true, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  )
}

export const importOrganizations = (parentOrgId: string, file: File) =>
  importExcel(
    `${organizationUrl}/ImportBusinesOrg?parentOrgId=${encodeURIComponent(parentOrgId)}`,
    file
  )

export const importContacts = (organizationId: string, file: File) =>
  importExcel(
    `${contactUrl}/ImportContactPerson?organizationId=${encodeURIComponent(organizationId)}`,
    file
  )

export const downloadTemplate = async (path: string, fallbackName: string): ApiResult<void> => {
  const [error, response] = await client.requestResponse<Blob>({
    url: path,
    method: 'GET',
    responseType: 'blob'
  })
  if (error) return [error, undefined]
  if (!response) return [toResponseError(new Error('模板下载失败')), undefined]
  saveBlob(response.data, getDownloadFilename(response, fallbackName))
  return [null, undefined]
}
