import type { ApiResult } from '@/request'
import type { UserInfo } from '@/types/user'

const decodeBase64Url = (value: string): string => {
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) {
    throw new Error('Token Payload 不是合法的 Base64URL')
  }

  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = window.atob(padded)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export const getUserId = (userInfo: UserInfo): string => {
  const value = userInfo.erp_userid || userInfo.sub
  return typeof value === 'string' ? value.trim() : ''
}

export const decodeJwtUser = (token: string, now = Date.now()): ApiResult<UserInfo> => {
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

    const claims = parsed as UserInfo
    const nowInSeconds = Math.floor(now / 1000)
    if (claims.exp !== undefined) {
      if (typeof claims.exp !== 'number' || !Number.isFinite(claims.exp)) {
        return [new Error('Token exp 声明无效'), null]
      }
      if (claims.exp <= nowInSeconds) return [new Error('登录会话已过期'), null]
    }
    if (claims.nbf !== undefined) {
      if (typeof claims.nbf !== 'number' || !Number.isFinite(claims.nbf)) {
        return [new Error('Token nbf 声明无效'), null]
      }
      if (claims.nbf > nowInSeconds) return [new Error('Token 尚未生效'), null]
    }
    if (!getUserId(claims)) return [new Error('Token 缺少用户标识'), null]
    return [null, claims]
  } catch (error) {
    return [error instanceof Error ? error : new Error('Token 解析失败'), null]
  }
}
