export const defaultTreeProps = {
  parent: "parentId",
  value: "id",
  children: "children",
  label: "name"
};

export interface SupplierTypeHeadCrudDto {
  code: string | undefined;
  /** 是否作废 */
  isScrap: boolean;
  /** 父级Id */
  parentId: string | undefined;
  /** 标识 */
  mark: string;
  /** 名称 */
  name: string;
  /** 供应商性质 */
  supplierType: number;
  /** 是否纳入管控 */
  isUnderControl: boolean;
  /** 重要级别 */
  level: number;
  /** 排序 */
  sort: number;
  /** 负责人列表 */
  managerList: SupplierTypeManagerCrudDto[] | undefined;
}

export interface SupplierTypeHeadDto {
  id: string;
  /** 是否作废 */
  isScrap: boolean;
  /** 父级Id */
  parentId: string | undefined;
  /** 编号 */
  code: string | undefined;
  /** 关系码 */
  relationShipCode: string | undefined;
  /** 标识 */
  mark: string | undefined;
  /** 名称 */
  name: string | undefined;
  /** 供应商性质 */
  supplierType: number;
  /** 是否纳入管控 */
  isUnderControl: boolean;
  /** 重要级别 */
  level: number;
  /** 排序 */
  sort: number;
  /** 负责人列表 */
  managerList: SupplierTypeManagerDto[] | undefined;
}

export interface SupplierTypeHeadParam {
  page: number;
  pageSize: number;
  /** 关键字 */
  keywords?: string;
  /** 父级Id */
  parentId?: string | any;
  /** 供应商性质 */
  supplierType?: number;
  /** 类型名称 */
  name?: string;
  /** 类型标识 */
  mark?: string;
}

export interface SupplierTypeHeadTreeDto {
  id: string;
  parentId: string | undefined;
  name: string | undefined;
  mark: string | undefined;
  code: string | undefined;
  relationShipCode: string | undefined;
  children: SupplierTypeHeadTreeDto[] | undefined;
}

export interface SupplierTypeManagerCrudDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商类型Id */
  supplierTypeHeadId: string;
  /** 区域公司Id */
  areaCompanyId: string;
  /** 区域公司名称 */
  areaCompanyName: string | undefined;
  /** 机构Id */
  orgId: string;
  /** 机构名称 */
  orgName: string | undefined;
  /** 管理人员Id */
  managerUserId: string;
  /** 管理人员姓名 */
  managerUserName: string | undefined;
}

export interface SupplierTypeManagerDto {
  id: string;
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商类型Id */
  supplierTypeHeadId: string;
  /** 区域公司Id */
  areaCompanyId: string;
  /** 区域公司名称 */
  areaCompanyName: string | undefined;
  /** 机构Id */
  orgId: string;
  /** 机构名称 */
  orgName: string | undefined;
  /** 管理人员Id */
  managerUserId: string;
  /** 管理人员姓名 */
  managerUserName: string | undefined;
  _id: string;
}
