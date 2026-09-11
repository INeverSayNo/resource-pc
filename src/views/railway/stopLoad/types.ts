import type { PagedResultDto } from '@/utils/base-entity'

export interface StopLoadQuery {
  page: number
  pageSize: number
  station?: string
  restrictedConsignees?: string
}

export interface StopLoadNotice {
  id?: string
  station?: string
  roadBureau?: string
  stopStartDate?: string
  stopEndDate?: string
  restrictedDepartureBureau?: string
  restrictedDepartureStation?: string
  restrictedConsignees?: string
  restrictionContent?: string
  stopReason?: string
  publishTime?: string
  commandNum?: string
  updateTime?: string
  [key: string]: unknown
}

export interface StopLoadImportItem {
  station?: string
  roadBureau?: string
  stopStartDate?: string
  stopEndDate?: string
  restrictedDepartureBureau?: string
  restrictedDepartureStation?: string
  restrictedConsignees?: string
  restrictionContent?: string
  stopReason?: string
  publishTime?: string
  [key: string]: unknown
}

export interface StopLoadStation {
  code: string
  name: string
}

export interface StopLoadConfig {
  id: string
  stations: StopLoadStation[]
  userId?: string
  userName?: string
  userPhone?: string
  creatorName?: string
  [key: string]: unknown
}

export interface StopLoadConfigQuery {
  page: number
  pageSize: number
  station?: string
  restrictedConsignees?: string
}

export interface StopLoadConfigPayload {
  id: string
  userId: string
  userName: string
  userPhone: string
  stations: StopLoadStation[]
}

export interface StopLoadStationOption {
  id: string
  label: string
}

export interface StationPageItem {
  id: string
  railwayStationName: string
  [key: string]: unknown
}

export type StopLoadPage = PagedResultDto<StopLoadNotice>
export type StopLoadConfigPage = PagedResultDto<StopLoadConfig>
