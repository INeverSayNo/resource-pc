import { Address, BaseSearchParam, FileAttach } from "@/utils/base-entity";
import CustomEnum from "@/utils/CustomEnum";
import { SupplierTagDto } from "../../supplierV2/types";

/** 车站基础信息 */
export interface RailWayStation {
  /** Id */
  id: string;
  /** 车站别名 */
  railwayStationAliasName: string;
  /** 车站名称 */
  railwayStationName: string;
  /** 站点编码  */
  railwayStationCode: string;
  /** 车站编码  */
  railwayStationDbm: string;
  /** 营业厅地址 */
  address: string;
  /** 办理限制条件 */
  businessLimit: string;
  /** 联系电话 */
  contacterPhone: string;
  /** 省份名称 */
  provinceName: string;
  /** 城市名称 */
  cityName: string;
  /** 区县名称 */
  districtName: string;
  /** 路局编码 */
  railwayBureauCode: string;
  /** 路局名称 */
  railwayBureauName: string;
  /** 车务段 */
  railwayTrainCode: string;
  /** 车务段名称 */
  railwayTrainName: string;
  /** 是否货运站 */
  isHyStation: boolean;
  /** 是否高铁 */
  isCrhExpress: boolean;
  /** 是否行包快运 */
  isHbExpress: boolean;
  /** 线路 */
  railwayLine: string;
  /** 业务范围 */
  scopeOfBusiness: string;
  /** 车站等级 */
  stationGrade: string;
  /** 铁路站点坐标 */
  railwayLocation: string;
  /** 阅读次数 */
  readNum: number;
  /** 地址解析 */
  AddressFormat: Address | undefined;
  /** 用于前端站点地图使用 */
  IsAddMark?: boolean;
  /** 区域公司*/
  areaCompany: string;
  /** 区域公司名称*/
  areaCompanyName: string;
  /** 负责人*/
  principalId: string;
  /** 负责人姓名*/
  principalName: string;
  /** 负责人电话*/
  principalPhone: string;
  /** 图片数量 */
  pictureNum: number;
  /** 是否与车站签订发运协议*/
  isAgreement: boolean;
  /** 签订协议公司Id*/
  agreementCompany: string;
  /** 签订协议公司名称*/
  agreementCompanyName: string;
  /** 是否是否有可代理发运的物流供应商*/
  hasProxySupplier: boolean;
  /** 代理供应商Id*/
  proxySupplierId: string;
  /** 代理供应商名称*/
  proxySupplierName: string;
  /** 是否优势站点*/
  isAdvantage: boolean;
  /** 优势描述*/
  advantageRemark: string;
  /** 是否有驻站人员*/
  isStationary: boolean;
  /** 是否重要站点 */
  isImportant: boolean;
  /** 资料完善度 */
  rate: number;
  tags?: Array<string>;
  /** 站点分级 */
  stationLevelMark: string;
  stationLevelName: string;
  levelSign: string;
  levelExHanding: string;
  levelHasStationary: string;
  levelHasSupplier: string;
  levelHasWarehouse: string;
  levelHasLoader: string;
  /** 站点性质 */
  stationNature: number;
  stationNatureName: string;
  // 所属物流中心
  logisticCenterId: string | null;
  logisticCenterName: string | null;
  natureTypes: string;
  natureTypesFormat: Array<Record<"code" | "name", string>> | null;
  serviceTypes: string;
  serviceFormat: Array<Record<"code" | "name", string>> | null;
  transactTypes: string;
  transactFormat: Array<Record<"code" | "name", string>> | null;
  introduction: string;
  lastModificationTime?: string;
  lastModifierName?: string;
  creationTime: string;
  creatorName: string;
  hasPricePolicy: boolean
  stationBusinessLimit: string | null
}
/** 车站列表展示信息 */
export interface RailwayStationDto {
  id: string;
  railwayStationCode: string;
  railwayStationDbm: string;
  railwayStationName: string;
  businessLimit: string;
  isImportant: boolean;
  rate: number;
  stationGrade: string;
  areaCompany: string;
  areaCompanyName: string;
  principalId: string;
  principalName: string;
  principalPhone: string;
  stationaryUserNames?: Array<string>;
  yardBusinessLmit: null;
  hasPricePolicy: boolean;
  hasPrivateLine: boolean;
  tags: Array<string>;
  railwayBureauCode: string;
  railwayBureauName: string;
  railwayTrainCode: string;
  railwayTrainName: string;
  provinceName: string;
  cityName: string;
  districtName: string;
  /** 是否货运站 */
  isHyStation: boolean;
  /** 是否高铁 */
  isCrhExpress: boolean;
  /** 是否行包快运 */
  isHbExpress: boolean;
  /** 站点分级 */
  stationLevelMark: string;
  stationLevelName: string;
  levelSign: string;
  levelExHanding: string;
  levelHasStationary: string;
  levelHasSupplier: string;
  levelHasWarehouse: string;
  levelHasLoader: string;
  /** 站点性质 */
  stationNature: number;
  stationNatureName: string;
  /** 业务范围 */
  scopeOfBusiness: string;
  distance: number;
  cmsNoReadNum: number;
  cmsNum: number;
  cmsReadNum: number;
}
/** 货场信息 */
export interface RailWayGoodsYard {
  id: string;
  /** 站点Id*/
  stationId: string;
  /** 最大起重能力*/
  maxLiftingCapacity: number;
  /** 叉车起重能力*/
  forkliftLC: number;
  /** 20尺集装箱起重能力*/
  container20LC: number;
  /** 40尺集装箱起重能力*/
  container40LC: number;
  /** 办理范围*/
  handleScope: YardHandleScope;
  /** 集装箱发送办理范围*/
  containerSendHS: string;
  /** 集装箱到达办理范围*/
  containerArriveHS: string;
  /** 集装箱货物混装*/
  containerMixedLoading: boolean;
  /** 危险品*/
  danger: Array<DangerScope>;
  /** 收费标准 */
  yardChargeItem: YardChargeItem[];
  /** 贡献人 */
  contributor: string;
  /** 贡献时间 */
  contributionaTime: string;
}
/** 货场收费标准 */
export interface YardChargeItem {
  _gId: string;
  /** 类型 */
  chargeType: string;
  /** 免费时间 */
  freeTime?: number;
  /** 免费时间单位 */
  freeTimeUnit: string;
  /** 超期费用 */
  overdueFee?: number;
  /** 超期费用单位 */
  overdueFeeUnit: string;
  /** 收费说明 */
  chargeRemark: string;
}
/** 货场办理范围 */
export interface YardHandleScope {
  /** 办理范围 */
  scope: string;
  /** 零散 */
  lshw: boolean;
  /** 批量散货 */
  pllshw: boolean;
  /** 超限 */
  cx: boolean;
  /** 超重 */
  cz: boolean;
  /** 货物混装 */
  hwhz: boolean;
}

/** 港口基础信息 */
export interface PortStation {
  /** Id */
  id: string;
  /** 港口分级 */
  portScale: string;
  /** 港口分类名称  */
  portType: string;
  /** 港口名称  */
  portName: string;
  /** 港区名称 */
  portAreaName: string;
  /** 省，市，区 */
  portAddress: string;
  /** 坐标lat/lng */
  portCoord: string;
  /** 详细地址 */
  address: Address | undefined;
  /** 地址坐标Json */
  addressCode: string;
  /** 备注 */
  portSpecification: string;
  /** 归属区域id */
  areaId: string;
  /** 归属区域名称 */
  areaName: string;
  /** 区域负责人id */
  areaUserId: string;
  /** 区域负责人 */
  areaUserName: string;
  /** 区域负责人电话 */
  areaUserTel: string;
  /** 标签多个逗号分隔 */
  tags: boolean;
  /** 备注 */
  remark: boolean;
  /** 阅读次数 */
  viewCount: number;
}
/** 港口列表展示信息 */
export interface WaterPortStationDto {
  /** Id */
  _id: string;
  /** 港口分级 */
  portScale: string;
  /** 港口分类名称  */
  portType: string;
  /** 港口名称  */
  portName: string;
  /** 港区名称 */
  portAreaName: string;
  /** 省，市，区 */
  portAddress: string;
  /** 坐标lat/lng */
  portCoord: string;
  /** 详细地址 */
  address: Address | undefined;
  /** 地址坐标Json */
  addressCode: string;
  /** 备注 */
  portSpecification: string;
  /** 归属区域id */
  areaId: string;
  /** 归属区域名称 */
  areaName: string;
  /** 区域负责人id */
  areaUserId: string;
  /** 区域负责人 */
  areaUserName: string;
  /** 区域负责人电话 */
  areaUserTel: string;
  /** 标签多个逗号分隔 */
  tags: boolean;
  /** 备注 */
  remark: boolean;
  /** 阅读次数 */
  viewCount: number;
  distance: number;
}

/** 明细字段显示类型 */
export interface RailwayDetailsFieldType {
  label: string;
  value: string;
  colspan?: number;
  class?: string;
  isMore?: boolean; // 是否更多
  isClip?: boolean; // 是否剪切板
  [key: string]: any;
  children?: RailwatDetailsItemType[];
}

/** 明细项显示类型 */
export interface RailwatDetailsItemType {
  value: string;
  class?: string;
  [key: string]: any;
}

/** 危险品办理范围 */
export interface DangerScope {
  /** 到达货物*/
  ddInfo: string;
  /** 发送货物*/
  fsInfo: string;
  /** 类型*/
  type: string;
  /** 前端编辑的Id */
  _gId?: string;
}
/** 站点联系人信息 */
export interface RailWayStationContacts {
  id: string;
  /** 站点Id */
  stationId: string;
  /** 服务类别 */
  serviceType: string;
  /** 联系人 */
  contacts: string;
  /** 手机号 */
  phone: string;
  /** 座机号 */
  telePhone: string;
  /** 服务时间 */
  serviceTime: string;
  /** 是否有效 */
  isValid: boolean;
  /** 验证时间 */
  validDate: string;
  /** 备注 */
  remark: string;
  /** 贡献人 */
  contributor: string;
  /** 贡献时间 */
  contributionaTime: string;
}
/** 停限公告 */
export interface RailWayStopNotice {
  id: string;
  /** 站点Id*/
  stationId: string;
  /** 站点名称*/
  stationName: string;
  /** 停限路局*/
  railwayBureau: string;
  /** 限停地点*/
  stopAddr: string;
  /** 起始时间*/
  startDt: string;
  /** 终止时间*/
  endDt: string;
  /** 限停内容*/
  content: string;
  /** 限停原因*/
  reason: string;
  /** 停限品类*/
  stopGoodsType: string;
  /** 发布时间*/
  releaseDt: string;
  /** 专用线Id*/
  privateLineId: string;
  /** 铁路系统通知Id*/
  noticeId: number;
  /** 贡献人 */
  contributor: string;
  /** 贡献时间 */
  contributionaTime: string;
  /*受限发局 */
  restrictedDepartureBureau: string;
  /*受限发站 */
  restrictedDepartureStation: string;
}
/** 专用线信息 */
export interface RailWayPrivatelLine {
  id: string;
  /** 站点Id*/
  stationId: string;
  /** 站点名称*/
  stationName: string;
  /** 专用线名称*/
  name: string;
  /** 专用线代码*/
  num: string;
  /** 取送车里程(米)*/
  transferMileage: number;
  /** 属性*/
  lineProperty: string;
  /** 类别*/
  lineType: string;
  /** 所属单位*/
  ownerUnit: string;
  /** 产权单位*/
  rightUnit: string;
  /** 共有单位*/
  shareUnit: string;
  /** 共有单位列表*/
  shareUnitList: string;
  /** 联系人*/
  contacts: string;
  /** 联系电话*/
  phone: string;
  /** 达到品类*/
  arriveCategory: string;
  /** 发送品类*/
  sendCategory: string;
  /** 超限*/
  overrun: boolean;
  /** 超重*/
  overweight: boolean;
  /** 集装箱发送办理范围*/
  containerSendHS: string;
  /** 集装箱到达办理范围*/
  containerArriveHS: string;
  /** 集装箱混装*/
  containerMixedLoading: boolean;
  /** 最大起重能力*/
  maxLiftingCapacity: number;
  /** 叉车起重能力*/
  forkliftLC: number;
  /** 20尺集装箱起重能力*/
  container20LC: number;
  /** 40尺集装箱起重能力*/
  container40LC: number;
  /** 危险品发送灌装*/
  dangerSendFilling: string;
  /** 危险品发送非灌装*/
  dangerSendNotFilling: string;
  /** 危险品发送集装箱*/
  dangerSendContainer: string;
  /** 危险品到达灌装*/
  dangerArriveFilling: string;
  /** 危险品到达非灌装*/
  dangerArriveNotFilling: string;
  /** 危险品到达集装箱*/
  dangerArriveContainer: string;
  /** 收费说明*/
  chargeRemark: string;
  /** 专用线地址 */
  address: string;
  /** 地址格式化 */
  addressFormat?: Address;
  /** 是否与专用线签订共用协议 */
  isAgreement: boolean;
  /** 附件 */
  fileAttach?: FileAttach[];
}

/** 铁路供应商扩展信息 */
export interface RailWaySupplerExDto {
  id: string;
  /** 供应商Id*/
  supplerId: string;
  /** 关联车站Id*/
  stationId: string;
  /** 承接业务【多选】*/
  underTakingBus: string;
  /** 承接业务名称*/
  underTakingBusName: string;
  /** 其他业务*/
  otherBusiness: string;
  /** 成本价说明*/
  costDescription: string;
  /** 供应商基础信息 */
  supplier: ViewRailwaySupplier;
}
/** 铁路供应商扩展信息 */
export interface RailWaySupplerExCrudDto {
  /** 供应商Id*/
  supplerId?: string;
  /** 关联车站Id*/
  stationId?: string;
  /** 承接业务【多选】*/
  underTakingBus?: string;
  /** 承接业务名称*/
  underTakingBusName?: string;
  /** 其他业务*/
  otherBusiness?: string;
  /** 成本价说明*/
  costDescription?: string;
  /** 供应商名称 */
  supplierName?: string;
  /** 车站名称*/
  stationName?: string;
}

/** 铁路供应商视图 */
export interface ViewRailwaySupplier {
  id: string;
  /** 供应商名称*/
  supplierName: string;
  /** 简称*/
  shortName: string;
  /** 供应商编号,系统自动生成*/
  supplierCode: string;
  /** 供应商性质*/
  supplierNature: number;
  supplierNatureName: string;
  /** 联系人*/
  contact: string;
  /** 联系电话*/
  contactPhone: string;
  /** 合作次数 */
  cooperationNum: number;
  /** 是否合同供应商 */
  isContract: boolean;
  /** 是否中铁供应商 */
  isChinaRailway: boolean;
  /** 成本均价 */
  costPrice: number;
  /** 成本均价单位 */
  costPriceUnit: string;
  /** 是否审核 */
  isAudit: boolean;
  /** 贡献者 */
  contributorId: string;
  /** 贡献者姓名 */
  contributorName: string;
  /** 贡献者电话 */
  contributorPhone: string;
  /** 自定义标签 */
  customTags: SupplierTagDto[];
}

/** 优价政策 */
export interface RailwayGoodPricePolicy {
  /** 优价下浮批准号 */
  xfkey: string;
  /** 发局 */
  SendRailwayBureau: string;
  /** 发站范围 */
  xffzfwMark: string;
  /** 到局 */
  ArrivalRailwayBureau: string;
  /** 到站范围 */
  xfdzfwMark: string;
  /** 品类品名 */
  xfpmplMark: string;
  /** 发货人 */
  xffhrhz: string;
  /** 混装品名 */
  xfhzpmpl: string;
  /** 价号 */
  xfjh: string;
  /** 运输范围 */
  xfysfw: string;
  /** 票种 */
  xfpz: string;
  /** 局界口 */
  xfjjk: string;
  /** 下浮比例 */
  xfpzwdhz1: string;
  /** 下浮内容一档 */
  xfnr1: string;
  /** 下浮内容一档说明 */
  xfnr1Mark: string;
  /** 起始日期 */
  xfqsrq: string;
  /** 终止日期 */
  xfzzrq: string;
  /** 车型 */
  xfszcx: null;
  /** 箱型 */
  xfszxx: string;
  /** 班列车次 */
  xfblcc: string;
  /** 总里程 */
  xfzlc: string;
  /** 特殊箱型编码 */
  xftsxxbm: string;
  /** 特种箱标记 */
  xftzxbj: string;
  /** 原下浮项目号 */
  xfyxfkey: string;
  Id: string;
  /** 确定是否有保量 */
  IsRequiredTV?: string;
  /** 保量要求 */
  TvRemark?: string;
  /** 项目负责人 */
  ProjectPrincipal?: string;
  ExtendList?: RailwayGoodPricePolicyEx[];
  /** 贡献人 */
  contributor: string;
  /** 贡献时间 */
  contributionaTime: string;
}

/** 优价扩展 */
export interface RailwayGoodPricePolicyEx {
  _gid?: string;
  id?: string;
  /** 优价Id */
  policyId?: string;
  /** 优价下浮批准号 */
  xfkey?: string;
  /** 保量要求 */
  quantityRequire?: number;
  /** 保量值 */
  quantity?: number;
  /** 价差系数 */
  diffCoefficient?: number;
  /** 指定发货人  */
  sender?: string;
  /** 通道成本 */
  cost?: number;
  /** 保量值单位 */
  quantityUnit?: string;
  /** 优惠价格 */
  discountsPrice?: number;
  /** 优惠价单位 */
  discountsUnit?: string;
}

/** 站点详情返回结果 */
export interface DetailsRailWayStationResult {
  station: RailWayStation;
  yard: RailWayGoodsYard;
  contactList?: RailWayStationContacts[];
  stopList?: RailWayStopNotice[];
  zyxList?: RailWayPrivatelLine[];
  supplier?: RailWaySupplerExDto[];
  /** 驻站人员 */
  stationaryUsers?: RailwayStationaryUser[];
  goodPricePolicy?: RailwayGoodPricePolicy[];
}

/** 地图查询范围结果 */
export interface MapRailWayStationResult {
  station: RailWayStation;
  yard: RailWayGoodsYard;
  zyxList?: RailWayPrivatelLine[];
}

/** 港口地图查询范围结果 */
export interface MapPortStationResult {
  station: PortStation;
  yard: {};
  zyxList?: [];
  contact?: [];
}

export interface RailwayStationSupplierParam extends BaseSearchParam {
  stationId: string;
  keyword?: string;
  supplierName?: string;
}

/** 站点基础信息修改实体 */
export interface RailwayStationCrudDto {
  /** 营业厅地址 */
  address: string;
  /** 业务范围 */
  scopeOfBusiness: string;
  /** 车站等级 */
  stationGrade: string;
  /** 是否货运站 */
  isHyStation: boolean;
  /** 地址解析 */
  AddressFormat: Address | undefined;
  /** 区域公司*/
  areaCompany: any;
  /** 区域公司名称*/
  areaCompanyName: string;
  /** 负责人*/
  principalId: any;
  /** 负责人姓名*/
  principalName: string;
  /** 负责人电话*/
  principalPhone: string;
  /** 是否与车站签订发运协议*/
  isAgreement: boolean;
  /** 签订协议公司Id*/
  agreementCompany: string;
  /** 签订协议公司名称*/
  agreementCompanyName: string;
  /** 是否是否有可代理发运的物流供应商*/
  hasProxySupplier: boolean;
  /** 代理供应商Id*/
  proxySupplierId: string;
  /** 代理供应商名称*/
  proxySupplierName: string;
  /** 是否优势站点*/
  isAdvantage: boolean;
  /** 优势描述*/
  advantageRemark: string;
  /** 是否有驻站人员*/
  isStationary: boolean;
  /** 是否重要站点 */
  isImportant: boolean;
  /** 站点别名 */
  railwayStationAliasName: string;
  /** 车站性质，国铁/合资 */
  stationNature: number;
  /** 贡献人 */
  contributor: string;
  /** 贡献时间 */
  contributionaTime: string;
  stationaryUsers: RailwayStationaryUser[];
  logisticCenterId: string | null;
  logisticCenterName: string | null;
  natureTypes: Array<Record<"code" | "name", string>> | null;
  serviceTypes: Array<Record<"code" | "name", string>> | null;
  transactTypes: Array<Record<"code" | "name", string>> | null;
}
export interface RailwayStationaryUser {
  id: string;
  _id: string;
  /** 车站Id*/
  stationId: string;
  /** 驻站人员Id*/
  userId: string;
  /** 驻站人员姓名*/
  userName: string;
  /** 驻站人员电话*/
  phone: string;
  creatorName: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime?: string;
  lastModifierId?: string;
  lastModifierName?: string;
}
/** 联系人信息操作实体 */
export type RailWayStationContactsCrudDto = Partial<RailWayStationContacts>;

/** 停限信息，新增实体 */
export type RailWayStopNoticeCrudDto = Partial<RailWayStopNotice>;

/** 专用线修改内容实体 */
export type RailWayPrivatelLineCrudDto = {
  /** 专用线名称 */
  name?: string;
  /** 专用线代码  */
  num?: string;
  /** 取送车里程(米) */
  transferMileage?: number;
  /** 联系人*/
  contacts?: string;
  /** 联系电话*/
  phone?: string;
  /** 收费说明*/
  chargeRemark?: string;
  /** 地址 */
  address?: string;
  /** 地址对象 */
  addressFormat?: Address;
  /** 是否与专用线签订共用协议 */
  isAgreement?: boolean;
  /** 属性/企业 */
  lineProperty?: string;
  /** 类别 */
  lineType?: string;
  /** 所属单位  */
  ownerUnit?: string;
  /** 产权单位  */
  rightUnit?: string;
  /** 共有单位  */
  shareUnit?: string;
  /** 达到品类  */
  arriveCategory?: string;
  /** 发送品类  */
  sendCategory?: string;
  /** 超限  */
  overrun?: boolean;
  /** 超重  */
  overweight?: boolean;
  /** 集装箱发送办理范围  */
  containerSendHS?: string;
  /** 集装箱到达办理范围  */
  containerArriveHS?: string;
  /** 集装箱混装  */
  containerMixedLoading?: boolean;
  /** 最大起重能力  */
  maxLiftingCapacity?: number;
  /** 叉车起重能力  */
  forkliftLC?: number;
  /** 20尺集装箱起重能力  */
  container20LC?: number;
  /** 40尺集装箱起重能力  */
  container40LC?: number;
  /** 危险品发送灌装  */
  dangerSendFilling?: string;
  /** 危险品发送非灌装  */
  dangerSendNotFilling?: string;
  /** 危险品发送集装箱  */
  dangerSendContainer?: string;
  /** 危险品到达灌装  */
  dangerArriveFilling?: string;
  /** 危险品到达非灌装  */
  dangerArriveNotFilling?: string;
  /** 危险品到达集装箱  */
  dangerArriveContainer?: string;
  /** 附件 */
  fileAttach?: FileAttach[];
  /** 贡献人 */
  contributor?: string;
  /** 贡献时间 */
  contributionaTime?: string;
};

export const MapLocationType = {
  /** WGS84坐标,GPS标准坐标 */
  COORDINATES_WGS84: 1,
  /** WGS84的平面墨卡托坐标,搜狗地图坐标 */
  COORDINATES_WGS84_MC: 2,
  /** GCJ02坐标，即高德地图、腾讯地图和MapABC等地图使用的坐标； */
  COORDINATES_GCJ02: 3,
  /** GCJ02的平面墨卡托坐标 */
  COORDINATES_GCJ02_MC: 4,
  /** 百度bd09经纬度坐标 */
  COORDINATES_BD09: 5,
  /** 百度bd09墨卡托坐标 */
  COORDINATES_BD09_MC: 6,
  /** mapbar地图坐标，图吧地图坐标 */
  COORDINATES_MAPBAR: 7,
  /** 51地图坐标 */
  COORDINATES_51: 8
};

export interface RailwayStationParam {
  page: number;
  pageSize: number;
  /** 路局编码*/
  railwayBureauCode?: string;
  /** 车务段*/
  railwayTrainCode?: string;
  /** 站点名称*/
  railwayStationName?: string;
  /** 站点编码 tmism*/
  railwayStationCode?: string;
  /** 站点代码*/
  railwayStationDbm?: string;
  /** 省*/
  provinceName?: string;
  /** 市*/
  cityName?: string;
  /** 是否货运*/
  isHyStation?: boolean;
  /** 是否高铁快运*/
  isCrhExpress?: boolean;
  /** 是否行包快运*/
  isHbExpress?: boolean;
  /** 是否与车站签订发运协议*/
  isAgreement?: boolean | string;
  /** 是否优势站点*/
  isAdvantage?: boolean;
  /** 是否有驻站人员*/
  isStationary?: boolean | string;
  /** 区域公司 */
  areaCompanyId?: string;
  /** 集装箱办理*/
  isContainer?: boolean;
  /** 危险品办理 */
  isDanger?: boolean;
  /** 是否重要站点 */
  isImportant?: boolean;
  /** 站点属性 */
  stationProp?: string;
  /** 办理类型 */
  transactType?: string;
  /** 专用线名称 */
  privatelineName?: string;
  /** 站点等级 */
  railwayStationGrade?: string;
}

export type StationMarkType = {
  marker: BMapGL.Marker;
  label: BMapGL.Label;
  infoWindow: BMapGL.InfoWindow;
  data: MapRailWayStationResult;
};
export type PortMarkType = {
  marker: BMapGL.Marker;
  label: BMapGL.Label;
  infoWindow: BMapGL.InfoWindow;
  data: MapPortStationResult;
};

export type mapRouteHistoryPoint = {
  name: string;
  point: BMapGL.Point;
  marker?: BMapGL.Marker;
  icon?: BMapGL.Icon;
};

export type mapStateProp = {
  height: number;
  mapUri: string;
  bmap: BMapGL.Map | undefined;
  mapLoading: boolean;
  stationName: string;
  list: MapRailWayStationResult[];
  portList: MapPortStationResult[];
  privateIndex: number;
  mpinit: boolean;
  isSearch: boolean;
  stationMarker: StationMarkType[];
  PortMarker: PortMarkType[];
  privateLineMarkers: any[];
  currentStationCity: string;
  searchType: "stationName" | "address";
  useDefineStyle: boolean;
  startPoint?: mapRouteHistoryPoint;
  endPoint?: mapRouteHistoryPoint;
  mapRouteOverlays: {
    polyLine?: BMapGL.Polyline;
    start?: BMapGL.Marker;
    end?: BMapGL.Marker;
  };
  mapRouteDescription?: string;
  routeAddress?: string;
  mapAutoLoading: boolean;
  mapAutoCompleteInput?: BMapGL.Autocomplete;
  mapAutoCompleteResult: { value: string }[];
  showNearList: boolean;
  nearList: RailwayStationDto[];
  portNearList: WaterPortStationDto[];
  nearLoading: boolean;
  locating: boolean;
  isReallySearch: boolean;
  nearText: string;
  portName: string;
  activeName: "railway" | "water";
  province: string;
};

export interface RailwayStationHighwayDispatch {
  yestodayDispatchList: RailWayStationHighwayDispatchItem[];
  weekData: string;
  monthData: string;
}
/** 站点接取送达记录 */
export interface RailWayStationHighwayDispatchItem {
  /** 调度单号*/
  DispatchNum: string;
  /** 站点名称*/
  stationName: string;
  /** 供应商erpid*/
  SupplierErpId: string;
  /** 供应商名称*/
  SupplierErpName: string;
  /** 调度时间*/
  DispatchDate: string;
  /** 接取/送达地址*/
  ArrivalAddress: string;
  /** 货物名*/
  GoodsName: string;
  /** 车牌号*/
  CarNum: string;
  /** 承运吨位*/
  Weight: number;
}

/** 站点性质 */
export const StationNature = CustomEnum({
  None: { id: 0, label: "未设置" },
  ChinaRailway: { id: 1, label: "国铁站" },
  JointCapital: { id: 2, label: "合资站" }
});

/** 站点类型 */
export const StationNatureTypes = CustomEnum({
  Load: { id: 0, label: "装车站", code: "load" },
  UnLoad: { id: 1, label: "卸车站", code: "unload" },
  LoadUnLoad: { id: 2, label: "装卸站", code: "loadunload" }
});
/** 站点办理种类 */
export const StationTransactTypes = CustomEnum({
  Synthesis: { id: 0, label: "综合性货运站", code: "synthesis" },
  Profession: { id: 1, label: "专业性货运站", code: "profession" }
});
/** 站点服务对象 */
export const StationServiceTypes = CustomEnum({
  Reload: { id: 0, label: "换装站", code: "reload" },
  Industry: { id: 1, label: "工业站", code: "industry" },
  Harbor: { id: 2, label: "港湾站", code: "harbor" },
  PublicFreight: { id: 3, label: "公共货运", code: "publicFreight" }
});

export interface NearLocationPointParam {
  latitude?: number;
  longitude?: number;
  provinceCode?: string;
  provinceName?: string;
  stationId?: string;
  stationName?: string;
}

export interface RailwayPolicyItemNew {
  policyExs: null | RailwayGoodPricePolicyEx[];
  direction: string;
  isExpiration: boolean;
  id: string;
  policyId: string;
  xfkey: string;
  xfyxkey: string;
  province: {
    code: string;
    name: string;
    children: { code: string; name: string; children: null }[];
  }[];
  excludeProvince: {
    code: string;
    name: string;
    children: { code: string; name: string; children: null }[];
  }[];
  bureau: {
    code: string;
    name: string;
    children: { code: string; name: string; children: null }[];
  }[];
  excludeBureau: {
    code: string;
    name: string;
    children: { code: string; name: string; children: null }[];
  }[];
  station: { code: string; name: string; children: object }[];
  excludeStation: { code: string; name: string; children: object }[];
  arrivalProvince: {
    code: string;
    name: string;
    children: { code: string; name: string; children: null }[];
  }[];
  arrivalExcludeProvince: {
    code: string;
    name: string;
    children: { code: string; name: string; children: null }[];
  }[];
  arrivalBureau: {
    code: string;
    name: string;
    children: { code: string; name: string; children: null }[];
  }[];
  arrivalExcludeBureau: {
    code: string;
    name: string;
    children: { code: string; name: string; children: null }[];
  }[];
  arrivalStation: { code: string; name: string; children: object }[];
  arrivalExcludeStation: { code: string; name: string; children: object }[];
  goods: { code: string; name: string; children: object }[];
  excludeGoods: undefined[];
  isUsed: boolean;
  unitName: string;
  policyType: string;
  coefficient: number;
  trainType: string;
  containerType: object;
  containerTypes: object;
  containerTypesName: object;
  containerTypeMark: object;
  sender: null | string;
  ticketType: string;
  scope: string;
  startDate: string;
  endDate: string;
  agreementFile: object;
  agrCoefficient: number;
  remark: object;
  railwayNatureType: number;
  creationTime: object;
}
