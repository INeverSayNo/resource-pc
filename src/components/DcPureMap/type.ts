export interface LikePoint {
  lng: number | string
  lat: number | string
  [key: string]: any
}

export interface IEmits {
  (eventName: 'zoomEnd'): void
  (eventName: 'init'): void
  (eventName: 'moveEnd'): void
  (eventName: 'click', payload: L.LatLng): void
  (eventName: 'programmaticMoveEnd'): void
  (eventName: 'railwayLineClick', payload: RailwayLineItem): void
  (eventName: 'railwayBureauClick', payload: RailwayBureauItem): void
  (eventName: 'railwayPointClick', payload: RailwayPointItem): void
}

export interface IProps {
  height?: string;
  width?: string;
  className?: string;
  showRailwayLine?: boolean
  showRailwayStation?: boolean
  showTerrain?: boolean
  showRailwayBureau?: boolean
  minZoom?: number
  maxZoom?: number
  mapId?: string
  disableZoom?: boolean
  copyright?: string
  useLargeCopyright?: boolean
  showAttribution?: boolean
}

export interface RailwayLineItem {
  source: string
  target: string
  distance: number
  line_name: string
  target_name: string
  source_name: string
  source_gid: number
  target_gid: number
  gid: number
  direction: number
  line_type: number
  confirmed: boolean
  is_privateline: boolean
  last_modifierid: string
  last_modificationtime: string
  last_modifiername: string
  IsDeleted: boolean
  level: number
  railway_bureau_code: string
}

export interface RailwayBureauItem {
  code: string
  name: string
  full_name: string
  short_name: string
  area_type: number
  gid: number
  num: string
  id: string
}

export interface RailwayPointItem {
  name: string
  name_en: string
  name_zh: string
  country: string
  province: string
  city: string
  district: string
  address: string
  node_type: number
  is_freight_node: boolean
  gid: number
  data_id: string
  creator_id: object
  creator_name: object
  last_modifier_id: string
  last_modifier_name: string
  is_deleted: boolean
  deleter_id: object
  deleter_name: object
  creation_time: string
  last_modification_time: string
  deletion_time: object
  code: string
  num: string
  is_scrap: boolean
  railway_bureau_code: string
  is_local: boolean
  id: string
  lat: number
  lng: number
}

export interface SuggestItem {
  name: string
  address: string
  province: string
  city: string
  district: string
  adcode: string
  additionals: {
    platform: string
    [key: string]: string | number
  }
  latitude: number
  longitude: number
}
export interface ReGeocodeResult {
  address: string
  formattedAddress: string
  country: string
  province: string
  city: string
  district: string
  street: string
  adCode: string
  town: string
  number: string
  pois: {
    tag: string
    name: string
    type: string
    address: string
    distance: number
  }[]
  roads: {
    name: string
  }[]
  additionals: { [key: string]: any }
}

export interface MapNavigationInput {
  origin: {
    latitude: number
    longitude: number
  }
  dest: {
    latitude: number
    longitude: number
  }
  wayPoints?: {
    latitude: number
    longitude: number
  }[]
  strategy: string
}
export interface MapNavigationResponse {
  origin: {
    latitude: number
    longitude: number
    name: string
  }
  dest: {
    latitude: number
    longitude: number
    name: string
  }
  distance: number
  duration: number
  platfrom: string
  coordinates: number[][]
}

export interface MapRegion {
  name: string
  level: string
  region: {
    province: string
    city: string
    district: string
    provinceName: string
    cityName: string
    districtName: string
  }
  center: { lat: number; lng: number; locationSys: number }
}
