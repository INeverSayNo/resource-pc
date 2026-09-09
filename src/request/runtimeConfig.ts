import type { ConfigOptions, RuntimeEndpoints, RuntimeEnv, UrlObject } from './types'

const resolveUrl = (name: string, urls: UrlObject, env: RuntimeEnv): string => {
  const value = urls?.[env]?.trim()
  if (!value) throw new Error(`运行配置缺少 ${name}.${env}`)
  return value.replace(/\/$/, '')
}

export const normalizeRuntimeEndpoints = (
  config: ConfigOptions,
  env: RuntimeEnv
): RuntimeEndpoints => ({
  resourceApi: resolveUrl('base_url', config.base_url, env),
  gateway: resolveUrl('gateway_url', config.gateway_url, env),
  login: resolveUrl('login_url', config.login_url, env),
  file: resolveUrl('file_url', config.file_url, env),
  getFile: resolveUrl('getfile_url', config.getfile_url, env),
  self: resolveUrl('self_url', config.self_url, env),
  jsSdk: resolveUrl('jssdk_url', config.jssdk_url, env),
  resource: resolveUrl('Resource_url', config.Resource_url, env),
  supplier: resolveUrl('Supplier_url', config.Supplier_url, env),
  trace: resolveUrl('trace_url', config.trace_url, env),
  stream: resolveUrl('stream_url', config.stream_url, env),
  v8BaseData: resolveUrl('v8_baseData_url', config.v8_baseData_url, env),
  view: resolveUrl('view_url', config.view_url, env),
  abpBase: resolveUrl('abpBase_url', config.abpBase_url, env),
  esb: resolveUrl('esb_url', config.esb_url, env),
  ocr: resolveUrl('ocr_url', config.ocr_url, env),
  systemBaseData: resolveUrl('systemBaseData_url', config.systemBaseData_url, env),
  taskCenter: resolveUrl('taskCenter', config.taskCenter, env),
  customer: resolveUrl('customer', config.customer, env),
  signalR: resolveUrl('signalR_url', config.signalR_url, env),
  tgsSolutionV2: resolveUrl('tgsSolutionV2_url', config.tgsSolutionV2_url, env),
  estimatePrice: resolveUrl('estimatePrice_url', config.estimatePrice_url, env),
  businessDataSync: resolveUrl('businessDataSync_url', config.businessDataSync_url, env),
  baseDataDczy: resolveUrl('baseDataDCZY_url', config.baseDataDCZY_url, env),
  pmDczy: resolveUrl('pmDCZY_url', config.pmDCZY_url, env),
  platform: resolveUrl('platform_url', config.platform_url, env)
})
