import BaseService from "@/api/baseService";

import { PagedResultDto } from "@/utils/base-entity";

const api = new BaseService("railway");

const portApi = new BaseService("water-port");

// interface NearLocationPointParam {
//   latitude: number;
//   longitude: number;
//   provinceName: string;
// }

/**
 * 获取所有站点
 */
export async function GetAllStation(): Promise<Dashboard.StationItem[]> {
  return api
    .OpionDefine(`station-all`, "", "GET", false)
    .then((res) => {
      const data = res?.data || [];
      return data;
    })
    .catch(() => {
      return [];
    });
}

/**
 * 获取所有港口
 */
export async function GetAllPort(): Promise<Dashboard.PortItem[]> {
  return portApi
    .OpionDefine(`port-all`, "", "GET", false)
    .then((res) => {
      const data = res?.data || [];
      return data;
    })
    .catch(() => {
      return [];
    });
}

/**
 * 查询附近站点
 * @param point
 * @returns
 */
export function SearchNearStation(point: Dashboard.NearLocationPointParam) {
  return api.OpionDefine(`search-near`, point, "POST", false, true, false);
}

/**
 * 查询附近港口
 * @param point
 * @returns
 */
export function SearchNearPort(point: Dashboard.NearLocationPointParam) {
  return portApi.OpionDefine(`search-near`, point, "POST", false, true, false);
}

/**
 * 分页查询车站基础信息2
 * @param param
 * @returns
 */
export function QueryDtoStationAsync(param: Dashboard.RailwayStationParam) {
  return api
    .OpionDefine(`query-dto-by-page`, param, "POST", true)
    .then(
      (res) => (res?.data || {}) as PagedResultDto<Dashboard.RailwayStationDto>
    );
}

/**
 * 根据城市名称获取站点信息
 * @param cityName
 * @returns
 */
export function GetStationByCityName(cityName: string) {
  return api
    .OpionDefine(`${cityName}/station-by-city`, "", "GET", false, true)
    .then((res) => res?.data || []);
}
/**
 * 查询城市港口信息
 * @param id
 * @returns
 */
export function GetPortByCityName(cityName: string) {
  return portApi
    .OpionDefine(`${cityName}/getportbycityname`, "", "GET", false, true)
    .then((res) => res?.data || []);
}
