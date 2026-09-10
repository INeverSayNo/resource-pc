import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  requestResponse: vi.fn(),
  saveBlob: vi.fn(),
  getDownloadFilename: vi.fn(() => '港口模板.xlsx')
}))

vi.mock('@/request', () => ({
  BaseApi: class {
    get = requestMocks.get
    post = requestMocks.post
    delete = requestMocks.delete
    requestResponse = requestMocks.requestResponse
  },
  getDownloadFilename: requestMocks.getDownloadFilename,
  saveBlob: requestMocks.saveBlob,
  toResponseError: (error: Error) => ({ message: error.message })
}))

vi.mock('@/request/config', () => ({
  PATH_URL: 'https://resource.example.com',
  USE_CRY_PTO: true
}))

import {
  bindFiles,
  createContact,
  createImage,
  createImages,
  createPort,
  createStowage,
  createTrafficability,
  createVisit,
  createWharf,
  createWorkFee,
  createWorkZone,
  deleteContact,
  deleteFile,
  deleteImage,
  deleteStowage,
  deleteTrafficability,
  deleteWorkFee,
  downloadStowageTemplate,
  downloadWorkFeeTemplate,
  getPortDetail,
  importStowage,
  importWorkFees,
  listContacts,
  listFiles,
  listImages,
  listStowage,
  listTrafficability,
  listWharfs,
  listWorkFees,
  listWorkZones,
  queryPorts,
  queryVisits,
  updateContact,
  updatePort,
  updateStowage,
  updateTrafficability,
  updateWharf,
  updateWorkFee,
  updateWorkZone
} from './index'

const ok = (data: unknown = true) => Promise.resolve([null, { isSuccessful: true, data }])

describe('waterway port API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requestMocks.get.mockImplementation(() => ok([]))
    requestMocks.post.mockImplementation(() => ok(true))
    requestMocks.delete.mockImplementation(() => ok(true))
  })

  it('keeps list and detail URLs, pagination fields, encryption and cancellation', async () => {
    const controller = new AbortController()
    requestMocks.post.mockImplementationOnce(() =>
      ok({ items: [{ _id: 'port-1', PortAreaName: '港区' }], totalCount: 1 })
    )
    const [error, page] = await queryPorts(
      { page: 2, pageSize: 20, portName: '测试港' },
      { signal: controller.signal }
    )
    expect(error).toBeNull()
    expect(page.items?.[0]).toMatchObject({ _id: 'port-1', PortAreaName: '港区' })
    expect(requestMocks.post).toHaveBeenCalledWith(
      '/api/resource/water-port/query-by-portpage',
      { page: 2, pageSize: 20, portName: '测试港', limit: 20, KeyWords: undefined },
      true,
      { signal: controller.signal }
    )

    requestMocks.get.mockImplementationOnce(() => ok({ waterPort: { id: 'port-1' } }))
    await getPortDetail('港/1', { signal: controller.signal })
    expect(requestMocks.get).toHaveBeenLastCalledWith(
      '/api/resource/water-port/query-by-portid?id=%E6%B8%AF%2F1',
      undefined,
      true,
      { signal: controller.signal }
    )
  })

  it('keeps create and update payloads and returns mutation booleans', async () => {
    requestMocks.post.mockImplementationOnce(() => ok('new-port-id'))
    await expect(createPort({ waterPort: { portName: '新港' } })).resolves.toEqual([
      null,
      'new-port-id'
    ])
    await updatePort('port-1', { portName: '新名称' })
    expect(requestMocks.post).toHaveBeenNthCalledWith(
      1,
      '/api/resource/water-port/port-create',
      { waterPort: { portName: '新港' } },
      true,
      undefined
    )
    expect(requestMocks.post).toHaveBeenNthCalledWith(
      2,
      '/api/resource/water-port/port-1/port-update',
      { portName: '新名称' },
      true
    )

    requestMocks.post.mockImplementationOnce(() => ok(false))
    await expect(createVisit({ businessId: 'port-1' })).resolves.toEqual([null, false])
  })

  it('keeps contact, wharf, work-zone and trafficability contracts', async () => {
    await listContacts('port-1')
    await createContact({ contactName: '张三' })
    await updateContact('contact-1', { contactName: '李四' })
    await deleteContact('contact-1')
    await listWharfs('port-1')
    await createWharf({ wharfName: '一码头' })
    await updateWharf('wharf/1', { wharfName: '二码头' })
    await listWorkZones('port-1')
    await createWorkZone({ WorkZoneName: '作业区' })
    await updateWorkZone('zone-1', { WorkZoneName: '新作业区' })
    await listTrafficability('port-1')
    await createTrafficability({ type: '吞吐量' })
    await updateTrafficability('traffic-1', { numerical: 10 })
    await deleteTrafficability('traffic-1')

    expect(requestMocks.get.mock.calls.map((call) => call[0])).toEqual([
      '/api/resource/water-port/port-1/contact-byPortId',
      '/api/resource/water-port/port-1/wharf-byPortId',
      '/api/resource/water-port/workZone-queryById?ids=port-1',
      '/api/resource/water-port/trafficability-queryById?id=port-1'
    ])
    expect(requestMocks.post.mock.calls.map((call) => call[0])).toEqual([
      '/api/resource/water-port/contact-create',
      '/api/resource/water-port/contact-1/contact-update',
      '/api/resource/water-port/wharf-create',
      '/api/resource/water-port/wharf-update?id=wharf%2F1',
      '/api/resource/water-port/workzone-create',
      '/api/resource/water-port/zone-1/workzone-update',
      '/api/resource/water-port/trafficability-create',
      '/api/resource/water-port/traffic-1/trafficability-update'
    ])
    expect(requestMocks.delete.mock.calls.map((call) => call[0])).toEqual([
      '/api/resource/water-port/contact-1/contact-scrap',
      '/api/resource/water-port/traffic-1/trafficability-scrap'
    ])
  })

  it('keeps stowage and work-fee CRUD and safely encodes import paths', async () => {
    await listStowage('port-1')
    await createStowage({ amount: 1 })
    await updateStowage('stowage-1', { amount: 2 })
    await deleteStowage('stowage-1')
    await importStowage('port-1', '临时目录/堆存费 表.xlsx')
    await listWorkFees('港/1')
    await createWorkFee({ amount: 3 })
    await updateWorkFee({ id: 'fee-1', amount: 4 })
    await deleteWorkFee('fee/1')
    await importWorkFees('port-1', '临时目录/作业费 表.xlsx')

    expect(requestMocks.get.mock.calls[1][0]).toBe(
      '/api/resource/water-port/port-1/import-stowageV2?path=%E4%B8%B4%E6%97%B6%E7%9B%AE%E5%BD%95%2F%E5%A0%86%E5%AD%98%E8%B4%B9%20%E8%A1%A8.xlsx'
    )
    expect(requestMocks.post).toHaveBeenCalledWith(
      '/api/resource/water-port/jobfee-queryById-new?ids=%E6%B8%AF%2F1',
      expect.objectContaining({ limit: 25, page: 1, isExport: true, isAllPage: true }),
      true,
      undefined
    )
    expect(requestMocks.post).toHaveBeenCalledWith(
      '/api/resource/water-port/port-1/import-workfee-new?path=%E4%B8%B4%E6%97%B6%E7%9B%AE%E5%BD%95%2F%E4%BD%9C%E4%B8%9A%E8%B4%B9%20%E8%A1%A8.xlsx',
      undefined,
      true
    )
  })

  it('keeps attachment, image and visit contracts', async () => {
    await listFiles('port-1')
    await bindFiles('port-1', { FileAttachs: [{ id: 'file-1' }] })
    await deleteFile('file-1')
    await listImages('port-1')
    await createImage({ stationId: 'port-1' })
    await createImages({ stationId: 'port-1', listImageFile: [] })
    await deleteImage('image-1')
    await queryVisits({ page: 1, pageSize: 10, businessId: 'port-1' })
    await createVisit({ businessId: 'port-1' })

    expect(requestMocks.get.mock.calls.map((call) => call[0])).toEqual([
      '/api/resource/water-port/port-1/getFile-byPortId',
      '/api/resource/railway-image/port-1/getbyid'
    ])
    expect(requestMocks.post).toHaveBeenCalledWith(
      '/api/resource/resource-visit/query-by-page',
      { page: 1, pageSize: 10, businessId: 'port-1', limit: 10, KeyWords: undefined },
      true
    )
    expect(requestMocks.delete.mock.calls.map((call) => call[0])).toEqual([
      '/api/resource/water-port/file-1/delete-file',
      '/api/resource/railway-image/image-1/delete'
    ])
  })

  it('downloads blobs internally and applies the parsed filename', async () => {
    const stowageBlob = new Blob(['stowage'])
    const workFeeBlob = new Blob(['work-fee'])
    requestMocks.requestResponse
      .mockResolvedValueOnce([null, { data: stowageBlob, headers: {} }])
      .mockResolvedValueOnce([null, { data: workFeeBlob, headers: {} }])

    await downloadStowageTemplate()
    await downloadWorkFeeTemplate()

    expect(requestMocks.requestResponse.mock.calls.map((call) => call[0])).toEqual([
      {
        url: '/api/resource/water-port/stowage/get-temp',
        method: 'GET',
        responseType: 'blob'
      },
      {
        url: '/api/resource/water-port/workfee/get-temp',
        method: 'GET',
        responseType: 'blob'
      }
    ])
    expect(requestMocks.getDownloadFilename).toHaveBeenNthCalledWith(
      1,
      expect.anything(),
      '堆存费导入模板.xlsx'
    )
    expect(requestMocks.saveBlob).toHaveBeenNthCalledWith(1, stowageBlob, '港口模板.xlsx')
    expect(requestMocks.saveBlob).toHaveBeenNthCalledWith(2, workFeeBlob, '港口模板.xlsx')
  })

  it('preserves tuple errors and safe fallback values', async () => {
    const requestError = { message: 'network failed' }
    requestMocks.get.mockResolvedValueOnce([requestError, null])
    requestMocks.post.mockResolvedValueOnce([requestError, null])

    await expect(listContacts('port-1')).resolves.toEqual([requestError, []])
    await expect(createContact({ contactName: '张三' })).resolves.toEqual([requestError, false])
  })
})
