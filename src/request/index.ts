import { DcToolsRequest } from '@dczy/tie-tools'
import type { defineConfig, interceptorsUse } from '@dczy/tie-tools'
import { getAccessToken, notifyUnauthorized } from '@/auth/bridge'
import { CRYPT_TYPE, GATEWAY_URL } from './config'

const requestTokens = new WeakMap<object, string>()
const unauthorizedRequests = new Map<string, Promise<void>>()

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

const injectAccessToken = async (config: defineConfig): Promise<defineConfig> => {
  let authorization = getAuthorization(config)
  if (!authorization) {
    const token = getAccessToken()
    if (token) {
      config.headers ??= {}
      ;(config.headers as Record<string, unknown>).Authorization = `bearer ${token}`
      authorization = `bearer ${token}`
    }
  }

  const token = getBearerToken(authorization)
  if (token) requestTokens.set(config, token)
  return config
}

const scheduleUnauthorized = (requestToken: string): void => {
  if (!requestToken || unauthorizedRequests.has(requestToken)) return
  const pending = notifyUnauthorized(requestToken)
    .catch((error) => console.error('会话过期处理失败', error))
    .finally(() => {
      unauthorizedRequests.delete(requestToken)
    })
  unauthorizedRequests.set(requestToken, pending)
  void pending
}

const getResponseToken = (value: unknown): string => {
  if (!value || typeof value !== 'object') return ''
  const config = Reflect.get(value, 'config')
  return config && typeof config === 'object' ? requestTokens.get(config) || '' : ''
}

export class BaseApi extends DcToolsRequest {
  constructor(config?: defineConfig, use: interceptorsUse = {}, handleUnauthorized = true) {
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
        if (handleUnauthorized && response.status === 401) {
          scheduleUnauthorized(getResponseToken(response))
          return Promise.reject(Object.assign(new Error('Unauthorized'), { response }))
        }
        return use.onFulfilled ? use.onFulfilled(response) : response
      },
      onRejected: (error) => {
        if (handleUnauthorized && error?.response?.status === 401) {
          scheduleUnauthorized(getResponseToken(error.response))
        }
        return use.onRejected ? use.onRejected(error) : Promise.reject(error)
      }
    })
  }
}

export type { ApiError, ApiResult } from './types'
export { getApiErrorMessage, normalizeApiResult, toApiError } from './result'
