import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMocks = vi.hoisted(() => ({
  config: undefined as unknown,
  get: vi.fn(),
  post: vi.fn()
}))

vi.mock('@/request', () => ({
  BaseApi: class {
    constructor(config: unknown) {
      requestMocks.config = config
    }
    get = requestMocks.get
    post = requestMocks.post
  }
}))

vi.mock('@/request/config', () => ({
  PATH_URL: 'https://resource.example.com',
  USE_CRY_PTO: true
}))

import {
  batchQueryPolicies,
  buildPolicyPageParams,
  getAllPolicyGoods,
  getPolicyChannelStations,
  getPolicyDetails,
  importPolicies,
  queryPolicyChannels,
  searchPolicies,
  updatePolicyContainerAndRemark
} from './api'

const ok = (data: unknown, extra: Record<string, unknown> = {}) =>
  Promise.resolve([null, { isSuccessful: true, data, ...extra }])

describe('good-price-policy API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requestMocks.get.mockImplementation(() => ok([]))
    requestMocks.post.mockImplementation(() => ok({}))
  })

  it('uses resource endpoint and encryption', () => {
    expect(requestMocks.config).toEqual({ baseURL: 'https://resource.example.com', crypto: true })
  })

  it('builds legacy list pagination and uses POST', async () => {
    requestMocks.post.mockImplementationOnce(() => ok({ totalCount: 1, items: [{ id: 'p1' }] }))
    const params = { page: 2, pageSize: 20, xfkey: '文号' }
    const [error, result] = await searchPolicies(params)
    expect(error).toBeNull()
    expect(result.totalCount).toBe(1)
    expect(requestMocks.post).toHaveBeenCalledWith(
      '/api/resource/railway/search-policy-inner',
      buildPolicyPageParams(params),
      true,
      undefined
    )
    expect(buildPolicyPageParams(params)).toMatchObject({
      page: 2,
      pageSize: 20,
      limit: 20,
      start: 0,
      isExport: true,
      isAllPage: true,
      totalRowsCount: 0
    })
  })

  it('uses safe GET paths and query params', async () => {
    await getPolicyDetails('政策/1')
    await getAllPolicyGoods('钢/材')
    await getPolicyChannelStations('政策/1')
    expect(requestMocks.get.mock.calls[0]).toEqual([
      '/api/resource/railway/%E6%94%BF%E7%AD%96%2F1/policy-details',
      undefined,
      true,
      undefined
    ])
    expect(requestMocks.get.mock.calls[1]).toEqual([
      '/api/resource/railway/all-goods',
      { goodsName: '钢/材' },
      true,
      undefined
    ])
    expect(requestMocks.get.mock.calls[2][0]).toContain('%E6%94%BF%E7%AD%96%2F1/policy-channel')
  })

  it('queries channels and joins edited container types', async () => {
    await queryPolicyChannels({ level: 0, includeExpiration: false, coefficient: -60 })
    await updatePolicyContainerAndRemark({
      id: '1',
      containerTypes: ['T20', 'T40'],
      remark: '备注'
    })
    expect(requestMocks.post.mock.calls[0][0]).toBe('/api/resource/railway/policy-channel')
    expect(requestMocks.post.mock.calls[1][1]).toEqual({
      id: '1',
      containerTypes: ['T20', 'T40'],
      containerType: 'T20,T40',
      remark: '备注'
    })
  })

  it('uploads batch query and import files as multipart form data', async () => {
    requestMocks.post.mockImplementationOnce(() => ok('/result.xlsx'))
    requestMocks.post.mockImplementationOnce(() => ok(null))
    const file = new File(['x'], 'policy.xlsx')
    await expect(batchQueryPolicies(file)).resolves.toEqual([null, '/result.xlsx'])
    await expect(importPolicies(file)).resolves.toEqual([null, true])
    for (const call of requestMocks.post.mock.calls) {
      expect(call[1]).toBeInstanceOf(FormData)
      expect(call[3]).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
    }
  })

  it('returns typed fallbacks on tuple errors', async () => {
    const failure = { message: '失败' }
    requestMocks.post.mockImplementationOnce(() => Promise.resolve([failure, null]))
    requestMocks.get.mockImplementationOnce(() => Promise.resolve([failure, null]))
    const [listError, page] = await searchPolicies({ page: 1, pageSize: 50 })
    const [detailError, details] = await getPolicyDetails('1')
    expect(listError).toBe(failure)
    expect(page).toMatchObject({ totalCount: 0, items: [] })
    expect(detailError).toBe(failure)
    expect(details).toEqual([])
  })
})
