import type { LocationQuery } from 'vue-router'
import type {
  CodeName,
  PolicyAllSimpleRecordDto,
  PolicyMapItem,
  PricePolicyLevel,
  PricePolicyQueryParam,
  PricePolicyResult,
  RailwayGppStatisticsParam
} from './types'

export const DEFAULT_POLICY_PAGE_SIZE = 50

const firstQueryValue = (value: LocationQuery[string]): string => {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

const parseBoolean = (value: string): boolean | undefined => {
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return undefined
}

export const createPolicyQuery = (routeQuery: LocationQuery = {}): PricePolicyQueryParam => {
  const query: PricePolicyQueryParam = {
    page: 1,
    pageSize: DEFAULT_POLICY_PAGE_SIZE,
    level: 0,
    isOnlyPrecise: true,
    includeExpiration: false,
    isUsed: true
  }
  const stringFields: Array<keyof PricePolicyQueryParam> = [
    'province',
    'bureau',
    'station',
    'policyType',
    'goodsCode',
    'goodsName',
    'arrivalProvince',
    'arrivalBureau',
    'arrivalStation',
    'trainType',
    'ticketType',
    'containerType',
    'vaildDate',
    'sender',
    'xfkey'
  ]
  for (const field of stringFields) {
    const value = firstQueryValue(routeQuery[field as string])
    if (value) Reflect.set(query, field, value)
  }
  for (const field of ['includeExpiration', 'isPrecise'] as const) {
    const value = parseBoolean(firstQueryValue(routeQuery[field]))
    if (value !== undefined) query[field] = value
  }
  const level = Number(firstQueryValue(routeQuery.level))
  if ([0, 1, 2].includes(level)) query.level = level as PricePolicyLevel
  if (query.goodsCode && query.goodsName)
    query.goodsShowName = `${query.goodsName}(${query.goodsCode})`
  return query
}

export const resetPolicyQuery = (): PricePolicyQueryParam => createPolicyQuery()

const trimQuery = (query: PricePolicyQueryParam): PricePolicyQueryParam => {
  const result = { ...query }
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string') Reflect.set(result, key, value.trim())
  }
  return result
}

export const buildPolicyListQuery = (query: PricePolicyQueryParam): PricePolicyQueryParam => {
  const result = trimQuery(query)
  delete result.goodsShowName
  delete result.coefficient
  delete result.level
  result.isUsed = true
  return result
}

export const buildPolicyChannelQuery = (
  query: PricePolicyQueryParam
): RailwayGppStatisticsParam => {
  const result = trimQuery(query)
  const coefficient = Number(result.coefficient)
  return {
    province: result.province,
    bureau: result.bureau,
    station: result.station,
    policyType: result.policyType,
    arrivalProvince: result.arrivalProvince,
    arrivalBureau: result.arrivalBureau,
    arrivalStation: result.arrivalStation,
    trainType: result.trainType,
    containerType: result.containerType,
    vaildDate: result.vaildDate,
    sender: result.sender,
    xfkey: result.xfkey,
    goodsCode: result.goodsCode,
    goodsName: result.goodsName,
    ticketType: result.ticketType,
    coefficient: Number.isFinite(coefficient) ? -Math.abs(coefficient) : 0,
    level: result.level ?? 0,
    includeExpiration: Boolean(result.includeExpiration)
  }
}

const renderCodeNames = (items: CodeName[] | undefined, type: 'goods' | 'bureau' | 'plain') => {
  if (!items?.length) return ''
  if (type === 'goods') return items.map((item) => `(${item.code})${item.name}`).join(',')
  if (type === 'bureau') {
    return items
      .map((item) =>
        item.children?.length
          ? `${item.name}(${item.children.map((child) => child.name).join(',')})`
          : item.name
      )
      .join(',')
  }
  return items
    .filter((item) => !item.children?.length)
    .map((item) => item.name)
    .join(',')
}

export const normalizePolicyRecord = (
  source: PolicyAllSimpleRecordDto
): PolicyAllSimpleRecordDto => ({
  ...source,
  provinceName: renderCodeNames(source.province, 'plain'),
  excludeProvinceName: renderCodeNames(source.excludeProvince, 'plain'),
  bureauName: renderCodeNames(source.bureau, 'bureau'),
  excludeBureauName: renderCodeNames(source.excludeBureau, 'bureau'),
  stationName: renderCodeNames(source.station, 'plain'),
  excludeStationName: renderCodeNames(source.excludeStation, 'plain'),
  arrivalProvinceName: renderCodeNames(source.arrivalProvince, 'plain'),
  arrivalExcludeProvinceName: renderCodeNames(source.arrivalExcludeProvince, 'plain'),
  arrivalBureauName: renderCodeNames(source.arrivalBureau, 'bureau'),
  arrivalExcludeBureauName: renderCodeNames(source.arrivalExcludeBureau, 'bureau'),
  arrivalStationName: renderCodeNames(source.arrivalStation, 'plain'),
  arrivalExcludeStationName: renderCodeNames(source.arrivalExcludeStation, 'plain'),
  goodsName: renderCodeNames(source.goods, 'goods'),
  excludeGoodsName: renderCodeNames(source.excludeGoods, 'goods')
})

const detailSortValue = (item: PricePolicyResult): number => {
  const name = item.chargeTypeName || ''
  if (name.includes('运费')) return 1
  if (name.startsWith('发') && name.endsWith('装卸费')) return 2
  if (name.startsWith('到') && name.endsWith('装卸费')) return 3
  return 4
}

export const normalizePolicyDetails = (items: PricePolicyResult[]): PricePolicyResult[] => {
  const result: PricePolicyResult[] = []
  const ordered = [...items].sort(
    (left, right) => (right.coefficient || 0) - (left.coefficient || 0)
  )
  for (const detail of ordered) {
    const chargeTypeName = detail.chargeTypeName?.split(':')[0] || ''
    const isFreight = chargeTypeName.includes('运费')
    const existing = result.find(
      (item) =>
        item.coefficient === detail.coefficient &&
        Boolean(item.chargeTypeName?.includes('运费')) === isFreight
    )
    if (existing)
      existing.chargeTypeName = [existing.chargeTypeName, chargeTypeName].filter(Boolean).join(',')
    else result.push({ ...detail, chargeTypeName })
  }
  return result.sort((left, right) => detailSortValue(left) - detailSortValue(right))
}

export const splitSenders = (sender?: string | null): string[] =>
  (sender || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export interface PolicyMapPoint {
  lng: number
  lat: number
}

export const parsePolicyMapPoint = (latLng?: string): PolicyMapPoint | null => {
  const [latText, lngText] = (latLng || '').split(',').map((item) => item.trim())
  const lat = Number(latText)
  const lng = Number(lngText)
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lng, lat } : null
}

export type PolicyStationRole = 'start' | 'arrival' | 'both'

export const getPolicyStationRole = (
  item: PolicyMapItem,
  items: PolicyMapItem[]
): PolicyStationRole => {
  const hasOpposite = items.some(
    (other) => other.stationId === item.stationId && other.isArrival !== item.isArrival
  )
  return hasOpposite ? 'both' : item.isArrival ? 'arrival' : 'start'
}

export const validatePolicyMapQuery = (query: PricePolicyQueryParam): string => {
  const coefficient = Number(query.coefficient || 0)
  if (!Number.isFinite(coefficient) || coefficient < 0 || coefficient > 100)
    return '下浮比范围为0-100'
  if (query.level === 2 && (!query.goodsCode || coefficient < 60)) {
    return '城市级别需选择品名/品类且下浮比不低于60%'
  }
  return ''
}

export const validatePolicyExcelFile = (file: Pick<File, 'name' | 'size'>): string => {
  if (!/\.xlsx?$/i.test(file.name)) return '仅支持xls、xlsx文件'
  if (file.size >= 10 * 1024 * 1024) return '文件不能超过10MB'
  return ''
}

export const resolvePolicyDownloadUrl = (baseUrl: string, path: string): string => {
  if (/^https?:\/\//i.test(path)) return path
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
