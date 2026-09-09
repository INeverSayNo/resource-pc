import { describe, expect, it } from 'vitest'
import { normalizeRuntimeEndpoints } from './runtimeConfig'
import type { ConfigOptions, UrlObject } from './types'

const urls = (prefix: string): UrlObject => ({
  dev: `https://dev.example.com/${prefix}/`,
  test: `https://test.example.com/${prefix}/`,
  pro: `https://pro.example.com/${prefix}/`
})

const config: ConfigOptions = {
  applicationId: 'app',
  base_url: urls('resource-api'),
  trace_url: urls('trace'),
  login_url: urls('login'),
  file_url: urls('file'),
  getfile_url: urls('get-file'),
  self_url: urls('self'),
  jssdk_url: urls('js-sdk'),
  gateway_url: urls('gateway'),
  stream_url: urls('stream'),
  Supplier_url: urls('supplier'),
  Resource_url: urls('resource'),
  v8_baseData_url: urls('v8-base-data'),
  view_url: urls('view'),
  abpBase_url: urls('abp'),
  esb_url: urls('esb'),
  ocr_url: urls('ocr'),
  systemBaseData_url: urls('system-base-data'),
  taskCenter: urls('task-center'),
  customer: urls('customer'),
  signalR_url: urls('signal-r'),
  tgsSolutionV2_url: urls('tgs'),
  estimatePrice_url: urls('estimate'),
  businessDataSync_url: urls('sync'),
  baseDataDCZY_url: urls('dczy'),
  pmDCZY_url: urls('pm'),
  platform_url: urls('platform'),
  useCrypto: false,
  cryptoType: 1,
  auth: { clientId: 'client', clientSecret: 'secret' },
  system_config: {
    solutionTitle: 'solution',
    documentTitle: 'document',
    solutionDefalutTabIndex: 0,
    solutionTab: []
  }
}

describe('runtime endpoint normalization', () => {
  it('selects the requested environment and removes a trailing slash', () => {
    const result = normalizeRuntimeEndpoints(config, 'test')
    expect(result.resourceApi).toBe('https://test.example.com/resource-api')
    expect(result.taskCenter).toBe('https://test.example.com/task-center')
  })

  it('fails fast when a service endpoint is missing', () => {
    const invalid = { ...config, ocr_url: { ...config.ocr_url, test: '' } }
    expect(() => normalizeRuntimeEndpoints(invalid, 'test')).toThrow('ocr_url.test')
  })
})
