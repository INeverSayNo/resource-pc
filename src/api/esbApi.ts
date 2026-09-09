import { BaseApi, requireApiData } from '@/request'
import { ABPBASE_URL, PATH_URL, USE_CRY_PTO } from '@/request/config'

const resourceApi = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })
const baseDataApi = new BaseApi({ baseURL: ABPBASE_URL, crypto: USE_CRY_PTO })

export interface AreaRegion {
  id: string
  fullPath: string
  regionCode: string
  regionName: string
  nodes?: AreaRegion[]
}

const addLevel = (data: any[], level = 1): any[] => {
  data.forEach((item) => {
    item.Level = level
    if (item.nodes?.length) addLevel(item.nodes, level + 1)
    else delete item.nodes
  })
  return data
}

export async function getArea(params: Record<string, unknown>) {
  const response = await requireApiData(
    resourceApi.get<any>(
      '/api/resource/system-data-show-set/get-show-data-by-mark',
      { ShowMark: 'AreaRegionData', ...params },
      true,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8', cros: true } }
    )
  )
  const items = response?.data?.items || []
  items.sort((a: any, b: any) => Number(a.RegionCode) - Number(b.RegionCode))
  items.forEach((item: any) =>
    item.children?.sort((a: any, b: any) => Number(a.RegionCode) - Number(b.RegionCode))
  )
  return items
}

export async function getAreaNew(): Promise<AreaRegion[]> {
  const response = await requireApiData(
    baseDataApi.get<{ items?: AreaRegion[] }>('/api/BaseData/Region/tree', undefined, true)
  )
  return response?.items?.length ? addLevel(response.items) : []
}

export async function loadCity(): Promise<AreaRegion[]> {
  const result: AreaRegion[] = []
  const municipalities = ['北京市', '重庆市', '天津市', '上海市']
  ;(await getAreaNew()).forEach(({ id, fullPath, regionName, regionCode, nodes }) => {
    if (municipalities.includes(regionName)) result.push({ id, fullPath, regionCode, regionName })
    else nodes?.forEach((node) => result.push({ ...node, nodes: undefined }))
  })
  return result
}

export const getBMapAK = () =>
  requireApiData(
    baseDataApi.get<string>('/api/BaseData/BaiduMapJsApi/get-dynamic-ak', undefined, true)
  )

export async function getDynamicAK(): Promise<string> {
  const cached = sessionStorage.getItem('bmap_ak')
  if (cached) return cached
  const key = await getBMapAK()
  sessionStorage.setItem('bmap_ak', key)
  return key
}
