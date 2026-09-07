import type { ConfigOptions } from './types'

const data: ConfigOptions = await fetch(`/config.json?t=${Date.now()}`).then((res) => res.json())

if (Reflect.has(data, 'system_config')) {
  window['system_config'] = data.system_config
}

const {
  login_url,
  file_url,
  getfile_url,
  applicationId,
  self_url,
  jssdk_url,
  gateway_url,
  Resource_url,
  Supplier_url,
  trace_url,
  stream_url,
  useCrypto,
  cryptoType,
  auth,
  v8_baseData_url
} = data

const configuredEnv = import.meta.env.VITE_ENV_TYPE
type RuntimeEnv = 'dev' | 'test' | 'pro'
export const env: RuntimeEnv = ['dev', 'test', 'pro'].includes(configuredEnv)
  ? (configuredEnv as RuntimeEnv)
  : 'pro'

export const JSSDK_URL: string = jssdk_url[env]
export const PATH_URL: string = gateway_url[env]
export const GATEWAY_URL: string = gateway_url[env]
export const LOGIN_URL: string = login_url[env]
export const FILE_URL: string = file_url[env]
export const GETFILE_URL: string = getfile_url[env]
export const ApplicationId: string = applicationId
export const SELF_URL: string = self_url[env]
export const RESOURCE_URL: string = Resource_url[env]
export const SUPPLIER_URL: string = Supplier_url[env]
export const TRACE_URL: string = trace_url[env]
export const STREAM_URL: string = stream_url[env]
export const V8_BASEDATA_URL: string = v8_baseData_url[env]
export const USE_CRY_PTO: boolean = useCrypto
export const CRYPT_TYPE: number = cryptoType
export const LOGIN_CLIENT_ID: string = auth.clientId
// 浏览器端 clientSecret 仅用于兼容现有后端协议，属于公开运行配置，不具备保密性。
export const LOGIN_CLIENT_SECRET: string = auth.clientSecret
