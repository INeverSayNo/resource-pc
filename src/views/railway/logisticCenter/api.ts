import { PagedResultDto } from "@/utils/base-entity";
import BaseService from "@/api/baseService";
import type {
  LogisticCenterItem,
  LogisticCenterDetail,
  BusinessOrgItem
} from "./type";
import { Rsp } from "../../index/type";

const api = new BaseService("railway-logistic-center");
const railwayApi = new BaseService("railway");

/**
 * 分页查询物流中心信息
 * @param params 查询参数
 * @returns
 */
export async function QueryLogisticCenterPage(params: any) {
  return api
    .OpionDefine("query-by-page", params, "POST")
    .then((res) => (res?.data || {}) as PagedResultDto<LogisticCenterItem>);
}

// 获取物流中心详情
export async function QueryLogisticCenterDetailById(id: string) {
  return api
    .OpionDefine(`${id}/get-by-id`, "", "GET")
    .then((res) => (res?.data || {}) as LogisticCenterDetail);
}

// 获取所有物流中心
export async function QueryLogisticCenter() {
  return api
    .OpionDefine(`all`, "", "GET")
    .then((res) => (res?.data || []) as Array<LogisticCenterItem>);
}

// 编辑物流中心
export async function UpdateLogistic(params: any) {
  return api.OpionDefine("createorupdate", params, "POST").then((res) => res);
}

// 获取物流中心下属营业部
export async function GetBusinessOrgByCenterId(
  id: string
): Promise<Rsp<Array<BusinessOrgItem>>> {
  return api
    .OpionDefine(`${id}/businessorg-by-centerId`, "", "GET")
    .then((res) => res);
}

// 编辑营业部
export async function UpdateBusinessOrg(params: any) {
  return api
    .OpionDefine(`createorupdate-businessorg`, params, "POST")
    .then((res) => res);
}

export async function DeleteBusinessOrg(businessOrgId: string) {
  return api
    .OpionDefine(`${businessOrgId}/delete-businessorg`, "", "POST")
    .then((res) => res);
}

/**
 * 获取站点
 * @param params
 * @returns
 */
export async function QueryStationList(params: any) {
  return railwayApi
    .OpionDefine(`query-dto-by-page`, params, "POST")
    .then((res) => (res?.data || {}) as any);
}
