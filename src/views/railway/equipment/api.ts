import { PagedResultDto } from "@/utils/base-entity";
import BaseService from "@/api/baseService";
import { EquipmentItem } from "./type";
import { Rsp } from "../../index/type";

const api = new BaseService("equiment");

/**
 * 查询站点设备
 * @param param
 * @returns
 */
export function QueryEquipmentPage(param: any) {
  return api
    .OpionDefine("list-siteIds", param, "POST", false)
    .then((res) => (res || {}) as Rsp<Array<EquipmentItem>>);
}

/**
 * 保存设备信息
 * @returns
 */
export function UpdateEquipmentInfo(param: any) {
  return api
    .OpionDefine(``, param, "POST", false)
    .then((res) => (res || {}) as any);
}

/**
 * 获取仓库信息
 * @param param
 * @returns
 */
export function QueryEquipmentDetail(params: any) {
  return api
    .OpionDefine(`list-ids`, params, "POST", false)
    .then((res) => (res || {}) as Rsp<Array<EquipmentItem>>);
}
