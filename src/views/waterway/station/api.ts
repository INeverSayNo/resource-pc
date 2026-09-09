import BaseService from "@/api/baseService";
import { PagedResultDto } from "@/utils/base-entity";
import { WaterwayQueryDto, WaterwayStationDto, WaterPortTrafficability } from "./types";
import { GetAddress } from "@/utils";
import { BaseApi, SUPPLIER_URL, requireApiData } from '@/request'
import { USE_CRY_PTO } from '@/request/config'

const imagesApi = new BaseService('railway-image')
const api = new BaseService("water-port");
const supplierRequest = new BaseApi({ baseURL: SUPPLIER_URL, crypto: USE_CRY_PTO })

/**
 * 分页查询港口基础信息
 * @param param
 * @returns
 */
export function QueryDtoPortpageAsync(param: WaterwayQueryDto) {
    return api
        .OpionDefine(`query-by-portpage`, param, "POST", true)
        .then((res) => (res?.data || {}) as PagedResultDto<WaterwayStationDto>);
}
export function QueryDtoLinepageAsync(param: any) {
    return api
        .OpionDefine(`line-queryPage`, param, "POST", true)
        .then((res) => (res?.data || {}) as any);
}
/**
 * Id查询港口基础信息
 * @param param
 * @returns
 */
export function GetPortByIdAsync(id: any) {
    return api
        .OpionDefine(`query-by-portid?id=${id}`, '', "GET", false)
        .then(res => (res?.data || []))
}
/**
 * 修改港口通过能力值信息
 * @param param
 * @returns
 */
export function TrafficabilityUpdateAsync(id: any) {
    return api
        .OpionDefine(`${id}/trafficability-update`, '', "POST", false)
        .then((res) => (res?.data || []));
}
/**
 * Id删除港口通过能力值信息
 * @param param
 * @returns
 */
export function TrafficabilityScrapAsync(id: any) {
    return api
        .OpionDefine(`${id}/trafficability-scrap`, '', "DELETE", false)
        .then((res) => (res?.data || []));
}
/**
 * 分页查询车站基础信息2
 * @param param
 * @returns
 */
export function QueryDtoStationAsync(param: any) {
    return api
      .OpionDefine(`query-dto-by-page`, param, "POST", true)
      .then((res) => (res?.data || {}) as PagedResultDto<any>);
}
export function UpdateFile(id: any, param: any) {
    return api
      .OpionDefine(`${id}/upload-file`, param, "POST", true)
      .then((res) => (res?.data || {}));
}
export function DropFile(id: any) {
    return api
      .OpionDefine(`${id}/delete-file`, '', "DELETE", true)
      .then((res) => (res?.data || {}));
}
export function QueryFile(portid: any) {
    return api
      .OpionDefine(`${portid}/getFile-byPortId`, '', "GET", true)
      .then((res) => (res?.data || []));
}
/**
 * 新增站点图片
 * @param param
 * @returns
 */
export function AddStationImages(param: any) {
    return imagesApi
        .OpionDefine(`create`, param, 'POST', false)
        .then(res => (res?.data || {}))
}
/**
 * 批量新增站点图片
 * @param param
 * @returns
 */
export function AddListStationImages(param: any) {
    return imagesApi
        .OpionDefine(`list`, param, 'POST', false)
        .then(res => (res || {}))
}
  /**
   * 查询站点图片
   * @param id
   * @returns
   */
export function GetStationImages(id: string) {
    return imagesApi
        .OpionDefine(`${id}/getbyid`, '', 'GET', false)
        .then(res => (res?.data || []))
}
  /**
   * 删除
   * @param id
   * @returns
   */
export function DeleteStationImages(id: string) {
    return imagesApi
        .OpionDefine(`${id}/delete`, '', 'DELETE', false)
        .then(res => (res))
}
/**
 * 保存港口信息
 * @param param
 * @returns
 */
export function PortCreateAsync(param: any) {
    return api
        .OpionDefine(`port-create`, param, "POST", false)
        .then((res) => (res || {}));
}
export function LineCreateAsync(param: any) {
    return api
        .OpionDefine(`line-insert`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 修改港口信息
 * @param param
 * @returns
 */
export function UpdatePortAsync(id: any, param: any) {
    return api
        .OpionDefine(`${id}/port-update`, param, "POST", false)
        .then((res) => (res || {}));
}
export function UpdateLineAsync(id: any, param: any) {
    return api
        .OpionDefine(`${id}/line-update`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 保存港口通过能力信息
 * @param param
 * @returns
 */
export function TrafficabilityCreateAsync(param: any) {
    return api
        .OpionDefine(`trafficability-create`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 保存港口联系人信息
 * @param param
 * @returns
 */
export function PortContactCreateAsync(param: any) {
    return api
        .OpionDefine(`contact-create`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 修改港口联系人信息
 * @param param
 * @returns
 */
export function PortContactUpdateAsync(id: any, param: any) {
    return api
        .OpionDefine(`${id}/contact-update`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 删除港口联系人信息
 * @param id
 * @returns
 */
export function PortContactScrapAsync(id: any) {
    return api
        .OpionDefine(`${id}/contact-scrap`, "", "DELETE", false)
        .then((res) => (res || {}));
}
export function PortContactLoad(portId: any) {
    return api
        .OpionDefine(`${portId}/contact-byPortId`, "", "GET", false)
        .then((res) => (res || {}));
}
/**
 * 保存港口码头信息
 * @param param
 * @returns
 */
export function WharfCreateAsync(param: any) {
    return api
        .OpionDefine(`wharf-create`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 修改港口码头信息
 * @param param
 * @returns
 */
export function WharfUpdateAsync(id: any, param: any) {
    return api
        .OpionDefine(`wharf-update?id=${id}`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 批量保存港口码头信息
 * @param param
 * @returns
 */
export function WharfCreateListAsync(param: any) {
    return api
        .OpionDefine(`wharf-createList`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 保存港口作业区信息
 * @param param
 * @returns
 */
export function WorkZoneCreateAsync(param: any) {
    return api
        .OpionDefine(`workzone-create`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 修改港口作业区信息
 * @param param
 * @returns
 */
export function WorkZoneUpdateAsync(id: any, param: any) {
    return api
        .OpionDefine(`${id}/workzone-update`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 批量保存港口作业区信息
 * @param param
 * @returns
 */
export function WorkZoneCreateListAsync(param: any) {
    return api
        .OpionDefine(`workzone-createList`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 保存作业包干费信息
 * @param param
 * @returns
 */
export function JobFeeCreateAsync(param: any) {
    return api
        .OpionDefine(`jobfee-create`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 保存作业包干费信息
 * @param param
 * @returns
 */
export function JobFeeCreateNewAsync(param: any) {
    return api
        .OpionDefine(`create-workfee-new`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 保存作业包干费信息
 * @param param
 * @returns
 */
export function JobFeeUpdateNewAsync(param: any) {
    return api
        .OpionDefine(`update-workfee-new`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 修改作业包干费信息
 * @param param
 * @returns
 */
export function JobFeeUpdateAsync(id: any, param: any) {
    return api
        .OpionDefine(`${id}/jobfee-update`, param, "POST", false)
        .then((res) => (res || {}));
}
export function tongguoCreateAsync(param: any) {
    return api
        .OpionDefine(`trafficability-create`, param, "POST", false)
        .then((res) => (res || {}));
}
export function tongguoUpdateAsync(id: any, param: any) {
    return api
        .OpionDefine(`${id}/trafficability-update`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 保存堆存费标准信息
 * @param param
 * @returns
 */
export function OutRatesCreateAsync(param: any) {
    return api
        .OpionDefine(`stowage-create`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 修改堆存费标准信息
 * @param param
 * @returns
 */
export function OutRatesUpdateAsync(id: any, param: any) {
    return api
        .OpionDefine(`${id}/stowage-update`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 保存供应商信息
 * @param param
 * @returns
 */
export function SupillerCreateAsync(param: any) {
    return api
        .OpionDefine(`supiller-create`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 修改供应商信息
 * @param param
 * @returns
 */
export function SupillerUpdateAsync(id: any, param: any) {
    return api
        .OpionDefine(`${id}/supiller-update`, param, "POST", false)
        .then((res) => (res || {}));
}
/**
 * 根据关键字查询供应商列表信息
 * @param param
 * @returns
 */
export function GetSupplierList(param: any) {
    return requireApiData(
        supplierRequest.post<any>('/api/supplier/supplier-head-v2/query-by-page', param, true)
    )
        .then((res) => res.data as []);
}

