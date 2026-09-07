import type { UserInfo } from '@/types/user'

const decodeBase64Url = (value: string): string => {
  if (!value) {
    throw new Error('Token Payload 不是合法的 Base64URL')
  }

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = window.atob(padded)
  return new TextDecoder().decode(Uint8Array.from(binary, (value) => value.charCodeAt(0)))
}

export const getUserId = (userInfo: UserInfo): string => {
  const value = userInfo.erp_userid || userInfo.sub
  return typeof value === 'string' ? value.trim() : ''
}

export const decodeJwtUser = (token: string): UserInfo | null => {
  if (typeof token !== 'string' || !token.trim()) return null

  const segments = token.split('.')
  if (segments.length !== 3) return null
  if (segments.some((segment) => !segment || !/^[A-Za-z0-9_-]+$/.test(segment))) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(segments[1]))
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null
    }

    return parsed as UserInfo
  } catch {
    return null
  }
}
