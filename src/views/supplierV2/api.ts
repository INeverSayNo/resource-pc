import { PagedResultDto } from "@/utils/base-entity";
import { isUnDef } from "@/utils/is";
import { listToTree } from "@/utils/tree";
import SupplierBaseService from "@/api/supplierService";
import { BaseApi, PATH_URL, requireApiData } from '@/request'
import { USE_CRY_PTO } from '@/request/config'
import { SupplierTypeHeadTreeDto } from "./supplierType/types";
import {
  SupplierBankInfoDto,
  SupplierEnterpriseLinkPersonCreateOrUpdateDto,
  SupplierEnterpriseLinkPersonDto,
  SupplierEnterpriseParamDto,
  SupplierHeadAllParamDto,
  SupplierHeadDto,
  SupplierPersonParamDto,
  SupplierTagCrudDto,
  SupplierTagDto,
  SupplierTypeHeadDto
} from "./types";

const resourceRequest = new BaseApi({ baseURL: PATH_URL, crypto: USE_CRY_PTO })
/**
 * 供应商主表API
 */
export const supplierHeadApi = new SupplierBaseService("supplier-head-v2");
/**
 * 企业供应商联系人信息API
 */
export const supplierContactApi = new SupplierBaseService(
  "supplier-enterprise-contact"
);
/**
 * 供应商银行账号信息
 */
export const supplierBankApi = new SupplierBaseService("supplier-bank");
/**
 * 供应商问卷信息
 */
export const supplierQuestionnaireApi = new SupplierBaseService(
  "supplier-questionnaire"
);

/**
 * 供应商分类
 */
export const supplierTypeApi = new SupplierBaseService("supplier-type");

/**
 * 供应商自定义标签
 */
export const supplierTagApi = new SupplierBaseService("supplier-tag");

/**
 * 分页查询企业供应商
 * @param param
 * @returns
 */
export function QueryEnterprise(param: SupplierEnterpriseParamDto) {
  return supplierHeadApi
    .OpionDefine("query-enterprise", param, "POST")
    .then((res) => res.data as PagedResultDto<SupplierHeadDto>);
}
/**
 * 根据关键字查询供应商列表信息
 * @param param
 * @returns
 */
export function GetSupplierList(param: SupplierHeadAllParamDto) {
  return supplierHeadApi
    .OpionDefine(`getlist`, param, "POST", false)
    .then((res) => res.data as SupplierHeadDto[]);
}
/**
 * 分页查询个体供应商
 * @param param
 * @returns
 */
export function QueryPerson(param: SupplierPersonParamDto) {
  return supplierHeadApi
    .OpionDefine("query-person", param, "POST")
    .then((res) => res.data as PagedResultDto<SupplierHeadDto>);
}
/**
 * 重置密码
 * @param supplierId 供应商Id
 * @returns
 */
export function ResetPassword(supplierId: string) {
  return supplierHeadApi
    .OpionDefine(`${supplierId}/reset-password`, "", "POST", false)
    .then((res) => (res?.data || false) as boolean);
}
// #region 联系人信息begin
/**
 * 批量添加企业供应商联系人信息
 * @param param
 * @returns
 */
export function ContactCrateBatch(
  param: SupplierEnterpriseLinkPersonCreateOrUpdateDto[]
) {
  return supplierContactApi
    .OpionDefine("create-batch", param, "POST", false)
    .then((res) => (res.data || false) as boolean);
}
/**
 * 根据供应商Id获取所有联系人信息
 * @param supplierId
 * @returns
 */
export function GetListBySupplierId(supplierId: string) {
  return supplierContactApi
    .OpionDefine(`${supplierId}/get-list-by-supplier-id`, "", "GET", false)
    .then((res) => res.data as SupplierEnterpriseLinkPersonDto[]);
}
// #endregion

// #region 银行账号信息begin
/**
 * 根据供应商主表Id获取默认的银行账号信息
 * @param supplierId
 * @returns
 */
export function GetDefaultBankBySupplierId(supplierId: string) {
  return supplierBankApi
    .OpionDefine(
      `${supplierId}/get-default-by-supplier-id`,
      "",
      "GET",
      false,
      true
    )
    .then((res) => res.data as SupplierBankInfoDto);
}
/**
 * 根据供应商Id查询银行列表信息
 * @param supplierId
 * @returns
 */
export function GetBankListBySupplierId(supplierId: string) {
  return supplierBankApi
    .OpionDefine(
      `${supplierId}/get-list-by-supplier-id`,
      "",
      "GET",
      false,
      true
    )
    .then((res) => res.data as SupplierBankInfoDto[]);
}
/**
 * 设置默认账号
 * @param supplierId
 * @returns
 */
export function SetDefaultBank(id: string) {
  return supplierBankApi
    .OpionDefine(`${id}/set-default`, "", "POST", false)
    .then((res) => res.data as boolean);
}
// #endregion

// #region 供应商问卷

/**
 * 删除问卷中的单个供应商信息
 * @param id 问卷供应商全体Id
 * @returns
 */
export function DeleteRespondents(id: string) {
  return supplierQuestionnaireApi
    .OpionDefine(`${id}/delete-respondents`, "", "POST", false)
    .then((res) => res?.data as boolean);
}

/**
 * 推送
 * @param id 问卷Id
 * @returns
 */
export function PushQuestionnaire(id: string) {
  return supplierQuestionnaireApi
    .OpionDefine(`${id}/push`, "", "POST", false)
    .then((res) => res?.data as boolean);
}
/**
 * 作废问卷
 * @param id 问卷Id
 * @returns
 */
export function ScrapQuestionnaire(id: string) {
  return supplierQuestionnaireApi
    .OpionDefine(`${id}/scrap`, "", "POST", false)
    .then((res) => res?.data as boolean);
}
// #endregion

// #region 供应商产品矩阵
export function GetProudctListBySupplierId(
  supplierId: string,
  type: "transport" | "stevedoring" | "warehouse"
) {
  return requireApiData(
    resourceRequest.get<any>(
      `/api/resource/supplier-product-${type}/${supplierId}/get-list-by-supplier-id`,
      undefined,
      true
    )
  ).then((res) => res.data);
}
/**
 * 根据产品Id 获取产品详情
 * @param id 供应商产品Id
 * @param type 产品类型
 * @returns
 */
export function GetProductById(
  id: string,
  type: "transport" | "stevedoring" | "warehouse"
) {
  return requireApiData(
    resourceRequest.get<any>(
      `/api/resource/supplier-product-${type}/${id}/get-by-id`,
      undefined,
      true
    )
  ).then((res) => res.data);
}
// #endregion

// #region 供应商资源
/**
 * 根据供应商Id,获取供应商资源列表
 * @param supplierId 供应商Id
 * @param type 资源类型
 * @returns
 */
export function GetResourceListBySupplierId(
  supplierId: string,
  type: "driver" | "vehicle" | "cargoShip"
) {
  return requireApiData(
    resourceRequest.get<any>(
      `/api/resource/supplier-resource-${type}/${supplierId}/get-list-by-supplier-head-id`,
      undefined,
      true
    )
  ).then((res) => res.data);
}

/**
 * 根据资源Id 获取资源详情
 * @param id 供应商资源Id
 * @param type 资源类型
 * @returns
 */
export function GetResourceById(
  id: string,
  type: "driver" | "vehicle" | "cargoShip"
) {
  return requireApiData(
    resourceRequest.get<any>(
      `/api/resource/supplier-resource-${type}/${id}/get-by-id`,
      undefined,
      true
    )
  ).then((res) => res.data);
}
// #endregion

// #region 供应商分类
export function GetSupplierTypeTree() {
  return supplierTypeApi
    .OpionDefine("tree", "", "GET", false)
    .then((res) => (res?.data || []) as SupplierTypeHeadTreeDto[]);
}

export function DelSupplierTypeManager(id: string) {
  return supplierTypeApi
    .OpionDefine(`${id}/delete-manager`, "", "DELETE", false)
    .then((res) => res?.data as boolean);
}
export function GetSupplierByNature(
  nature: number,
  key: string,
  needTree = false
) {
  return new Promise<any>((resolve) => {
    const cacheKey = `supplier_type_data_${key}_${needTree}`;
    const cacheData = sessionStorage.getItem(cacheKey) || "";
    if (cacheData) {
      try {
        const data = JSON.parse(cacheData);
        resolve(data);
        return;
      } catch (error) {
        //
      }
    }
    supplierTypeApi
      .OpionDefine(`${nature}/get-by-nature`, "", "GET", false)
      .then((res) => {
        const data = (res?.data || []) as SupplierTypeHeadDto[];
        if (needTree) {
          const treeData = listToTree<SupplierTypeHeadTreeDto>(data, {
            id: "code",
            children: "children",
            pid: "parentCode"
          });
          const result = { treeData, data };
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
          resolve(result);
          return;
        } else {
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
        }
        resolve(data);
      });
  });
}
// #endregion

type ParamGetSupplierExistInfo = {
  supplierName: string;
  SupplierNature: number;
};
/**
 * 根据企业完整名称获取是否已入库
 * @param name
 */
export async function GetSupplierExistInfo(params: ParamGetSupplierExistInfo) {
  return supplierHeadApi.OpionDefine(
    "get-supplierDto-by-name",
    params,
    "GET",
    false
  );
}

// #region 供应商自定义标签操作
/**
 * 新增
 * @param param
 * @returns
 */
export function CreateTag(param: SupplierTagCrudDto) {
  return supplierTagApi
    .OpionDefine("", param, "POST", false)
    .then((res) => (res?.data || false) as boolean);
}
/**
 * 批量新增
 * @param param
 * @returns
 */
export function CreateTagBatch(param: SupplierTagCrudDto[]) {
  return supplierTagApi
    .OpionDefine("create-batch", param, "POST", false, true)
    .then((res) => (res?.data || false) as boolean);
}

/**
 * 删除
 * @param id
 * @returns
 */
export function DeteleTag(id: string) {
  return supplierTagApi
    .OpionDefine(id, "", "DELETE", false)
    .then((res) => (res?.data || false) as boolean);
}
/**
 * 根据供应商Id,查询
 * @param supplierIds
 * @param tagType
 * @returns
 */
export function GetTags(supplierIds: string[], tagType?: number) {
  const typeParam = isUnDef(tagType) ? "" : `?tagType=${tagType}`;
  return supplierTagApi
    .OpionDefine(`get-tags${typeParam}`, supplierIds, "POST", false)
    .then((res) => (res?.data || []) as SupplierTagDto[]);
}

// #endregion
