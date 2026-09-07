import type { ResponseError } from '@dczy/tie-tools'

/**
 * request配置
 */
export interface ConfigOptions {
  applicationId: string
  default_headers: string
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
