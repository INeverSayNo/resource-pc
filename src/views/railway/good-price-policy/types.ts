import type { BaseSearchParam } from '@/utils/base-entity'
import CustomEnum from '@/utils/CustomEnum'
import type { RailwayGoodPricePolicyEx } from '../station/types'

export interface PricePolicyQueryParam extends BaseSearchParam {
  policyId?: string
  province?: string
  bureau?: string
  station?: string
  policyType?: string
  goodsCode?: string
  goodsName?: string
  goodsShowName?: string
  arrivalProvince?: string
  arrivalBureau?: string
  arrivalStation?: string
  trainType?: string
  ticketType?: string
  containerType?: string
  vaildDate?: string
  sender?: string
  xfkey?: string
  includeExpiration?: boolean
  isPrecise?: boolean
  isOnlyPrecise?: boolean
  isUsed?: boolean
  coefficient?: number | string
  level?: PricePolicyLevel
}

export interface CodeName {
  code: string
  name: string
  children?: CodeName[]
}

export interface PricePolicyResult {
  id?: string
  policyId?: string
  xfkey?: string
  lowerGrade?: string
  chargeTypeCode?: string
  chargeTypeName?: string
  coefficient?: number
}

export interface PolicyAllSimpleResult {
  id?: string
  policyId?: string
  xfkey?: string
  province?: CodeName[]
  excludeProvince?: CodeName[]
  bureau?: CodeName[]
  excludeBureau?: CodeName[]
  station?: CodeName[]
  excludeStation?: CodeName[]
  arrivalProvince?: CodeName[]
  arrivalExcludeProvince?: CodeName[]
  arrivalBureau?: CodeName[]
  arrivalExcludeBureau?: CodeName[]
  arrivalStation?: CodeName[]
  arrivalExcludeStation?: CodeName[]
  goods?: CodeName[]
  excludeGoods?: CodeName[]
  provinceName?: string
  excludeProvinceName?: string
  bureauName?: string
  excludeBureauName?: string
  stationName?: string
  excludeStationName?: string
  arrivalProvinceName?: string
  arrivalExcludeProvinceName?: string
  arrivalBureauName?: string
  arrivalExcludeBureauName?: string
  arrivalStationName?: string
  arrivalExcludeStationName?: string
  goodsName?: string
  excludeGoodsName?: string
  policyType?: string
  coefficient?: number
  trainType?: string
  containerType?: string
  containerTypeMark?: string
  containerTypes?: string
  containerTypesName?: string
  sender?: string
  ticketType?: string
  scope?: string
  startDate?: string
  endDate?: string
  details?: PricePolicyResult[]
  dtLoading?: boolean
  isExpiration?: boolean
  remark?: string
  railwayNatureType?: number
  isUsed?: boolean
}

export type PolicyAllSimpleRecordDto = PolicyAllSimpleResult & {
  policyExs?: RailwayGoodPricePolicyEx[]
}

export interface PolicyAllSimpleUpdateDto {
  id?: string
  containerType?: string
  containerTypes: string[]
  remark?: string
}

export interface GoodsItems {
  goodsCode: string
  goodsName: string
  isType?: boolean
  exclude?: boolean
}

export interface PricePolicyQueryLineParam {
  address?: string
  arrivalAddress?: string
  station?: string
  arrivalStation?: string
  goodsCode?: string
  goodsName?: string
  serviceType?: number
  freightVolume?: number
  freightUnit?: string
}

export interface RailwayInquiryPriceDto {
  id?: string
  transactType?: number
  transactTypeName?: string
  stsCharge?: number
  loadCost?: number
  glhzCost?: number
  printCost?: number
  useBoxCharge?: number
  receiveCharge?: number
  price?: number
  unit?: string
  policyId?: string
  policyPrice?: number
  priceSource?: string
  contributor?: string
  contributorName?: string
  contributorPhone?: string
}

export interface PolicyShowDto {
  line?: string
  price?: number
  policyItem?: {
    xfkey?: string
    policyId?: string
    policyType?: string
    coefficient?: number
  }
  priceItem?: RailwayInquiryPriceDto
  children?: PolicyShowDto[]
}

export interface PolicyShowItem {
  line?: string
  parentLine?: string
  coefficientOptions?: Array<{ label: string; value: string }>
  items?: PolicyShowDto[]
  children?: PolicyShowItem[]
  currentPrice?: unknown[]
}

export type PricePolicyLevel = 0 | 1 | 2

export interface RailwayGppStatisticsParam {
  province?: string
  bureau?: string
  station?: string
  policyType?: string
  arrivalProvince?: string
  arrivalBureau?: string
  arrivalStation?: string
  trainType?: string
  containerType?: string
  vaildDate?: string
  sender?: string
  xfkey?: string
  goodsCode?: string
  goodsName?: string
  ticketType?: string
  coefficient?: number
  level: PricePolicyLevel
  includeExpiration: boolean
}

export interface PolicySimpleResult {
  policyId: string
  xfkey: string
  policyType: string
  coefficient: number
  trainType?: string
  containerType?: string
  ticketType?: string
  scope?: string
  startDate?: string
  endDate?: string
  description?: string
}

export interface RailwayGppStatisticsCity {
  cityName: string
  arrivalCityName: string
  num: number
}

export interface RailwayGppStatistics {
  policyList: PolicySimpleResult[]
  cities: RailwayGppStatisticsCity[]
}

export interface PolicyMapItem {
  stationId: string
  stationName: string
  latLng: string
  isArrival: boolean
}

export interface PolicySimpleResultWithMap extends PolicySimpleResult {
  id?: string
  xfyxkey?: string
  sender?: string
  goods?: CodeName[]
  agreementFile?: unknown
  agrCoefficient?: number
  mapItems: PolicyMapItem[]
}

export const pricePolicyLevels: ReadonlyArray<{ id: PricePolicyLevel; label: string }> = [
  { id: 0, label: '路局' },
  { id: 1, label: '省份' },
  { id: 2, label: '城市' }
]

export const TransactTypeEnum = CustomEnum({
  Zc: { id: 1, label: '整车', shape: 'square' },
  Jzx20: { id: 2, label: '20尺集装箱', shape: 'square' },
  Jzx40: { id: 3, label: '40尺集装箱', shape: 'square' },
  Jzx35: { id: 4, label: '35吨敞顶箱', shape: 'square' },
  Pl: { id: 5, label: '批量快运', shape: 'square' }
})

export const RailwayNatureEnum = CustomEnum({
  National: { id: 0, label: '国铁' },
  Local: { id: 1, label: '地方铁路' }
})
