import type { ApiResult } from '@/request'
import type { UserInfo } from '@/types/user'

const decodeBase64Url = (value: string): string => {
  if (!value) {
    throw new Error('Token Payload 不是合法的 Base64URL')
  }

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(window.atob(escape(normalized)))
}

export const getUserId = (userInfo: UserInfo): string => {
  const value = userInfo.erp_userid || userInfo.sub
  return typeof value === 'string' ? value.trim() : ''
}

export const decodeJwtUser = (token: string, now = Date.now()): [Error | null, UserInfo | null] => {
  if (typeof token !== 'string' || !token.trim()) return [new Error('Token 不能为空'), null]

  const segments = token.split('.')
  if (segments.length !== 3) return [new Error('Token 必须包含三段'), null]
  if (segments.some((segment) => !segment || !/^[A-Za-z0-9_-]+$/.test(segment))) {
    return [new Error('Token 包含无效的 Base64URL 分段'), null]
  }

  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(segments[1]))
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return [new Error('Token Payload 必须是对象'), null]
    }

    return [null, parsed as UserInfo]
  } catch (error) {
    return [error instanceof Error ? error : new Error('Token 解析失败'), null]
  }
}
