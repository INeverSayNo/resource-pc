import { AxiosHeaders } from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerAccessTokenProvider, registerUnauthorizedHandler } from '@/auth/bridge'

vi.mock('./config', () => ({
  CRYPT_TYPE: 1,
  GATEWAY_URL: 'https://gateway.example.com'
}))

import {
  BaseApi,
  RequestScope,
  getDownloadFilename,
  injectAccessToken,
  isBusinessFailure,
  setRequestErrorNotifier,
  shouldRetry
} from './index'

const response = (data: unknown): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() }
})

describe('request compatibility contract', () => {
  beforeEach(() => {
    registerAccessTokenProvider(() => '')
    registerUnauthorizedHandler(() => undefined)
    setRequestErrorNotifier(() => undefined)
  })

  it('injects a bearer token without overwriting an explicit authorization header', async () => {
    const injected = await injectAccessToken({ headers: {} }, 'session-token')
    expect((injected.headers as Record<string, string>).Authorization).toBe('bearer session-token')

    const explicit = await injectAccessToken(
      { headers: { Authorization: 'bearer explicit-token' } },
      'session-token'
    )
    expect((explicit.headers as Record<string, string>).Authorization).toBe(
      'bearer explicit-token'
    )
  })

  it('keeps the tie-tools tuple result at the API boundary', async () => {
    const api = new BaseApi({ crypto: false })
    api.service.defaults.adapter = async (config) => ({
      ...response({ rows: [1] }),
      config
    })
    const [error, data] = await api.get<{ rows: number[] }>('/items')
    expect(error).toBeNull()
    expect(data).toEqual({ rows: [1] })
  })

  it('recognizes only explicit legacy business failures', () => {
    expect(isBusinessFailure(response({ isSuccessful: false }))).toBe(true)
    expect(isBusinessFailure(response({ IsSuccessful: false }))).toBe(true)
    expect(isBusinessFailure(response({ rows: [] }))).toBe(false)
  })

  it('notifies once for one business failure', async () => {
    const notify = vi.fn()
    setRequestErrorNotifier(notify)
    const api = new BaseApi({ crypto: false })
    api.service.defaults.adapter = async (config) => ({
      ...response({ isSuccessful: false, message: '业务失败' }),
      config
    })

    const [error] = await api.get('/items')
    expect(error?.message).toBe('业务失败')
    expect(notify).toHaveBeenCalledTimes(1)
  })

  it('de-duplicates concurrent unauthorized handling for one session token', async () => {
    let release = () => undefined
    const pending = new Promise<void>((resolve) => {
      release = resolve
    })
    const unauthorized = vi.fn(() => pending)
    registerAccessTokenProvider(() => 'same-session')
    registerUnauthorizedHandler(unauthorized)
    const api = new BaseApi({ crypto: false })
    api.service.defaults.adapter = async (config) => ({
      ...response({ code: 401 }),
      status: 401,
      config
    })

    await Promise.all([api.get('/first'), api.get('/second')])
    expect(unauthorized).toHaveBeenCalledTimes(1)
    release()
  })

  it('retries a 503 only once', () => {
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig & {
      __retryCount?: number
    }
    const error = {
      config,
      response: { status: 503 }
    } as AxiosError
    expect(shouldRetry(error)).toBe(true)
    config.__retryCount = 1
    expect(shouldRetry(error)).toBe(false)
  })

  it('parses direct and content-disposition filenames', () => {
    expect(getDownloadFilename({ headers: new AxiosHeaders({ filename: 'report.xlsx' }) })).toBe(
      'report.xlsx'
    )
    expect(
      getDownloadFilename({
        headers: new AxiosHeaders({
          'content-disposition': "attachment; filename*=UTF-8''%E8%BD%A6%E7%AB%99.xlsx"
        })
      })
    ).toBe('车站.xlsx')
  })

  it('provides replaceable AbortController scopes', () => {
    const scope = new RequestScope()
    const first = scope.withSignal({})
    scope.renew()
    const second = scope.withSignal({})
    expect(first.signal?.aborted).toBe(true)
    expect(second.signal?.aborted).toBe(false)
  })
})
