import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  config: undefined as unknown,
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  requestResponse: vi.fn(),
  saveBlob: vi.fn(),
  getDownloadFilename: vi.fn(() => '模板.xlsx')
}))

vi.mock('@/request', () => ({
  BaseApi: class {
    constructor(config: unknown) {
      mocks.config = config
    }
    get = mocks.get
    post = mocks.post
    put = mocks.put
    delete = mocks.delete
    requestResponse = mocks.requestResponse
  },
  getDownloadFilename: mocks.getDownloadFilename,
  saveBlob: mocks.saveBlob,
  toResponseError: (error: Error) => ({ message: error.message })
}))

vi.mock('@/request/config', () => ({
  PATH_URL: 'https://resource.example.com',
  USE_CRY_PTO: true
}))

import {
  createContact,
  createOrganization,
  deleteContact,
  deleteOrganization,
  downloadTemplate,
  getCenterDetail,
  getCenterLabels,
  getOrganizationDetail,
  getOrganizationRelation,
  importContacts,
  importOrganizations,
  legacyPageParams,
  queryCenters,
  queryContacts,
  queryOrganizations,
  queryStations,
  queryVisitRecords,
  saveCenterLabels,
  saveOrganizationStations,
  updateContact,
  updateOrganization
} from './api'

const ok = (data: unknown = true) => Promise.resolve([null, { isSuccessful: true, data }])

describe('logistics center API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.get.mockImplementation(() => ok({}))
    mocks.post.mockImplementation(() => ok(true))
    mocks.put.mockImplementation(() => ok(true))
    mocks.delete.mockImplementation(() => ok(true))
  })

  it('uses the resource host and exact first-level list contract', async () => {
    const controller = new AbortController()
    const params = {
      page: 2,
      limit: 10,
      searchName: '南京',
      railwayCompany: '上海局',
      province: '江苏省',
      areaCompany: '华东区',
      addressDetail: '栖霞区'
    }
    mocks.post.mockImplementationOnce(() => ok({ totalCount: 1, items: [{ id: '1' }] }))
    const [error, result] = await queryCenters(params, { signal: controller.signal })
    expect(mocks.config).toEqual({ baseURL: 'https://resource.example.com', crypto: true })
    expect(error).toBeNull()
    expect(result.totalCount).toBe(1)
    expect(mocks.post).toHaveBeenCalledWith(
      '/api/resource/LogisticCenterOrganization/QueryFirstLevelByPage',
      legacyPageParams(params),
      true,
      { signal: controller.signal }
    )
    expect(legacyPageParams(params)).toMatchObject({ start: 0, isExport: true, isAllPage: true })
  })

  it('keeps detail, relation and label GET endpoint casing', async () => {
    await getCenterDetail('中心/1')
    await getOrganizationDetail('机构/1')
    await getOrganizationRelation('中心/1')
    await getCenterLabels('中心/1')
    expect(mocks.get.mock.calls).toEqual([
      [
        '/api/resource/LogisticCenterOrganization/GetFirstLevelDetail',
        { id: '中心/1' },
        true,
        undefined
      ],
      [
        '/api/resource/LogisticCenterOrganization/GetOtherLevelDetail',
        { id: '机构/1' },
        true,
        undefined
      ],
      [
        '/api/resource/LogisticCenterOrganization/GetLogisticsCenterStructureInfo',
        { id: '中心/1' },
        true,
        undefined
      ],
      [
        '/api/resource/CenterOrganizationLabelInfo/GetAllList',
        { centerOrganizationId: '中心/1' },
        true
      ]
    ])
  })

  it('keeps organization, contact, station and visit pagination endpoints', async () => {
    await queryOrganizations({ page: 1, limit: 20, parentId: 'p1', keyName: '市场' })
    await queryContacts({ page: 2, limit: 20, organizationId: 'o1', keyName: '张' })
    await queryStations({ page: 1, limit: 2000, isHyStation: true, railwayStationName: '南京' })
    await queryVisitRecords({ page: 1, limit: 20, businessId: 'o1' })
    expect(mocks.post.mock.calls.map((call) => call[0])).toEqual([
      '/api/resource/LogisticCenterOrganization/QueryLogisticsCenterAllChildInfoPageList',
      '/api/resource/CenterOrganizationContactPersonInfo/QuerypageList',
      '/api/resource/railway/query-dto-by-page',
      '/api/resource/LogisticCenterOrganization/QueryAllOrgVisitRecordByPage'
    ])
    expect(mocks.post.mock.calls[0][1]).toMatchObject({ parentId: 'p1', limit: 20, isExport: true })
    expect(mocks.post.mock.calls[3][1]).toEqual({ page: 1, limit: 20, businessId: 'o1' })
  })

  it('keeps CRUD and association endpoint methods', async () => {
    mocks.post.mockImplementationOnce(() => ok('new-id'))
    await expect(createOrganization({ organizationName: '新机构' } as never)).resolves.toEqual([
      null,
      'new-id'
    ])
    await updateOrganization({ id: 'o1' } as never)
    await deleteOrganization('org/1')
    await createContact({ contactName: '张三' } as never)
    await updateContact({ id: 'c1', contactName: '李四' } as never)
    await deleteContact('contact/1')
    await saveOrganizationStations({ centerOrganizationId: 'o1', stationList: [] })
    await saveCenterLabels('o1', [])
    expect(mocks.put.mock.calls.map((call) => call[0])).toEqual([
      '/api/resource/LogisticCenterOrganization/Update',
      '/api/resource/CenterOrganizationContactPersonInfo/update'
    ])
    expect(mocks.delete.mock.calls.map((call) => call[0])).toEqual([
      '/api/resource/LogisticCenterOrganization/org%2F1/delete',
      '/api/resource/CenterOrganizationContactPersonInfo/contact%2F1/delete'
    ])
    expect(mocks.post).toHaveBeenCalledWith(
      '/api/resource/CenterOrganizationLabelInfo/CreateOrUpdateList',
      { centerOrganizationId: 'o1', labelNameList: [] },
      true
    )
  })

  it('uploads organization and contact workbooks as multipart FormData', async () => {
    const file = new File(['excel'], '机构表.xlsx')
    await importOrganizations('parent/1', file)
    await importContacts('org/1', file)
    expect(mocks.post.mock.calls.map((call) => call[0])).toEqual([
      '/api/resource/LogisticCenterOrganization/ImportBusinesOrg?parentOrgId=parent%2F1',
      '/api/resource/CenterOrganizationContactPersonInfo/ImportContactPerson?organizationId=org%2F1'
    ])
    for (const call of mocks.post.mock.calls) {
      expect(call[1]).toBeInstanceOf(FormData)
      expect(call[3]).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
    }
  })

  it('downloads templates through BaseApi and preserves tuple errors', async () => {
    const blob = new Blob(['template'])
    mocks.requestResponse.mockResolvedValueOnce([null, { data: blob, headers: {} }])
    await expect(downloadTemplate('/UploadFile/template.xlsx', 'fallback.xlsx')).resolves.toEqual([
      null,
      undefined
    ])
    expect(mocks.requestResponse).toHaveBeenCalledWith({
      url: '/UploadFile/template.xlsx',
      method: 'GET',
      responseType: 'blob'
    })
    expect(mocks.saveBlob).toHaveBeenCalledWith(blob, '模板.xlsx')

    const failure = { message: '网络错误' }
    mocks.post.mockResolvedValueOnce([failure, null])
    await expect(
      queryCenters({
        page: 1,
        limit: 10,
        searchName: '',
        railwayCompany: '',
        province: '',
        areaCompany: '',
        addressDetail: ''
      })
    ).resolves.toEqual([failure, { totalCount: 0, items: [] }])
  })
})
