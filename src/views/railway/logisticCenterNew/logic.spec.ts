import { describe, expect, it, vi } from 'vitest'

vi.mock('@/request', () => ({ GETFILE_URL: 'https://files.example.com/' }))

import {
  buildOrganizationTree,
  completionRate,
  formatContactName,
  normalizeCenterItem,
  normalizeImageList,
  organizationDisplayName,
  parseAddress,
  resolveFileUrl
} from './logic'

describe('logistics center data adapters', () => {
  it('safely parses valid, empty and malformed addresses', () => {
    expect(parseAddress('{"address":"南京","lat":32,"lng":118}')).toEqual({
      address: '南京',
      lat: 32,
      lng: 118,
      regionName: ''
    })
    expect(parseAddress('南京市')).toEqual({ address: '', lat: '', lng: '', regionName: '' })
    expect(parseAddress('{bad json')).toEqual({ address: '', lat: '', lng: '', regionName: '' })
    expect(parseAddress({ address: '苏州', lat: '', lng: '' })).toEqual({
      address: '苏州',
      lat: '',
      lng: '',
      regionName: ''
    })
  })

  it('normalizes relative image URLs without changing absolute URLs and removes duplicates', () => {
    expect(resolveFileUrl('/a.jpg')).toBe('https://files.example.com/a.jpg')
    expect(resolveFileUrl('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg')
    expect(normalizeImageList(['/a.jpg', '/a.jpg', 'https://cdn.example.com/b.jpg'])).toEqual([
      'https://files.example.com/a.jpg',
      'https://cdn.example.com/b.jpg'
    ])
  })

  it('clamps completion rates and normalizes center collection fields', () => {
    expect(completionRate(120)).toBe(5)
    expect(completionRate(-10)).toBe(0)
    expect(completionRate(Number.NaN)).toBe(0)
    expect(
      normalizeCenterItem({
        id: '1',
        organizationName: '南京铁路物流中心',
        organizationAddressDetail: '{bad',
        dataCompletionDegree: 80,
        businessDepartmentCount: 0,
        stationCount: 0,
        businessDepartmentList: undefined as never,
        stationList: undefined as never
      })
    ).toMatchObject({ businessDepartmentList: [], stationList: [], formatAddress: { address: '' } })
  })

  it('formats contact names and organization relationship names', () => {
    expect(formatContactName('欧阳娜娜', '经理', 1)).toBe('欧阳女士 (经理)')
    expect(formatContactName('张三', '', null)).toBe('张**')
    expect(formatContactName('无权限', '经理', 0)).toBe('')
    expect(organizationDisplayName('南京铁路物流中心-营业部-市场组')).toBe('营业部-市场组')
    expect(organizationDisplayName()).toBe('暂未录入')
  })

  it('builds non-mutating organization trees and optional visit nodes', () => {
    const source = [
      {
        id: 'center',
        organizationType: 0,
        organizationName: '中心',
        childList: [
          {
            id: 'department',
            organizationType: 2,
            organizationName: '营业部',
            visitRecordList: [{ visitUserName: '王五', contactUserName: '赵六' }]
          }
        ]
      }
    ]
    const tree = buildOrganizationTree(source, {
      showContacts: true,
      contactIcon: '/contact.svg',
      staffIcon: '/staff.svg'
    })
    expect(tree[0]).toMatchObject({ name: '中心', symbolSize: 66 })
    expect(tree[0].children?.[0]).toMatchObject({ name: '营业部', symbolSize: 56 })
    expect(tree[0].children?.[0].children?.[0]).toMatchObject({ name: '赵六', symbolSize: 30 })
    expect(source[0]).not.toHaveProperty('name')
  })
})
