import type { AxiosResponse } from 'axios'
import type { ResponseError } from '@dczy/tie-tools'

export type RuntimeEnv = 'dev' | 'test' | 'pro'

export type ApiResult<T, E = unknown> = Promise<[ResponseError<E> | null, T]>

export type ApiResponseResult<T, E = unknown> = Promise<
  [ResponseError<E> | null, AxiosResponse<T> | null]
>

export interface ConfigOptions {
  applicationId: string
  base_url: UrlObject
  trace_url: UrlObject
  login_url: UrlObject
  file_url: UrlObject
  getfile_url: UrlObject
  self_url: UrlObject
  jssdk_url: UrlObject
  gateway_url: UrlObject
  stream_url: UrlObject
  Supplier_url: UrlObject
  Resource_url: UrlObject
  v8_baseData_url: UrlObject
  view_url: UrlObject
  abpBase_url: UrlObject
  esb_url: UrlObject
  ocr_url: UrlObject
  systemBaseData_url: UrlObject
  taskCenter: UrlObject
  customer: UrlObject
  signalR_url: UrlObject
  tgsSolutionV2_url: UrlObject
  estimatePrice_url: UrlObject
  businessDataSync_url: UrlObject
  baseDataDCZY_url: UrlObject
  pmDCZY_url: UrlObject
  platform_url: UrlObject
  useCrypto: boolean
  cryptoType: number
  auth: {
    clientId: string
    clientSecret: string
  }
  system_config: {
    solutionTitle: string
    documentTitle: string
    solutionDefalutTabIndex: number
    solutionTab: string[]
  }
}

export interface UrlObject {
  dev: string
  pro: string
  test: string
}

export interface RuntimeEndpoints {
  resourceApi: string
  gateway: string
  login: string
  file: string
  getFile: string
  self: string
  jsSdk: string
  resource: string
  supplier: string
  trace: string
  stream: string
  v8BaseData: string
  view: string
  abpBase: string
  esb: string
  ocr: string
  systemBaseData: string
  taskCenter: string
  customer: string
  signalR: string
  tgsSolutionV2: string
  estimatePrice: string
  businessDataSync: string
  baseDataDczy: string
  pmDczy: string
  platform: string
}
