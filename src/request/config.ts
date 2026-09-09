import type { ConfigOptions, RuntimeEnv } from './types'
import { normalizeRuntimeEndpoints } from './runtimeConfig'

const response = await fetch(`/config.json?t=${Date.now()}`)
if (!response.ok) throw new Error(`运行配置加载失败：HTTP ${response.status}`)

const data = (await response.json()) as ConfigOptions

if (Reflect.has(data, 'system_config')) window.system_config = data.system_config

const configuredEnv = import.meta.env.VITE_ENV_TYPE
export const env: RuntimeEnv = ['dev', 'test', 'pro'].includes(configuredEnv)
  ? (configuredEnv as RuntimeEnv)
  : 'pro'

export const runtimeEndpoints = normalizeRuntimeEndpoints(data, env)

export const PATH_URL = runtimeEndpoints.resourceApi
export const GATEWAY_URL = runtimeEndpoints.gateway
export const LOGIN_URL = runtimeEndpoints.login
export const FILE_URL = runtimeEndpoints.file
export const GETFILE_URL = runtimeEndpoints.getFile
export const SELF_URL = runtimeEndpoints.self
export const JSSDK_URL = runtimeEndpoints.jsSdk
export const RESOURCE_URL = runtimeEndpoints.resource
export const SUPPLIER_URL = runtimeEndpoints.supplier
export const TRACE_URL = runtimeEndpoints.trace
export const STREAM_URL = runtimeEndpoints.stream
export const V8_BASEDATA_URL = runtimeEndpoints.v8BaseData
export const VIEW_URL = runtimeEndpoints.view
export const ABPBASE_URL = runtimeEndpoints.abpBase
export const ESB_URL = runtimeEndpoints.esb
export const OCR_URL = runtimeEndpoints.ocr
export const SYSTEM_BASE_DATA_URL = runtimeEndpoints.systemBaseData
export const TASK_CENTER_URL = runtimeEndpoints.taskCenter
export const CUSTOMER_URL = runtimeEndpoints.customer
export const SIGNALR_URL = runtimeEndpoints.signalR
export const TGS_SOLUTION_V2_URL = runtimeEndpoints.tgsSolutionV2
export const ESTIMATE_PRICE_URL = runtimeEndpoints.estimatePrice
export const BUSINESS_DATA_SYNC_URL = runtimeEndpoints.businessDataSync
export const BASE_DATA_DCZY_URL = runtimeEndpoints.baseDataDczy
export const PM_DCZY_URL = runtimeEndpoints.pmDczy
export const PLATFORM_URL = runtimeEndpoints.platform

export const ApplicationId = data.applicationId
export const USE_CRY_PTO = data.useCrypto
export const CRYPT_TYPE = data.cryptoType
export const LOGIN_CLIENT_ID = data.auth.clientId
// 浏览器端 clientSecret 仅兼容既有后端协议，不具备保密性。
export const LOGIN_CLIENT_SECRET = data.auth.clientSecret
