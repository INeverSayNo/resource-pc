import { DcToolsRequest } from '@dczy/tie-tools'
import type { ResponseError, defineConfig, interceptorsUse } from '@dczy/tie-tools'
import axios from 'axios'
import type { AxiosError, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { getAccessToken, notifyUnauthorized } from '@/auth/bridge'
import { CRYPT_TYPE, GATEWAY_URL } from './config'
import type { ApiResponseResult } from './types'

type InternalConfig = defineConfig & { __retryCount?: number }
type ErrorNotifier = (message: string) => void

const requestTokens = new WeakMap<object, string>()
const unauthorizedRequests = new Map<string, Promise<void>>()
const notifiedErrors = new WeakSet<object>()
let errorNotifier: ErrorNotifier = (message) => ElMessage.error(message)

export const setRequestErrorNotifier = (notifier: ErrorNotifier): void => {
  errorNotifier = notifier
}

const getAuthorization = (config: defineConfig): string => {
  const headers = config.headers
  if (!headers) return ''
  const value =
    typeof headers.get === 'function'
      ? headers.get('Authorization')
      : (headers as Record<string, unknown>).Authorization
  return typeof value === 'string' ? value : ''
}

const getBearerToken = (authorization: string): string =>
  authorization.replace(/^bearer\s+/i, '').trim()

export const injectAccessToken = async (
  config: defineConfig,
  token = getAccessToken()
): Promise<defineConfig> => {
  let authorization = getAuthorization(config)
  if (!authorization && token) {
    config.headers ??= {}
    ;(config.headers as Record<string, unknown>).Authorization = `bearer ${token}`
    authorization = `bearer ${token}`
  }

  const requestToken = getBearerToken(authorization)
  if (requestToken) requestTokens.set(config, requestToken)
  return config
}

const scheduleUnauthorized = (requestToken: string): void => {
  if (!requestToken || unauthorizedRequests.has(requestToken)) return
  const pending = notifyUnauthorized(requestToken)
    .catch((error) => console.error('会话过期处理失败', error))
    .finally(() => unauthorizedRequests.delete(requestToken))
  unauthorizedRequests.set(requestToken, pending)
  void pending
}

const getResponseToken = (value: unknown): string => {
  if (!value || typeof value !== 'object') return ''
  const config = Reflect.get(value, 'config')
  return config && typeof config === 'object' ? requestTokens.get(config) || '' : ''
}

const getPayload = (response: AxiosResponse): Record<string, unknown> | null =>
  response.data && typeof response.data === 'object'
    ? (response.data as Record<string, unknown>)
    : null

export const isBusinessFailure = (response: AxiosResponse): boolean => {
  if ((response.config as defineConfig).disableResponseError) return false
  const payload = getPayload(response)
  return payload?.isSuccessful === false || payload?.IsSuccessful === false
}

const isPayloadUnauthorized = (response: AxiosResponse): boolean => {
  const code = getPayload(response)?.code
  return code === 401 || code === '401'
}

const createResponseError = (response: AxiosResponse, fallback: string): Error => {
  const payload = getPayload(response)
  const message = payload?.message || payload?.Message || payload?.error_description || fallback
  return Object.assign(new Error(String(message)), { response })
}

const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return '网络请求错误'
  const response = Reflect.get(error, 'response') as AxiosResponse | undefined
  const payload = response ? getPayload(response) : null
  const nestedError = payload?.error
  if (nestedError && typeof nestedError === 'object') {
    const nestedMessage = Reflect.get(nestedError, 'message')
    if (nestedMessage) return String(nestedMessage)
  }
  return String(
    payload?.message ||
      payload?.Message ||
      payload?.error_description ||
      Reflect.get(error, 'message') ||
      '网络请求错误'
  )
}

const notifyErrorOnce = (error: unknown): void => {
  if (!error || typeof error !== 'object' || axios.isCancel(error)) return
  const config = Reflect.get(error, 'config') || Reflect.get(Reflect.get(error, 'response') || {}, 'config')
  if (config?.disableResponseError || notifiedErrors.has(error)) return
  notifiedErrors.add(error)
  errorNotifier(getErrorMessage(error))
}

export const shouldRetry = (error: AxiosError): boolean => {
  const config = error.config as InternalConfig | undefined
  return error.response?.status === 503 && Boolean(config) && (config?.__retryCount || 0) < 1
}

export const toResponseError = <E = unknown>(error: unknown): ResponseError<E> => {
  const response =
    error && typeof error === 'object' ? (Reflect.get(error, 'response') as AxiosResponse<E>) : undefined
  const payload = response?.data
  if (payload && typeof payload === 'object') return payload as unknown as ResponseError<E>
  return {
    code: response?.status || null,
    data: payload as E,
    details: null,
    message: getErrorMessage(error),
    validationErrors: null
  }
}

export class BaseApi extends DcToolsRequest {
  constructor(config?: defineConfig, use: interceptorsUse = {}, handleUnauthorized = true) {
    let retryRequest: ((config: InternalConfig) => Promise<AxiosResponse>) | undefined
    const baseConfig: defineConfig = {
      baseURL: config?.baseURL || GATEWAY_URL,
      isJwt: false,
      timeout: 90000,
      cryptoType: CRYPT_TYPE,
      ...config,
      crypto: Reflect.has(config || {}, 'crypto') ? config?.crypto : false
    }

    super(baseConfig, {
      ...use,
      onRequestFulfilled: async (requestConfig) => {
        const configured = use.onRequestFulfilled
          ? await use.onRequestFulfilled(requestConfig)
          : requestConfig
        return handleUnauthorized ? injectAccessToken(configured) : configured
      },
      onFulfilled: async (response) => {
        const processed = use.onFulfilled ? await use.onFulfilled(response) : response
        if (handleUnauthorized && (processed.status === 401 || isPayloadUnauthorized(processed))) {
          scheduleUnauthorized(getResponseToken(processed))
          throw createResponseError(processed, '登录信息验证失败或已过期')
        }
        if (isBusinessFailure(processed)) {
          const error = createResponseError(processed, '请求结果错误')
          notifyErrorOnce(error)
          throw error
        }
        return processed
      },
      onRejected: async (error) => {
        if (handleUnauthorized && error?.response?.status === 401) {
          scheduleUnauthorized(getResponseToken(error.response))
        }
        if (shouldRetry(error) && retryRequest) {
          const retryConfig = error.config as InternalConfig
          retryConfig.__retryCount = (retryConfig.__retryCount || 0) + 1
          return retryRequest(retryConfig)
        }
        notifyErrorOnce(error)
        return use.onRejected ? use.onRejected(error) : Promise.reject(error)
      }
    })

    retryRequest = (requestConfig) => this.service.request(requestConfig)
  }

  async requestResponse<T, E = unknown>(config: defineConfig): ApiResponseResult<T, E> {
    try {
      return [null, await this.service.request<T>(config)]
    } catch (error) {
      return [toResponseError<E>(error), null]
    }
  }
}

export class RequestScope {
  private controller = new AbortController()

  withSignal<T extends defineConfig>(config: T): T & { signal: AbortSignal } {
    return { ...config, signal: this.controller.signal }
  }

  cancel(reason?: string): void {
    this.controller.abort(reason)
  }

  renew(): void {
    this.controller.abort()
    this.controller = new AbortController()
  }
}

export const requireApiData = async <T>(result: import('./types').ApiResult<T>): Promise<T> => {
  const [error, data] = await result
  if (error) throw error
  return data
}

const decodeFilename = (value: string): string => {
  try {
    return decodeURIComponent(value.replace(/^UTF-8''/i, '').replace(/^['"]|['"]$/g, ''))
  } catch {
    return value.replace(/^['"]|['"]$/g, '')
  }
}

export const getDownloadFilename = (
  response: Pick<AxiosResponse, 'headers'>,
  fallback = 'download'
): string => {
  const header = response.headers
  const direct = typeof header.get === 'function' ? header.get('filename') : header.filename
  if (direct) return decodeFilename(String(direct))
  const disposition =
    typeof header.get === 'function'
      ? header.get('content-disposition')
      : header['content-disposition']
  const match = disposition && /filename\*?=([^;]+)/i.exec(String(disposition))
  return match ? decodeFilename(match[1].trim()) : fallback
}

export const saveBlob = (blob: Blob, fileName: string): void => {
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(objectUrl)
}

export async function Download(fileUrl: string, fileName = 'download'): Promise<void> {
  const response = await fetch(fileUrl)
  if (!response.ok) throw new Error(`文件下载失败：HTTP ${response.status}`)
  saveBlob(await response.blob(), fileName)
}

export type { ApiResult, ApiResponseResult } from './types'
export {
  ABPBASE_URL,
  FILE_URL,
  GETFILE_URL,
  PATH_URL,
  SUPPLIER_URL,
  SYSTEM_BASE_DATA_URL,
  TGS_SOLUTION_V2_URL,
  VIEW_URL
} from './config'
