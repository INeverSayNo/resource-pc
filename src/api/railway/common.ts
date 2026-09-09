import { BaseApi } from '@/request'
import { PATH_URL, USE_CRY_PTO } from '@/request/config'

export interface RailwayLocation {
  lat?: number
  lng?: number
  [key: string]: unknown
}

interface StationTableResponse {
  data?: { items?: unknown[] }
  items?: unknown[]
}

const api = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })

export const getRailwayStationTable = () =>
  api.get<StationTableResponse>(
    '/api/resource/system-data-show-set/get-show-data-by-mark',
    {
      ShowMark: 'RailWayStationTableData',
      KeyWords: '',
      dataSourceParamsJson: ''
    },
    true
  )

export const getRegionDataByAddress = (address: string) =>
  api.get<RailwayLocation>(
    '/api/resource/tool/get-regiondata-by-address',
    { address, isAmap: true },
    true
  )
