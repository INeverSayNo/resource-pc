import { PagedResultDto } from "@/utils/base-entity";
import BaseService from "@/api/baseService";
import {
  GoodsItems,
  PolicyAllSimpleRecordDto,
  PolicyAllSimpleUpdateDto,
  PolicyShowDto,
  PricePolicyQueryLineParam,
  PricePolicyQueryParam,
  PricePolicyResult
} from "./types";
import { deepClone } from "@/utils";

const api = new BaseService("railway");

/**
 * 分页查询优价主表信息
 * @param params 查询参数
 * @returns
 */
function SearchPolicy(params: PricePolicyQueryParam) {
  return api
    .OpionDefine("search-policy-inner", params, "POST")
    .then(
      (res) => (res?.data || {}) as PagedResultDto<PolicyAllSimpleRecordDto>
    );
}

/**
 * 根据优价政策Id,获取优价明细项目
 * @param policyId 优价政策Id
 * @returns
 */
function GetPolicyDetails(policyId: string) {
  return api
    .OpionDefine(`${policyId}/policy-details`, "", "GET", false)
    .then((res) => (res?.data || []) as PricePolicyResult[]);
}

/**
 * 全部货物信息，包含品类
 * @returns
 */
function GetAllGoods(goodsName: string) {
  return api
    .OpionDefine(`all-goods?goodsName=${goodsName}`, "", "GET", false)
    .then((res) => (res?.data || []) as GoodsItems[]);
}

/**
 * 查询优价线路
 * @param param
 * @returns
 */
function SearchPolicyLine(param: PricePolicyQueryLineParam) {
  return api
    .OpionDefine(`goods-policy-query`, param, "POST", false)
    .then((res) => (res?.data || []) as PolicyShowDto[]);
}

/**
 * 更新优价集装箱类型以及备注
 * @param param
 * @returns
 */
function UpdatePolicyContainerTypeAndRemark(param: PolicyAllSimpleUpdateDto) {
  const postParam = deepClone<PolicyAllSimpleUpdateDto>(param);
  if (param.containerTypes.length) {
    postParam.containerType = param.containerTypes.join(",");
  }
  return api
    .OpionDefine(`update-policy-cr`, postParam, "POST", false)
    .then((res) => (res?.isSuccessful || false) as boolean);
}

export {
  SearchPolicy,
  GetPolicyDetails,
  GetAllGoods,
  SearchPolicyLine,
  UpdatePolicyContainerTypeAndRemark
};
