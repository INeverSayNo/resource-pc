import { beforeEach, describe, expect, it } from 'vitest'
import {
  migrateLegacyAuthStorage,
  readLoginPreferences,
  saveLoginPreferences
} from './loginPreferences'

describe('login preferences', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('stores only the remembered username preference', () => {
    saveLoginPreferences('tester', true)
    expect(readLoginPreferences()).toEqual({ rememberMe: true, rememberedUsername: 'tester' })
    expect(localStorage.getItem('vea-login-preferences-v1')).not.toContain('token')
  })

  it('migrates preferences and removes legacy authentication data', () => {
    localStorage.setItem(
      'vea-session-v1',
      JSON.stringify({ token: 'secret', rememberMe: true, rememberedUsername: 'legacy' })
    )
    localStorage.setItem('JsToken', 'secret')
    localStorage.setItem('CurUser', '{}')
    sessionStorage.setItem('userInfo', '{}')
    migrateLegacyAuthStorage()
    expect(readLoginPreferences().rememberedUsername).toBe('legacy')
    expect(localStorage.getItem('vea-session-v1')).toBeNull()
    expect(localStorage.getItem('JsToken')).toBeNull()
    expect(localStorage.getItem('CurUser')).toBeNull()
    expect(sessionStorage.getItem('userInfo')).toBeNull()
  })
})
