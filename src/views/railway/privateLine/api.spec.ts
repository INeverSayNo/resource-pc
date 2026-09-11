import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMocks = vi.hoisted(() => ({
  config: undefined as unknown,
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn()
}))

vi.mock('@/request', () => ({
  BaseApi: class {
    constructor(config: unknown) {
      requestMocks.config = config
    }

    get = requestMocks.get
    post = requestMocks.post
    put = requestMocks.put
  }
}))

vi.mock('@/request/config', () => ({
  PATH_URL: 'https://resource.example.com',
  USE_CRY_PTO: true
}))

import {
  buildPrivateLinePageParams,
  createPrivateLine,
  getPrivateLineDetail,
  queryPrivateLines,
  updatePrivateLine
} from './api'

const ok = (data: unknown = true) => Promise.resolve([null, { isSuccessful: true, data }])

describe('private-line API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requestMocks.get.mockImplementation(() => ok({}))
    requestMocks.post.mockImplementation(() => ok(true))
    requestMocks.put.mockImplementation(() => ok(true))
  })

  it('uses the resource endpoint and encryption configuration', () => {
    expect(requestMocks.config).toEqual({
      baseURL: 'https://resource.example.com',
      crypto: true
    })
  })

  it('builds legacy pagination fields and sends the list request as POST', async () => {
    const controller = new AbortController()
    requestMocks.post.mockImplementationOnce(() =>
      ok({ totalCount: 1, items: [{ id: 'line-1' }], isSuccessful: true, message: '' })
    )

    const params = { page: 2, pageSize: 30, name: '专用线', isSend: true }
    const [error, page] = await queryPrivateLines(params, { signal: controller.signal })

    expect(error).toBeNull()
    expect(page.totalCount).toBe(1)
    expect(requestMocks.post).toHaveBeenCalledWith(
      '/api/resource/railway/private-page',
      buildPrivateLinePageParams(params),
      true,
      { signal: controller.signal }
    )
    expect(buildPrivateLinePageParams(params)).toMatchObject({
      page: 2,
      pageSize: 30,
      limit: 30,
      start: 0,
      isExport: true,
      isAllPage: true
    })
  })

  it('does not add pagination to detail GET and safely encodes IDs', async () => {
    const controller = new AbortController()
    await getPrivateLineDetail('线/1', { signal: controller.signal })

    expect(requestMocks.get).toHaveBeenCalledWith(
      '/api/resource/railway/%E7%BA%BF%2F1/private-line',
      undefined,
      true,
      { signal: controller.signal }
    )
  })

  it('uses POST for create and PUT for update', async () => {
    await expect(createPrivateLine('站/1', { name: '新线' })).resolves.toEqual([null, true])
    await expect(updatePrivateLine('线/1', { name: '改名' })).resolves.toEqual([null, true])

    expect(requestMocks.post).toHaveBeenCalledWith(
      '/api/resource/railway/%E7%AB%99%2F1/private-line',
      { name: '新线' },
      true
    )
    expect(requestMocks.put).toHaveBeenCalledWith(
      '/api/resource/railway/%E7%BA%BF%2F1/private-line',
      { name: '改名' },
      true
    )
  })

  it('returns typed fallbacks for tuple errors', async () => {
    const failure = { message: '请求失败' }
    requestMocks.post.mockImplementationOnce(() => Promise.resolve([failure, null]))
    requestMocks.get.mockImplementationOnce(() => Promise.resolve([failure, null]))

    const [listError, page] = await queryPrivateLines({ page: 1, pageSize: 20 })
    const [detailError, detail] = await getPrivateLineDetail('line-1')

    expect(listError).toBe(failure)
    expect(page).toMatchObject({ totalCount: 0, items: [] })
    expect(detailError).toBe(failure)
    expect(detail).toEqual({})
  })
})
