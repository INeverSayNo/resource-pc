import { PagedResultDto } from "@/utils/base-entity";
import BaseService from "@/api/baseService";
import {
  WarehouseItem,
} from "./type";
import { Rsp } from '../../index/type';

const api = new BaseService('warehouse')

/**
 * 分页查询仓库列表
 * @param param
 * @returns
 */
export function QueryWarehousePage(param: any) {
  return api
    .OpionDefine("query-by-page", param, "POST")
    .then(res => (res?.data || {}) as PagedResultDto<WarehouseItem>)
}

/**
 * 保存仓库信息
 * @returns
 */
export function UpdateWarehouseInfo(param: any) {
  return api
    .OpionDefine(``, param, 'POST', false)
    .then(res => (res || {}) as any)
}

/**
 * 获取仓库信息
 * @param param
 * @returns
 */
export function QueryWarehouseDetail(id: string) {
  return api
    .OpionDefine(`${id}`, '', "GET")
    .then(res => (res || {}) as Rsp<WarehouseItem>)
}