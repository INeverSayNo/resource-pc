import {
  BaseApi,
  PATH_URL,
  SYSTEM_BASE_DATA_URL,
  requireApiData
} from "@/request";
import BaseService from "@/api/baseService";
import { USE_CRY_PTO } from '@/request/config'
import { GetAddress } from "@/utils";
import { PagedResultDto } from "@/utils/base-entity";
import {
  DetailsRailWayStationResult,
  MapRailWayStationResult,
  NearLocationPointParam,
  RailwayGoodPricePolicyEx,
  RailWayGoodsYard,
  RailWayPrivatelLine,
  RailWayPrivatelLineCrudDto,
  RailWayStation,
  RailWayStationContacts,
  RailWayStationContactsCrudDto,
  RailwayStationCrudDto,
  RailwayStationDto,
  RailwayStationHighwayDispatch,
  RailwayStationParam,
  RailwayStationSupplierParam,
  RailWayStopNoticeCrudDto,
  RailWaySupplerExCrudDto,
  RailWaySupplerExDto,
  MapPortStationResult,
  RailwayPolicyItemNew
} from "./types";
import { ElLoading, ElMessageBox } from "element-plus";

const api = new BaseService("railway");

const supplierExApi = new BaseService("railway-supplier");

const imagesApi = new BaseService("railway-image");

const portApi = new BaseService("water-port");
const resourceRequest = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })
const supplierRequest = new BaseApi({ baseURL: SYSTEM_BASE_DATA_URL, crypto: USE_CRY_PTO })

/**
 * 分页查询车站基础信息
 * @param param
 * @returns
 */
export function QueryStationAsync(param: RailwayStationParam) {
  return api
    .Query(param)
    .then((res) => (res?.data || {}) as PagedResultDto<RailWayStation>);
}
/**
 * 分页查询车站基础信息2
 * @param param
 * @returns
 */
export function QueryDtoStationAsync(param: RailwayStationParam) {
  return api
    .OpionDefine(`query-dto-by-page`, param, "POST", true)
    .then((res) => (res?.data || {}) as PagedResultDto<RailwayStationDto>);
}
/**
 * 根据城市名称获取站点信息
 * @param cityName
 * @returns
 */
export function GetStationByCityName(cityName: string) {
  return api
    .OpionDefine(`${cityName}/station-by-city`, "", "GET", false, true)
    .then((res) => (res?.data || []) as MapRailWayStationResult[]);
}
export async function uploadExcel(file: string) {
  const response = await requireApiData(
    resourceRequest.post<any>(
      '/api/resource/railway/import-rawilway-stationlevel',
      undefined,
      true,
      { params: { path: file }, headers: { 'Content-Type': 'multipart/form-data' } }
    )
  )
  if (!response?.isSuccessful) throw new Error(response?.message || '铁路车站导入失败')
  return response.data
}
/**
 * 查询附件站点
 * @param point
 * @returns
 */
export function SearchNearStation(point: NearLocationPointParam) {
  return api
    .OpionDefine(`search-near`, point, "POST", false, true)
    .then((res) => (res?.data || []) as RailwayStationDto[]);
}
/**
 * 根据车站名称查询地图数据
 * @param stationName 车站名称
 * @returns
 */
export function GetStationByName(stationName: string, defaultErr = true) {
  return api
    .OpionDefine(
      `station?stationName=${stationName}`,
      "",
      "GET",
      false,
      !defaultErr
    )
    .then((res) => {
      const data = (res?.data || []) as MapRailWayStationResult[];
      if (data.length) {
        data.forEach((x) => {
          if (x.station?.address) {
            x.station.AddressFormat = GetAddress(x.station.address);
          }
        });
      }
      return data;
    })
    .catch(() => {
      return [];
    });
}

/**
 * 根据Id获取车站详情信息
 * @param stationId 车站Id
 * @param needDt 是否需要联系人、停限公告、专线
 * @returns
 */
export function GetStationById(stationId: string, needDt = false) {
  return api
    .OpionDefine(`${stationId}/station?needDt=${needDt}`, "", "GET", false)
    .then((res) => (res?.data || {}) as DetailsRailWayStationResult);
}

/**
 * 同步更新站点信息
 * @param stationName
 * @returns
 */
export function AsyncUpdate(
  stationName: string = "",
  isCheckAll: boolean = false,
  isUpdateAll: boolean = false
) {
  const msg = stationName
    ? `是否从95306同步更新站点'${stationName}'信息？`
    : "是否从95306同步全部站点信息，此操作耗时可能会很长请耐心等待!";
  return new Promise((resolve, reject) => {
    ElMessageBox.confirm(msg, "提示信息")
      .then(() => {
        const loading = ElLoading.service({
          text: "数据更新中，请勿关闭当前页面...",
          lock: true,
          background: "rgba(0,0,0,0.5)"
        });
        const param = `IsCheckAll=${isCheckAll}&IsUpdateAll=${isUpdateAll}&stationName=${stationName}`;
        api
          .OpionDefine(`update-all-station?${param}`, "", "POST", false)
          .then((res) => {
            resolve(res.isSuccessful);
          })
          .catch((error) => {
            reject(error);
          })
          .finally(() => {
            if (loading) loading.close();
          });
      })
      .catch(() => {
        resolve(true);
      });
  });
}
/**
 * 异步加载车站供应商
 * @param stationId
 * @returns
 */
export function GetStationSupplier(param: RailwayStationSupplierParam) {
  return requireApiData(
    supplierRequest.post<any>(
      '/api/supplier/supplier-head-v2/station-supplier',
      api.buildParams(param),
      true
    )
  ).then((res) => (res?.data || {}) as PagedResultDto<RailWaySupplerExDto>);
}
/**
 * 删除加载车站供应商
 * @param stationId
 * @returns
 */
export function RemoveStationSupplier(id: string) {
  return requireApiData(
    resourceRequest.delete<any>(`/api/resource/railway-supplier/${id}/delete`, true)
  ).then((res) => (res?.data || false) as boolean);
}

/**
 * 修改站点基础信息
 * @param stationId 车站Id
 * @param dto 可修改部分内容
 * @returns
 */
export function SetStationBaseInfo(
  stationId: string,
  dto: RailwayStationCrudDto
) {
  return api
    .OpionDefine(`${stationId}/update-station`, dto, "POST", false)
    .then((res) => (res?.isSuccessful || false) as boolean);
}

export function CreateStationBaseInfo(stationId: string, dto: any) {
  return api
    .OpionDefine(`create-station`, dto, "POST", false)
    .then((res) => (res?.isSuccessful || false) as boolean);
}
/**
 * 新增站点联系人信息
 * @param dto
 * @returns
 */
export function AddContact(dto: RailWayStationContactsCrudDto) {
  return api
    .OpionDefine(`contact`, dto, "POST", false)
    .then((res) => (res?.isSuccessful || false) as boolean);
}
/**
 * 删除站点联系人信息
 * @param dto
 * @returns
 */
export function StationContactScrapAsync(id: any) {
  return api
    .OpionDefine(`${id}/contact-scrap`, "", "POST", false)
    .then((res) => res || {});
}
/**
 * 修改联系人信息
 * @param id
 * @param dto
 * @returns
 */
export function SetContact(id: string, dto: RailWayStationContactsCrudDto) {
  return api
    .OpionDefine(`${id}/contact`, dto, "PUT", false)
    .then((res) => (res?.isSuccessful || false) as boolean);
}

/**
 * 新增停限信息
 * @param dto
 * @returns
 */
export function AddStopNotice(dto: RailWayStopNoticeCrudDto) {
  return api
    .OpionDefine(`stop-notice`, dto, "POST", false)
    .then((res) => (res?.isSuccessful || false) as boolean);
}

/**
 * 修改专用线联系人信息以及收费说明信息
 * @param id 专用线Id
 * @param dto
 * @returns
 */
export function SetPrivateLine(
  id: string,
  dto: RailWayPrivatelLineCrudDto,
  isUpdate = true
) {
  return api
    .OpionDefine(`${id}/private-line`, dto, isUpdate ? "PUT" : "POST", false)
    .then((res) => (res?.isSuccessful || false) as boolean);
}

/**
 * 创建铁路供应商信息
 * @param param
 * @returns
 */
export function SetSupplierEx(param: RailWaySupplerExCrudDto, id?: string) {
  if (id) {
    return supplierExApi
      .Update(id, param)
      .then((res) => (res?.isSuccessful || false) as boolean);
  } else {
    return supplierExApi
      .Create(param)
      .then((res) => (res?.isSuccessful || false) as boolean);
  }
}

/**
 * 根据站点Id获取优价列表
 * @param param
 * @returns
 */
export function GetPolicyListByStationName(
  payload: Record<string, any>
): Promise<{
  totalCount: number;
  items: RailwayPolicyItemNew[];
}> {
  return api
    .OpionDefine(`search-policy-inner`, payload, "POST", false)
    .then((res) => res?.data || { totalCount: 0, items: [] });
}

/**
 * 新增或修改优价扩展信息
 * @param param
 * @returns
 */
export function AddOrUpdateGoodPricePolicy(
  stationId: string,
  param: RailwayGoodPricePolicyEx[],
  policy: { [key: string]: any },
  contributor: string,
  contributionaTime: string
) {
  const postParam = {
    exList: param,
    policy,
    contributor,
    contributionaTime
  };
  return api
    .OpionDefine(`${stationId}/good-price-policy-ex`, postParam, "POST", false)
    .then((res) => (res?.data || false) as boolean);
}

/**
 * 删除
 * @param id
 * @returns
 */
export function ScrapGoodPricePolicy(id: string) {
  return api
    .OpionDefine(`good-price-policy-ex?id=${id}`, "", "DELETE", false)
    .then((res) => (res?.data || false) as boolean);
}

/**
 * 修改货场信息
 * @param param
 * @returns
 */
export function UpdateGoodsYard(param: RailWayGoodsYard) {
  return api
    .OpionDefine(`goods-yard`, param, "PUT", false)
    .then((res) => (res?.isSuccessful || false) as boolean);
}

/**
 * 异步加载接取送达记录
 * @param stationId
 * @returns
 */
export function GetStationHighwayDispatch(stationName: string) {
  return requireApiData(
    resourceRequest.get<any>(
      '/api/resource/railway-supplier/get-station-dispatch-data',
      { StationName: stationName },
      true
    )
  ).then((res) => (res?.data || {}) as RailwayStationHighwayDispatch);
}

/**
 * 根据车站Id,获取联系人信息
 * @param stationId 车站Id
 * @returns
 */
export function GetStationContact(stationId: string) {
  return api
    .OpionDefine(`${stationId}/station-contact`, "", "GET", false)
    .then((res) => (res?.data || []) as RailWayStationContacts[]);
}
/**
 * 根据车站Id,获取专用线信息
 * @param stationId 车站Id
 * @returns
 */
export function GetStationPrivateLine(stationId: string) {
  return api
    .OpionDefine(`${stationId}/station-private-line`, "", "GET", false)
    .then((res) => (res?.data || []) as RailWayPrivatelLine[]);
}
/**
 * 新增站点图片
 * @param param
 * @returns
 */
export function AddStationImages(param: any) {
  return imagesApi
    .OpionDefine(`create`, param, "POST", false)
    .then((res) => res?.data || {});
}
/**
 * 查询站点图片
 * @param id
 * @returns
 */
export function GetStationImages(id: string) {
  return imagesApi
    .OpionDefine(`${id}/getbyid`, "", "GET", false)
    .then((res) => res?.data || []);
}
/**
 * 删除
 * @param id
 * @returns
 */
export function DeleteStationImages(id: string) {
  return imagesApi
    .OpionDefine(`${id}/delete`, "", "DELETE", false)
    .then((res) => res);
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
/**
 * 查询附近港口
 * @param point
 * @returns
 */
export function SearchNearPort(point: NearLocationPointParam) {
  return portApi
    .OpionDefine(`search-near`, point, "POST", false, true)
    .then((res) => res?.data || []);
}
/**
 * 根据港口名称查询地图数据
 * @param portName 港口名称
 * @returns
 */
export function GetPortByName(portName: string, defaultErr = true) {
  return portApi
    .OpionDefine(`port?portName=${portName}`, "", "GET", false, !defaultErr)
    .then((res) => {
      const data = (res?.data || []) as MapPortStationResult[];
      return data;
    })
    .catch(() => {
      return [];
    });
}
