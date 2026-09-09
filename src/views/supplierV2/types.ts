import { FileAttach } from "@/utils/base-entity";

export interface SupplierBankInfoBatchUpdateDto {
  id: string;
  dto: SupplierBankInfoCreateOrUpdateDto;
}

export interface SupplierBankInfoCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 银行账户 */
  bankAccount?: string;
  /** 开户行 */
  bankName?: string;
  /** 账户 */
  bankNo?: string;
  currency: number;
  bankAccountType: number;
  /** 是否默认 */
  isDefault: boolean;
}

export interface SupplierBankInfoDto {
  id: string;
  creationTime: Date;
  creatorId: string | undefined;
  lastModificationTime: Date | undefined;
  lastModifierId: string | undefined;
  isDeleted: boolean;
  deleterId: string | undefined;
  deletionTime: Date | undefined;
  creatorName: string | undefined;
  lastModifierName: string | undefined;
  deleterName: string | undefined;
  isScrap: boolean;
  scraperId: string | undefined;
  scraperName: string | undefined;
  scrapTime: Date | undefined;
  organizationId: string;
  organizationRelationshipId: string;
  organizationCode: string | undefined;
  organizationRelationshipCode: string | undefined;
  organizationName: string | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 银行账户 */
  bankAccount: string | undefined;
  /** 开户行 */
  bankName: string | undefined;
  /** 账号 */
  bankNo: string | undefined;
  currency: number;
  readonly currencyName: string | undefined;
  bankAccountType: number;
  readonly bankAccountTypeName: string | undefined;
  /** 是否默认 */
  isDefault: boolean;
}

export interface SupplierEnterpriseExtendCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 账号 */
  accountId: string;
  /** 密码 */
  password: string;
  /** 供应商分类标示==>SupplierBusinessType */
  enterpriseBusinessTypeIds: string;
  /** 供应商分类名称 */
  enterpriseBusinessTypeNames: string | undefined;
  /** 简介 */
  intro: string | undefined;
  /** 是否质量体系认证 */
  hasCMDC: boolean;
  /** 网站地址 */
  officialWebsite: string | undefined;
  /** 所属行业 */
  industryMark: string | undefined;
  /** 所属行业名称 */
  industryName: string | undefined;
  /** 组织机构代码 */
  supplierDutyCode: string | undefined;
  /** 法人姓名 */
  legalName: string | undefined;
  /** 公司电话 */
  companyPhone: string | undefined;
  /** 企业类型 */
  enterpriseType: string | undefined;
  /** 注册资金(万) */
  registeredCapital: number;
  /** 成立日期 */
  registDate: Date | undefined;
  /** 注册地址 */
  registAddress: string | undefined;
  /** 人员规模 */
  staffSize: string | undefined;
  /** 经营范围 */
  businessScope: string | undefined;
  /** 企查查工商信息json */
  businessInfoJson: string | undefined;
  /** 是否签订合同 */
  isContract: boolean;
  cmdcFile: FileAttach;
  /** 联系人列表 */
  linkPersonList: SupplierEnterpriseLinkPersonCreateOrUpdateDto[] | undefined;
}

export interface SupplierEnterpriseExtendDto {
  id: string;
  creationTime: Date;
  creatorId: string | undefined;
  lastModificationTime: Date | undefined;
  lastModifierId: string | undefined;
  isDeleted: boolean;
  deleterId: string | undefined;
  deletionTime: Date | undefined;
  creatorName: string | undefined;
  lastModifierName: string | undefined;
  deleterName: string | undefined;
  isScrap: boolean;
  scraperId: string | undefined;
  scraperName: string | undefined;
  scrapTime: Date | undefined;
  organizationId: string;
  organizationRelationshipId: string;
  organizationCode: string | undefined;
  organizationRelationshipCode: string | undefined;
  organizationName: string | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 账号 */
  accountId: string | undefined;
  /** 密码 */
  password: string | undefined;
  /** 供应商分类标示==>SupplierBusinessType */
  enterpriseBusinessTypeIds: string | undefined;
  /** 供应商分类名称 */
  enterpriseBusinessTypeNames: string | undefined;
  /** 简介 */
  intro: string | undefined;
  /** 是否质量体系认证 */
  hasCMDC: boolean;
  /** 质量认证体系照片地址 */
  cmdcPics: string | undefined;
  /** 网站地址 */
  officialWebsite: string | undefined;
  /** 所属行业 */
  industryMark: string | undefined;
  /** 所属行业名称 */
  industryName: string | undefined;
  /** 组织机构代码 */
  supplierDutyCode: string | undefined;
  /** 法人姓名 */
  legalName: string | undefined;
  /** 公司电话 */
  companyPhone: string | undefined;
  /** 企业类型 */
  enterpriseType: string | undefined;
  /** 注册资金(万) */
  registeredCapital: number;
  /** 成立日期 */
  registDate: Date | undefined;
  /** 注册地址 */
  registAddress: string | undefined;
  /** 人员规模 */
  staffSize: string | undefined;
  /** 经营范围 */
  businessScope: string | undefined;
  /** 企查查工商信息json */
  businessInfoJson: string | undefined;
  /** 是否签订合同 */
  isContract: boolean;
  cmdcFile: FileAttach;
  /** 联系人列表 */
  linkPersonList: SupplierEnterpriseLinkPersonDto[] | undefined;
  /** 银行账号列表信息 */
  bankList: SupplierBankInfoDto[] | undefined;
  /** 证书列表 */
  licenceList: SupplierLicenceDto[] | undefined;
}

export interface SupplierEnterpriseLinkPersonBatchUpdateDto {
  id: string;
  dto: SupplierEnterpriseLinkPersonCreateOrUpdateDto;
}

export interface SupplierEnterpriseLinkPersonCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 所属项目 */
  projectNames: string | undefined;
  /** 联系人 */
  contact: string;
  /** 联系电话 */
  contactPhone: string;
  /** 职务 */
  position: string | undefined;
  /** 负责事宜 */
  responsibleDes: string | undefined;
  /** 是否禁止登录 */
  isDisabled: boolean;
  /** 负责事项 */
  responsibleBus: string | undefined;
  /** 负责事项名称 */
  responsibleBusNames: string | undefined;
  /** 负责事项 */
  responsibleBusEdit: string[] | undefined;
}

export interface SupplierEnterpriseLinkPersonDto {
  id: string;
  creationTime: Date;
  creatorId: string | undefined;
  lastModificationTime: Date | undefined;
  lastModifierId: string | undefined;
  isDeleted: boolean;
  deleterId: string | undefined;
  deletionTime: Date | undefined;
  creatorName: string | undefined;
  lastModifierName: string | undefined;
  deleterName: string | undefined;
  isScrap: boolean;
  scraperId: string | undefined;
  scraperName: string | undefined;
  scrapTime: Date | undefined;
  organizationId: string;
  organizationRelationshipId: string;
  organizationCode: string | undefined;
  organizationRelationshipCode: string | undefined;
  organizationName: string | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 所属项目 */
  projectNames: string | undefined;
  /** 联系人 */
  contact: string | undefined;
  /** 联系电话 */
  contactPhone: string | undefined;
  /** 职务 */
  position: string | undefined;
  /** 负责事宜 */
  responsibleDes: string | undefined;
  /** 是否禁止登录 */
  isDisabled: boolean;
  /** 负责事项 */
  responsibleBus: string | undefined;
  /** 负责事项名称 */
  responsibleBusNames: string | undefined;
  /** 负责事项 */
  responsibleBusEdit: string[] | undefined;
}

export interface SupplierEnterpriseParamDto {
  sumfield: string | undefined;
  sort: string | undefined;
  page: number;
  limit: number;
  totalRowsCount: number;
  isExport: boolean;
  readonly orderString: string | undefined;
  isAllPage: boolean;
  readonly startIndex: number;
  total: number;
  totalpagecount: number;
  /** 供应商编号,系统自动生成 */
  supplierCode: string | undefined;
  /** 供应商名称 */
  supplierName: string | undefined;
  enterpriseBusinessType: number;
  sourceSys: number;
  /** 是否已审核 */
  isAudit: boolean;
  businessType: number;
  supplierTypeId: number;
  /** 是否质量体系认证 */
  hasCMDC: boolean;
}

export interface SupplierHeadCreateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商名称 */
  supplierName: string;
  /** 简称 */
  shortName: string | undefined;
  supplierNature: SupplierNature;
  /** 主营业务类型标示==>BusinessType */
  businessTypeIds: string;
  /** 主营业务类型名称 */
  businessTypeNames: string | undefined;
  /** 接受付款方式 */
  paymentTypeIds: string | undefined;
  /** 接受付款方式名称 */
  paymentTypeNames: string | undefined;
  supplierTypeId: number;
  lastAssessLevelId: number;
  sourceSys: number;
  /** 源数据Id */
  sourceId: string | undefined;
  /** 是否已审核通过 */
  isAudit: boolean;
  auditStatus: number;
  /** 审核描述 */
  auditRemark: string | undefined;
  /** 审核流程Id */
  workflowId: string | undefined;
  enterpriseExtend: SupplierEnterpriseExtendCreateOrUpdateDto;
  personExtend: SupplierPersonExtendCreateOrUpdateDto;
  /** 微信uninId */
  uninId: string | undefined;
  /** 微信openId */
  openId: string | undefined;
  /** 银行信息 */
  bankList: SupplierBankInfoCreateOrUpdateDto[] | undefined;
  /** 贡献者Id */
  contributorId?: string;
  /** 贡献者姓名 */
  contributorName?: string;
  /** 是否境外供应商 */
  isOverseas: boolean;
  /** 积分等级 */
  integralLevel?: number;
  /** 标签 */
  tag?: string;
  /** 合作次数 */
  cooperationNum?: number;
  /** 合作均价 */
  cooperationAvgPrice?: number;
  /** 浏览次数 */
  readNum?: number;
  /** 营业执照 */
  licenseFile?: FileAttach;
  licenceNo?: string;
  licenceExpiryDate?: string;
  ownerOrgRelationShipId: string;
  ownerOrgName: string;
  /** 是否中铁供应商 */
  isChinaRailway: boolean;
}

export interface SupplierHeadCrudDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商名称 */
  supplierName: string;
  /** 简称 */
  shortName: string | undefined;
  supplierNature: SupplierNature;
  /** 主营业务类型标示==>BusinessType */
  businessTypeIds: string;
  /** 主营业务类型名称 */
  businessTypeNames: string | undefined;
  /** 接受付款方式 */
  paymentTypeIds: string | undefined;
  /** 接受付款方式名称 */
  paymentTypeNames: string | undefined;
  supplierTypeId: number;
  lastAssessLevelId: number;
  sourceSys: number;
  /** 源数据Id */
  sourceId: string | undefined;
  /** 是否已审核通过 */
  isAudit: boolean;
  auditStatus: number;
  /** 审核描述 */
  auditRemark: string | undefined;
  /** 审核流程Id */
  workflowId: string | undefined;
  enterpriseExtend: SupplierEnterpriseExtendCreateOrUpdateDto;
  personExtend: SupplierPersonExtendCreateOrUpdateDto;
}

export interface SupplierHeadDto {
  id: string;
  creationTime: Date;
  creatorId: string | undefined;
  lastModificationTime: Date | undefined;
  lastModifierId: string | undefined;
  isDeleted: boolean;
  deleterId: string | undefined;
  deletionTime: Date | undefined;
  creatorName: string | undefined;
  lastModifierName: string | undefined;
  deleterName: string | undefined;
  isScrap: boolean;
  scraperId: string | undefined;
  scraperName: string | undefined;
  scrapTime: Date | undefined;
  organizationId: string;
  organizationRelationshipId: string;
  organizationCode: string | undefined;
  organizationRelationshipCode: string | undefined;
  organizationName: string | undefined;
  /** 供应商名称 */
  supplierName: string | undefined;
  /** 供应商编号,系统自动生成 */
  supplierCode: string | undefined;
  supplierNature: number;
  readonly supplierNatureName: string | undefined;
  /** 主营业务类型标示==>BusinessType */
  businessTypeIds: string | undefined;
  /** 主营业务类型名称 */
  businessTypeNames: string | undefined;
  /** 接受付款方式 */
  paymentTypeIds: string | undefined;
  /** 接受付款方式名称 */
  paymentTypeNames: string | undefined;
  supplierTypeId: number;
  readonly supplierTypeName: string | undefined;
  lastAssessLevelId: number;
  readonly lastAssessLevelName: string | undefined;
  sourceSys: number;
  readonly sourceSysName: string | undefined;
  /** 源数据Id */
  sourceId: string | undefined;
  /** 是否已审核通过 */
  isAudit: boolean;
  auditStatus: number;
  readonly auditStatusName: string | undefined;
  /** 审核描述 */
  auditRemark: string | undefined;
  /** 审核流程Id */
  workflowId: string | undefined;
  /** 贡献者Id */
  contributorId?: string;
  /** 贡献者姓名 */
  contributorName?: string;
  /** 是否境外供应商 */
  isOverseas: boolean;
  /** 积分等级 */
  integralLevel?: number;
  /** 标签 */
  tag?: string;
  /** 合作次数 */
  cooperationNum?: number;
  /** 合作均价 */
  cooperationAvgPrice?: number;
  /** 浏览次数 */
  readNum?: number;
  lastOwnerOrgName?: string;
  lastOwnerOrgRelationShipId?: string;
  /** 营业执照 */
  licenseFile?: FileAttach;
  enterpriseExtend: SupplierEnterpriseExtendDto;
  personExtend: SupplierPersonExtendDto;
  ownerOrgName?: string;
  /** 是否中铁供应商 */
  isChinaRailway?: boolean;
}

export interface SupplierLicenceCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 供应商资源Id */
  supplierResourceId: string | undefined;
  businessType: number;
  licenceType: number;
  /** 附件Ids，多个以逗号分割 */
  fileAttachIds: string | undefined;
  /** 证件编码 */
  licenceNo: string | undefined;
  /** 有效期 */
  expiryDate: Date | undefined;
  /** 签发单位 */
  signUnit: string | undefined;
  /** 备注 */
  remark: string | undefined;
  /** 附件列表 */
  fileAttaches: FileAttach[] | undefined;
}

export interface SupplierLicenceDto {
  id: string;
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 供应商资源Id */
  supplierResourceId: string | undefined;
  businessType: number;
  licenceType: number;
  /** 附件Ids，多个以逗号分割 */
  fileAttachIds: string | undefined;
  /** 证件编码 */
  licenceNo: string | undefined;
  /** 有效期 */
  expiryDate: Date | undefined;
  /** 签发单位 */
  signUnit: string | undefined;
  /** 备注 */
  remark: string | undefined;
  /** 附件信息 */
  fileAttaches: FileAttach[] | undefined;
}

export interface SupplierLicenceParam {
  id: string | undefined;
  supplierHeadId: string | undefined;
  resourceId: string | undefined;
  businessType: number;
  licenceType: number;
}

export type SupplierNature = 1 | 2;

export interface SupplierPersonExtendCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 联系人 */
  contact: string;
  /** 联系电话 */
  contactPhone: string;
  /** 身份证号 */
  idCardNo: string;
  /** 身份证有效期 */
  idCardExpiryDate: Date | undefined;
  /** 身份证地址 */
  idCardAddress: string | undefined;
  /** 现居住地 */
  address: string | undefined;
  /** 概况 */
  description: string | undefined;
  /** 个体供应商类型==>PersonBusinessType */
  personBusinessTypeIds: string | undefined;
  /** 个体供应商类型 名称 */
  personBusinessTypeNames: string | undefined;
  idCardFrontFile: FileAttach | undefined;
  idCardBackFile: FileAttach | undefined;
}

export interface SupplierPersonExtendDto {
  id: string;
  creationTime: Date;
  creatorId: string | undefined;
  lastModificationTime: Date | undefined;
  lastModifierId: string | undefined;
  isDeleted: boolean;
  deleterId: string | undefined;
  deletionTime: Date | undefined;
  creatorName: string | undefined;
  lastModifierName: string | undefined;
  deleterName: string | undefined;
  isScrap: boolean;
  scraperId: string | undefined;
  scraperName: string | undefined;
  scrapTime: Date | undefined;
  organizationId: string;
  organizationRelationshipId: string;
  organizationCode: string | undefined;
  organizationRelationshipCode: string | undefined;
  organizationName: string | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 联系人 */
  contact: string | undefined;
  /** 联系电话 */
  contactPhone: string | undefined;
  /** 身份证正面 */
  idCardFront: string | undefined;
  /** 身份证反面 */
  idCardBack: string | undefined;
  /** 身份证号 */
  idCardNo: string | undefined;
  /** 身份证有效期 */
  idCardExpiryDate: Date | undefined;
  /** 身份证地址 */
  idCardAddress: string | undefined;
  /** 现居住地 */
  address: string | undefined;
  /** 概况 */
  description: string | undefined;
  /** 个体供应商类型==>PersonBusinessType */
  personBusinessTypeIds: string | undefined;
  /** 个体供应商类型 名称 */
  personBusinessTypeNames: string | undefined;
  idCardFrontFile: FileAttach;
  idCardBackFile: FileAttach;
  /** 银行账号列表信息 */
  bankList: SupplierBankInfoDto[] | undefined;
}

export interface SupplierPersonParamDto {
  sumfield: string | undefined;
  sort: string | undefined;
  page: number;
  limit: number;
  totalRowsCount: number;
  isExport: boolean;
  readonly orderString: string | undefined;
  isAllPage: boolean;
  readonly startIndex: number;
  total: number;
  totalpagecount: number;
  /** 供应商编号,系统自动生成 */
  supplierCode: string | undefined;
  /** 供应商名称 */
  supplierName: string | undefined;
  enterpriseBusinessType: number;
  sourceSys: number;
  /** 是否已审核 */
  isAudit: boolean;
  /** 联系人 */
  contact: string | undefined;
  businessType: number;
}

export interface SupplierProductStevedoringHeadCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 行政区域Code */
  regionCode: string | undefined;
  /** 行政区域名称 */
  regionName: string | undefined;
  /** 详细地址 */
  address: string | undefined;
  /** 经度 */
  lng: number;
  /** 维度 */
  lat: number;
  /** 服务范围(km) */
  serviceScope: number;
  /** 服务城市片区 */
  cityArea: string | undefined;
  /** 装卸人数 */
  loaderNum: number;
  /** 价格说明 */
  priceDesc: string | undefined;
  /** 联系人 */
  contact: string | undefined;
  /** 联系电话 */
  phone: string | undefined;
  /** 备注 */
  remark: string | undefined;
  /** 装卸机械明细 */
  machines: SupplierProductStevedoringMachineCreatOrUpdateDto[] | undefined;
}

export interface SupplierProductStevedoringHeadDto {
  id: string;
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 行政区域Code */
  regionCode: string | undefined;
  /** 行政区域名称 */
  regionName: string | undefined;
  /** 详细地址 */
  address: string | undefined;
  /** 经度 */
  lng: number;
  /** 维度 */
  lat: number;
  /** 服务范围(km) */
  serviceScope: number;
  /** 服务城市片区 */
  cityArea: string | undefined;
  /** 装卸人数 */
  loaderNum: number;
  /** 价格说明 */
  priceDesc: string | undefined;
  /** 联系人 */
  contact: string | undefined;
  /** 联系电话 */
  phone: string | undefined;
  /** 备注 */
  remark: string | undefined;
  /** 机械明细 */
  machines: SupplierProductStevedoringMachineDto[] | undefined;
}

export interface SupplierProductStevedoringMachineCreatOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 机械名称 */
  machineName: string | undefined;
  /** 机械数量 */
  machineNum: number;
  /** 照片Ids,多个用逗号分割 */
  fileAttachIds: string | undefined;
  /** 附件信息 */
  fileAttaches: FileAttach[] | undefined;
}

export interface SupplierProductStevedoringMachineDto {
  id: string;
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 装卸产品主表Id */
  stevedoringHeadId: string;
  /** 机械名称 */
  machineName: string | undefined;
  /** 机械数量 */
  machineNum: number;
  /** 照片Ids,多个用逗号分割 */
  fileAttachIds: string | undefined;
  /** 附件信息 */
  fileAttaches: FileAttach[] | undefined;
}

export interface SupplierProductTransportHeadCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 运输类型标识，【仅，公、铁、水、国际运输】 */
  businessTypeIds: string | undefined;
  /** 运输类型名称 */
  businessTypeNames: string | undefined;
  /** 线路描述,如：成都-重庆 */
  lineDesc: string | undefined;
  /** 联系人 */
  contact: string | undefined;
  /** 联系电话 */
  phone: string | undefined;
  /** 载具情况描述 */
  carrierDesc: string | undefined;
  /** 运输要求 */
  transportRequest: string | undefined;
  /** 货物要求 */
  goodsRequest: string | undefined;
  /** 价格说 */
  priceDesc: string | undefined;
}

export interface SupplierProductTransportHeadDto {
  id: string;
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 运输类型标识，【仅，公、铁、水、国际运输】 */
  businessTypeIds: string | undefined;
  /** 运输类型名称 */
  businessTypeNames: string | undefined;
  /** 线路描述,如：成都-重庆 */
  lineDesc: string | undefined;
  /** 联系人 */
  contact: string | undefined;
  /** 联系电话 */
  phone: string | undefined;
  /** 载具情况描述 */
  carrierDesc: string | undefined;
  /** 运输要求 */
  transportRequest: string | undefined;
  /** 货物要求 */
  goodsRequest: string | undefined;
  /** 价格说 */
  priceDesc: string | undefined;
}

export interface SupplierProductWarehouseHeadCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 行政区域Code */
  regionCode: string | undefined;
  /** 行政区域名称 */
  regionName: string | undefined;
  /** 详细地址 */
  address: string | undefined;
  /** 经度 */
  lng: number;
  /** 维度 */
  lat: number;
  /** 仓库类型标识 */
  storageTypeMark: string | undefined;
  /** 仓储类型标识名称 */
  storageTypeName: string | undefined;
  /** 是否特殊仓储 */
  isSpecial: boolean;
  /** 仓库面积（平） */
  area: number;
  /** 仓库高度 */
  height: number;
  /** 价格说明 */
  priceDesc: string | undefined;
  /** 是否有装卸服务 */
  hasLoadService: boolean;
  /** 是否有接取送达服务 */
  hasRdService: boolean;
  /** 是否有管理人员 */
  hasManager: boolean;
  /** 联系人 */
  contact: string | undefined;
  /** 联系电话 */
  phone: string | undefined;
  /** 备注 */
  remark: string | undefined;
}

export interface SupplierProductWarehouseHeadDto {
  id: string;
  /** 是否作废 */
  isScrap: boolean;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 行政区域Code */
  regionCode: string | undefined;
  /** 行政区域名称 */
  regionName: string | undefined;
  /** 详细地址 */
  address: string | undefined;
  /** 经度 */
  lng: number;
  /** 维度 */
  lat: number;
  /** 仓库类型标识 */
  storageTypeMark: string | undefined;
  /** 仓储类型标识名称 */
  storageTypeName: string | undefined;
  /** 是否特殊仓储 */
  isSpecial: boolean;
  /** 仓库面积（平） */
  area: number;
  /** 仓库高度 */
  height: number;
  /** 价格说明 */
  priceDesc: string | undefined;
  /** 是否有装卸服务 */
  hasLoadService: boolean;
  /** 是否有接取送达服务 */
  hasRdService: boolean;
  /** 是否有管理人员 */
  hasManager: boolean;
  /** 联系人 */
  contact: string | undefined;
  /** 联系电话 */
  phone: string | undefined;
  /** 备注 */
  remark: string | undefined;
}

export interface SupplierResourceCargoShipExtendCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 证书信息 */
  licences: SupplierLicenceCreateOrUpdateDto[] | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 船东姓名 */
  shipOwner: string | undefined;
  /** 联系方式 */
  phone: string | undefined;
  /** 船名 */
  shipName: string | undefined;
  /** 船照片 */
  shipPicture: string | undefined;
  /** 船型号 */
  shipType: string | undefined;
  /** 核载吨位 */
  loadWeight: number;
  /** 核定经营范围 */
  businessScope: string | undefined;
  /** 是否已通过审核 */
  isAudit: boolean;
}

export interface SupplierResourceCargoShipExtendDto {
  id: string;
  creationTime: Date;
  creatorId: string | undefined;
  lastModificationTime: Date | undefined;
  lastModifierId: string | undefined;
  isDeleted: boolean;
  deleterId: string | undefined;
  deletionTime: Date | undefined;
  creatorName: string | undefined;
  lastModifierName: string | undefined;
  deleterName: string | undefined;
  isScrap: boolean;
  scraperId: string | undefined;
  scraperName: string | undefined;
  scrapTime: Date | undefined;
  organizationId: string;
  organizationRelationshipId: string;
  organizationCode: string | undefined;
  organizationRelationshipCode: string | undefined;
  organizationName: string | undefined;
  /** 证书信息 */
  licences: SupplierLicenceDto[] | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 船东姓名 */
  shipOwner: string;
  /** 联系方式 */
  phone: string | undefined;
  /** 船名 */
  shipName: string | undefined;
  /** imo 编号 */
  imo: string | undefined;
  /** 船照片 */
  shipPicture: string | undefined;
  /** 船型号 */
  shipType: string | undefined;
  /** 核载吨位 */
  loadWeight: number;
  /** 核定经营范围 */
  businessScope: string | undefined;
  /** 是否已通过审核 */
  isAudit: boolean;
}

export interface SupplierResourceDriverExtendCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 证书信息 */
  licences: SupplierLicenceCreateOrUpdateDto[] | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 司机姓名 */
  driverName: string;
  /** 联系电话 */
  phone: string | undefined;
  sex: number;
  /** 是否通过审核 */
  isAudit: boolean;
}

export interface SupplierResourceDriverExtendDto {
  id: string;
  creationTime: Date;
  creatorId: string | undefined;
  lastModificationTime: Date | undefined;
  lastModifierId: string | undefined;
  isDeleted: boolean;
  deleterId: string | undefined;
  deletionTime: Date | undefined;
  creatorName: string | undefined;
  lastModifierName: string | undefined;
  deleterName: string | undefined;
  isScrap: boolean;
  scraperId: string | undefined;
  scraperName: string | undefined;
  scrapTime: Date | undefined;
  organizationId: string;
  organizationRelationshipId: string;
  organizationCode: string | undefined;
  organizationRelationshipCode: string | undefined;
  organizationName: string | undefined;
  /** 证书信息 */
  licences: SupplierLicenceDto[] | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 司机姓名 */
  driverName: string | undefined;
  /** 联系电话 */
  phone: string | undefined;
  sex: number;
  /** 是否通过审核 */
  isAudit: boolean;
}

export interface SupplierResourceVehicleExtendCreateOrUpdateDto {
  /** 是否作废 */
  isScrap: boolean;
  /** 证书信息 */
  licences: SupplierLicenceCreateOrUpdateDto[] | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 车牌号 */
  vehicleNo: string;
  /** 车长 */
  vehicleLength: number;
  /** 载重 */
  loadWeight: number;
  /** 车辆照片地址 */
  vehiclePicture: string | undefined;
}

export interface SupplierResourceVehicleExtendDto {
  id: string;
  creationTime: Date;
  creatorId: string | undefined;
  lastModificationTime: Date | undefined;
  lastModifierId: string | undefined;
  isDeleted: boolean;
  deleterId: string | undefined;
  deletionTime: Date | undefined;
  creatorName: string | undefined;
  lastModifierName: string | undefined;
  deleterName: string | undefined;
  isScrap: boolean;
  scraperId: string | undefined;
  scraperName: string | undefined;
  scrapTime: Date | undefined;
  organizationId: string;
  organizationRelationshipId: string;
  organizationCode: string | undefined;
  organizationRelationshipCode: string | undefined;
  organizationName: string | undefined;
  /** 证书信息 */
  licences: SupplierLicenceDto[] | undefined;
  /** 供应商主表Id */
  supplierHeadId: string;
  /** 车牌号 */
  vehicleNo: string | undefined;
  /** 车长 */
  vehicleLength: number;
  /** 载重 */
  loadWeight: number;
  /** 车辆照片地址 */
  vehiclePicture: string | undefined;
  /** 是否通过审核 */
  isAudit: boolean;
}

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
  parentCode: string | undefined;
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
  /** 关联主营业务类型 */
  linkBusinessType: string | undefined;
  /** 编辑关联主营业务类型 */
  linkBusinessTypeEdit: string[] | undefined;
  /** 负责人列表 */
  managerList: SupplierTypeManagerCrudDto[] | undefined;
}

export interface SupplierTypeHeadDto {
  baseId: string;
  id: string;
  /** 是否作废 */
  isScrap: boolean;
  /** 父级Id */
  parentCode: string | undefined;
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
  /** 关联主营业务类型 */
  linkBusinessType: string | undefined;
  /** 负责人列表 */
  managerList: SupplierTypeManagerDto[] | undefined;
}

export interface SupplierTypeHeadParam {
  /** 关键字 */
  keywords?: string;
  /** 父级Id */
  parentCode?: string | any;
  /** 供应商性质 */
  supplierType?: number;
  /** 类型名称 */
  name?: string;
  /** 类型标识 */
  mark?: string;
}

export interface SupplierTypeHeadTreeDto {
  id: string;
  parentCode: string | undefined;
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

export interface SupplierOwnerOrgShip {
  supplierId: string;
  supplierName: string;
  ownerOrgRelationShipId: string;
  ownerOrgName: string;
  contributorId: string;
  contributorName: string;
  isScrap: boolean;
  scraperId: any;
  scraperName: any;
  scrapTime: any;
  organizationId: string;
  organizationRelationshipId: string;
  organizationCode: any;
  organizationRelationshipCode: any;
  organizationName: any;
  creatorName: string;
  lastModifierName: any;
  deleterName: any;
  isDeleted: boolean;
  deleterId: any;
  deletionTime: any;
  lastModificationTime: any;
  lastModifierId: any;
  creationTime: string;
  creatorId: string;
  id: string;
}

export interface SupplierHeadAllParamDto {
  sumfield: string | undefined;
  sort: string | undefined;
  page: number;
  limit: number;
  totalRowsCount: number;
  isExport: boolean;
  readonly orderString: string | undefined;
  isAllPage: boolean;
  readonly startIndex: number;
  total: number;
  totalpagecount: number;
  /** 供应商编号,系统自动生成 */
  supplierCode: string | undefined;
  /** 供应商名称 */
  supplierName: string | undefined;
  /** 简称 */
  shortName: string | undefined;
  /** 供应商主营业务分类 */
  enterpriseBusinessType: number;
  /** 供应商来源 */
  sourceSys: number;
  /** 是否已审核 */
  isAudit: boolean;

  keyWords: string;
  /** 性质 */
  supplierNature: number;
  Ids: string[];
}

export type SupplierTagDto = {
  id: string;
  supplierId: string;
  tagType: number;
  tagValue: string;
  isNew?: boolean;
};
export type SupplierTagCrudDto = Partial<Omit<SupplierTagDto, "id">>;
