import { describe, expect, it } from 'vitest'
import {
  buildPrivateLineQuery,
  createPrivateLineQuery,
  getPrivateLineAddress,
  isPrivateLineImage,
  normalizePrivateLineTags,
  splitPrivateLineValues
} from './logic'

describe('private-line list and detail logic', () => {
  it('initializes the list query from privateName', () => {
    expect(createPrivateLineQuery('测试专用线')).toEqual({
      page: 1,
      pageSize: 20,
      name: '测试专用线',
      stationName: ''
    })
    expect(createPrivateLineQuery(['invalid'])).toMatchObject({ name: '' })
  })

  it('maps start and arrive filters without sending hidden fields for all stations', () => {
    const query = { page: 3, pageSize: 20, name: ' 专线 ', stationName: ' 站点 ' }
    expect(
      buildPrivateLineQuery(query, {
        stationType: 'start',
        category: ' 煤炭 ',
        useContainer: 'y',
        useDanger: 'n'
      })
    ).toEqual({
      page: 3,
      pageSize: 20,
      name: '专线',
      stationName: '站点',
      isSend: true,
      category: '煤炭',
      isContainer: true,
      isDanger: false
    })
    expect(
      buildPrivateLineQuery(query, {
        stationType: 'arrive',
        category: '',
        useContainer: 'n',
        useDanger: 'y'
      }).isSend
    ).toBe(false)
    expect(
      buildPrivateLineQuery(query, {
        stationType: 'all',
        category: '煤炭',
        useContainer: 'y',
        useDanger: 'y'
      })
    ).not.toHaveProperty('isContainer')
  })

  it('normalizes tags, categories and addresses', () => {
    expect(normalizePrivateLineTags(['集装箱、危险品', '优势'])).toEqual([
      '集装箱',
      '危险品',
      '优势'
    ])
    expect(splitPrivateLineValues('煤炭,钢材、矿石')).toEqual(['煤炭', '钢材', '矿石'])
    expect(getPrivateLineAddress('{"address":"上海市","lat":"1","lng":"2"}')).toBe('上海市')
    expect(getPrivateLineAddress('')).toBe('地址收集中')
    expect(getPrivateLineAddress('原始地址')).toBe('原始地址')
  })

  it('classifies images case-insensitively and supports path fallback', () => {
    expect(isPrivateLineImage({ fileType: '.JPG' })).toBe(true)
    expect(isPrivateLineImage({ filePath: '/files/photo.webp?token=1' })).toBe(true)
    expect(isPrivateLineImage({ filePath: '/files/report.pdf' })).toBe(false)
  })
})
