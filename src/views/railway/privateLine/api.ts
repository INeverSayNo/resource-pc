import { PagedResultDto } from "@/utils/base-entity";
import BaseService from "@/api/baseService";
import {
  PrivateLineItem,
} from "./type";

const api = new BaseService("railway");

/**
 * 分页查询专用线
 * @param params 查询参数
 * @returns
 */
export async function QueryPrivateLinePage(params: any) {
  return api
    .OpionDefine("private-page", params, "POST")
    .then((res) => (res?.data || {}) as PagedResultDto<PrivateLineItem>);
}

/**
 * 分页查询专用线
 * @param params 查询参数
 * @returns
 */
export async function QueryPrivateLineDetailById(id: string) {
  return api
    .OpionDefine(`${id}/private-line`, "", "GET")
    .then((res) => (res?.data || {}) as PrivateLineItem);
}