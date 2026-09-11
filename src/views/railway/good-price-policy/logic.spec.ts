import { describe, expect, it } from 'vitest'
import {
  buildPolicyChannelQuery,
  buildPolicyListQuery,
  createPolicyQuery,
  getPolicyStationRole,
  normalizePolicyDetails,
  normalizePolicyRecord,
  parsePolicyMapPoint,
  resolvePolicyDownloadUrl,
  validatePolicyExcelFile,
  validatePolicyMapQuery
} from './logic'

describe('good-price-policy query and display logic', () => {
  it('creates typed defaults and parses route query values', () => {
    expect(createPolicyQuery()).toMatchObject({
      page: 1,
      pageSize: 50,
      level: 0,
      isOnlyPrecise: true,
      includeExpiration: false,
      isUsed: true
    })
    expect(
      createPolicyQuery({
        goodsCode: '001',
        goodsName: '煤炭',
        includeExpiration: 'true',
        level: '2'
      })
    ).toMatchObject({
      goodsCode: '001',
      goodsName: '煤炭',
      goodsShowName: '煤炭(001)',
      includeExpiration: true,
      level: 2
    })
  })

  it('builds independent list and channel params', () => {
    const query = createPolicyQuery({ goodsCode: '001', goodsName: '煤炭' })
    query.coefficient = '60'
    query.level = 2
    expect(buildPolicyListQuery(query)).not.toHaveProperty('coefficient')
    expect(buildPolicyListQuery(query)).not.toHaveProperty('level')
    expect(buildPolicyListQuery(query).isUsed).toBe(true)
    expect(buildPolicyChannelQuery(query)).toMatchObject({
      goodsCode: '001',
      goodsName: '煤炭',
      coefficient: -60,
      level: 2,
      includeExpiration: false
    })
  })

  it('formats policy ranges without mutating the source', () => {
    const source = {
      station: [{ code: '1', name: '甲站' }],
      bureau: [{ code: 'B', name: '甲局', children: [{ code: '2', name: '乙站' }] }],
      goods: [{ code: '001', name: '煤炭' }]
    }
    const result = normalizePolicyRecord(source)
    expect(result).toMatchObject({
      stationName: '甲站',
      bureauName: '甲局(乙站)',
      goodsName: '(001)煤炭'
    })
    expect(source).not.toHaveProperty('stationName')
  })

  it('groups and sorts charge details like the legacy page', () => {
    const result = normalizePolicyDetails([
      { coefficient: -10, chargeTypeName: '其他费:说明' },
      { coefficient: -20, chargeTypeName: '到端装卸费:说明' },
      { coefficient: -30, chargeTypeName: '运费:甲' },
      { coefficient: -30, chargeTypeName: '运费:乙' },
      { coefficient: -20, chargeTypeName: '发端装卸费:说明' }
    ])
    expect(result.map((item) => item.chargeTypeName)).toEqual([
      '运费,运费',
      '到端装卸费,发端装卸费',
      '其他费'
    ])
  })

  it('parses station coordinates and classifies both-way stations', () => {
    const items = [
      { stationId: '1', stationName: '甲', latLng: '31.2,121.5', isArrival: false },
      { stationId: '1', stationName: '甲', latLng: '31.2,121.5', isArrival: true }
    ]
    expect(parsePolicyMapPoint(items[0].latLng)).toEqual({ lng: 121.5, lat: 31.2 })
    expect(parsePolicyMapPoint('invalid')).toBeNull()
    expect(getPolicyStationRole(items[0], items)).toBe('both')
  })

  it('validates map depth, Excel files and download paths', () => {
    expect(validatePolicyMapQuery({ level: 2, coefficient: 59 })).toContain('城市级别')
    expect(validatePolicyMapQuery({ level: 2, coefficient: 60, goodsCode: '001' })).toBe('')
    expect(validatePolicyExcelFile({ name: 'a.csv', size: 1 })).toContain('xls')
    expect(validatePolicyExcelFile({ name: 'a.xlsx', size: 10 * 1024 * 1024 })).toContain('10MB')
    expect(resolvePolicyDownloadUrl('https://api/', '/result.xlsx')).toBe('https://api/result.xlsx')
  })
})
