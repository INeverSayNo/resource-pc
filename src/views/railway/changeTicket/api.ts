import { PagedResultDto } from "@/utils/base-entity";
import BaseService from "@/api/baseService";
import { Rsp } from "../../index/type";
import { ChangeTicketDetail } from "./type";

const api = new BaseService("railway-change-ticket");

/**
 * 根据站点ID查询换装方案
 * @stationId string
 * @returns
 */
export function QueryChangeTicketPage(stationId: string) {
  return api
    .OpionDefine(`${stationId}/by-stationId`, { stationId }, "GET", false)
    .then((res) => (res || {}) as Rsp<Array<ChangeTicketDetail>>);
}

/**
 * 新增换装方案
 * @params any
 * @returns
 */
export function CreateChangeTicket(params: any) {
  return api
    .OpionDefine(``, params, "POST", false)
    .then((res) => (res || {}) as Rsp<string>);
}

/**
 * 更新换装方案
 * @params any
 * @returns
 */
export function UpdateChangeTicket(params: any, id: string) {
  return api
    .OpionDefine(`${id}`, params, "PUT", false)
    .then((res) => (res || {}) as Rsp<any>);
}

/**
 * 根据ID查询换装详情
 * @params any
 * @returns
 */
export function GetChangeTicketDetailById(id: string) {
  return api
    .OpionDefine(`${id}`, "", "GET", false)
    .then((res) => (res || {}) as Rsp<ChangeTicketDetail>);
}
