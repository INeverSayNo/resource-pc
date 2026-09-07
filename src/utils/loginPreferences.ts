export interface LoginPreferences {
  rememberMe: boolean
  rememberedUsername: string
}

const PREFERENCES_KEY = 'vea-login-preferences-v1'
const LEGACY_SESSION_KEY = 'vea-session-v1'
const DEFAULT_PREFERENCES: LoginPreferences = { rememberMe: true, rememberedUsername: '' }

const parsePreferences = (value: string | null): LoginPreferences | null => {
  if (!value) return null
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
    const record = parsed as Record<string, unknown>
    return {
      rememberMe: typeof record.rememberMe === 'boolean' ? record.rememberMe : true,
      rememberedUsername:
        typeof record.rememberedUsername === 'string' ? record.rememberedUsername : ''
    }
  } catch {
    return null
  }
}

export const readLoginPreferences = (): LoginPreferences =>
  parsePreferences(localStorage.getItem(PREFERENCES_KEY)) || { ...DEFAULT_PREFERENCES }

export const saveLoginPreferences = (username: string, rememberMe: boolean): void => {
  localStorage.setItem(
    PREFERENCES_KEY,
    JSON.stringify({ rememberMe, rememberedUsername: rememberMe ? username : '' })
  )
}

export const migrateLegacyAuthStorage = (): void => {
  if (!localStorage.getItem(PREFERENCES_KEY)) {
    const legacyPreferences = parsePreferences(localStorage.getItem(LEGACY_SESSION_KEY))
    if (legacyPreferences) {
      saveLoginPreferences(legacyPreferences.rememberedUsername, legacyPreferences.rememberMe)
    }
  }

  localStorage.removeItem(LEGACY_SESSION_KEY)
  localStorage.removeItem('JsToken')
  localStorage.removeItem('CurUser')
  sessionStorage.removeItem(LEGACY_SESSION_KEY)
  sessionStorage.removeItem('userInfo')
}
