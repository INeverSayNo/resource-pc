import { describe, expect, it, vi } from 'vitest'

vi.mock('./config', () => ({ GATEWAY_URL: 'https://api.example.com', CRYPT_TYPE: 1 }))

import { registerAccessTokenProvider } from '@/auth/bridge'
import { BaseApi } from './index'

const createApi = (protectedRequest = true) =>
  new BaseApi(
    {
      adapter: async (config) => ({
        data: String(config.headers?.Authorization || ''),
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      })
    },
    {},
    protectedRequest
  )

describe('BaseApi authentication', () => {
  it('injects the current token into protected requests', async () => {
    registerAccessTokenProvider(() => 'session-token')
    const result = await createApi().get<string>('/', undefined, true)
    expect(result).toEqual([null, 'bearer session-token'])
  })

  it('does not inject a token into the login client', async () => {
    registerAccessTokenProvider(() => 'existing-session')
    const result = await createApi(false).get<string>('/', undefined, true)
    expect(result).toEqual([null, ''])
  })

  it('keeps an explicit candidate token for pre-commit menu requests', async () => {
    registerAccessTokenProvider(() => 'old-session')
    const result = await createApi().get<string>('/', undefined, true, {
      headers: { Authorization: 'bearer candidate-session' }
    })
    expect(result).toEqual([null, 'bearer candidate-session'])
  })
})
