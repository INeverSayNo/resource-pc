import type { ApiError, ApiErrorObject, ApiResult } from './types'

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const toApiError = (value: unknown, fallback = '请求失败'): ApiError => {
  if (value instanceof Error || typeof value === 'string') return value
  if (isObject(value)) return value as ApiErrorObject
  return new Error(fallback)
}

export const normalizeApiResult = async <T>(
  request: Promise<readonly [unknown, T | null]>,
  fallback = '请求失败'
): Promise<ApiResult<T>> => {
  try {
    const [error, data] = await request
    if (error) return [toApiError(error, fallback), null]
    if (data === null || data === undefined) return [new Error(fallback), null]
    return [null, data]
  } catch (error) {
    return [toApiError(error, fallback), null]
  }
}

export const getApiErrorMessage = (error: ApiError, fallback = '请求失败'): string => {
  if (typeof error === 'string') return error || fallback
  if (error instanceof Error) return error.message || fallback

  const candidates = [
    error.message,
    error.Message,
    error.error_description,
    error.error,
    error.code
  ]
  const message = candidates.find((value) => value !== undefined && value !== null && value !== '')
  return message === undefined ? fallback : String(message)
}
