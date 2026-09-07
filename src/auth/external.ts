import type { LocationQuery, RouteLocationNormalized } from 'vue-router'

export type ExternalAuthRequest =
  | { type: 'external-token'; token: string }
  | { type: 'erp-cookie'; cookie: string }
  | { type: 'oa'; username: string; password: string }

const SENSITIVE_KEYS = ['token', 't', 'isoa', 'name', 'pwd'] as const

const firstString = (value: LocationQuery[string]): string => {
  if (typeof value === 'string') return value
  if (Array.isArray(value))
    return value.find((item): item is string => typeof item === 'string') || ''
  return ''
}

export interface ExternalAuthQuery {
  request: ExternalAuthRequest | null
  query: LocationQuery
  hasSensitiveParams: boolean
}

export const consumeExternalAuthQuery = (to: RouteLocationNormalized): ExternalAuthQuery => {
  const query = { ...to.query }
  const hasSensitiveParams = SENSITIVE_KEYS.some((key) => Object.hasOwn(query, key))
  const token = firstString(query.token).trim()
  const cookie = firstString(query.t).trim()
  const isOa = firstString(query.isoa).toLowerCase() === 'true'
  const username = firstString(query.name)
  const password = firstString(query.pwd)
  for (const key of SENSITIVE_KEYS) delete query[key]

  let request: ExternalAuthRequest | null = null
  if (token) request = { type: 'external-token', token }
  else if (cookie) request = { type: 'erp-cookie', cookie }
  else if (isOa && username && password) request = { type: 'oa', username, password }
  return { request, query, hasSensitiveParams }
}
