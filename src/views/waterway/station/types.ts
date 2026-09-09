import { Address, BaseSearchParam, FileAttach } from "@/utils/base-entity";
import CustomEnum from "@/utils/CustomEnum";
import { SupplierTagDto } from "../../supplierV2/types";

/** 港口基础信息 */
export interface waterwayStation {
  /** Id */
  id: string;
  /** 港口名称 */
  portName: string;
  /** 港口分类名称  */
  portType: string;
  /** 港区名称  */
  portAreaName: string;
  /** 省，市，区 */
  portAddress: string;
  /** 坐标 */
  portCoord: string;
  /** 详细地址 */
  address: string;
  /** 备注 */
  portSpecification: string;
  /** 归属区域id */
  areaId: string;
  /** 归属区域 */
  areaName: string;
  /** 区域负责人id */
  areaUserId: string;
  /** 区域负责人 */
  areaUserName: string;
  /** 区域负责人电话 */
  areaUserTel: string;
  /** 更新机构信息 */
  updateOrganizationName: string;
  /** 浏览次数 */
  viewCount: boolean;
  /** 备注 */
  remark: boolean;
}
/** 港口列表展示信息 */
export interface WaterwayStationDto {
  _id: string;
  Id: string;
  PortType: string;
  PortName: string;
  PortAreaName: string;
  PortAddress: string;
  PortCoord: string;
  PortScale: string;
  Address: string;
  PortSpecification: string;
  AreaId: string;
  AreaName: string;
  AreaUserId: string;
  AreaUserName: string;
  AreaUserTel: string;
  UpdateOrganizationName: string;
  ViewCount: number;
  Remark: string;
}
/** 港口列表查询信息 */
export interface WaterwayQueryDto { 
  page: number;
  pageSize: number;
  portType?: string;
  portScale?: string;
  portName?: string;
  portAreaName?: string;
  address?: string;
  deptName?: string;
  cityName?: string;
  portSpecification?: string;
  areaId?: string;
  areaName?: string;
  areaUserName?: string;
  updateOrganizationName?: string;
}
export interface LineQueryDto {
  page: number;
  pageSize: number;
  routeName?: string;
  startPortName?: string;
  endPortName?: string;
}
/** 港口通过能力值信息 */
export interface WaterPortTrafficability { 
  waterPortInfoId: string;
  type: string;
  numerical?: number;
}
/** 货场信息 */
export interface WaterwayGoodsYard {
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

/** 明细字段显示类型 */
export interface WaterwayDetailsFieldType {
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
export interface waterwayStationContacts {
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
}
/** 停限公告 */
export interface waterwayStopNotice {
  id: string;
  /** 站点Id*/
  stationId: string;
  /** 站点名称*/
  stationName: string;
  /** 停限路局*/
  waterwayBureau: string;
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
}
/** 专用线信息 */
export interface WaterwayPrivatelLine {
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
export interface waterwaySupplerExDto {
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
  supplier: ViewwaterwaySupplier;
}
/** 铁路供应商扩展信息 */
export interface waterwaySupplerExCrudDto {
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
export interface ViewwaterwaySupplier {
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
  isChinawaterway: boolean;
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
export interface waterwayGoodPricePolicy {
  /** 优价下浮批准号 */
  xfkey: string;
  /** 发局 */
  SendwaterwayBureau: string;
  /** 发站范围 */
  xffzfwMark: string;
  /** 到局 */
  ArrivalwaterwayBureau: string;
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
  ExtendList?: waterwayGoodPricePolicyEx[];
}

/** 优价扩展 */
export interface waterwayGoodPricePolicyEx {
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
export interface DetailswaterwayStationResult {
  station: waterwayStation;
  yard: WaterwayGoodsYard;
  contactList?: waterwayStationContacts[];
  stopList?: waterwayStopNotice[];
  zyxList?: WaterwayPrivatelLine[];
  supplier?: waterwaySupplerExDto[];
  /** 驻站人员 */
  stationaryUsers?: waterwayStationaryUser[];
  goodPricePolicy?: waterwayGoodPricePolicy[];
}

/** 地图查询范围结果 */
export interface MapwaterwayStationResult {
  station: waterwayStation;
  yard: WaterwayGoodsYard;
  zyxList?: WaterwayPrivatelLine[];
}

export interface waterwayStationSupplierParam extends BaseSearchParam {
  stationId: string;
  keyword?: string;
  supplierName?: string;
}

/** 站点基础信息修改实体 */
export interface waterwayStationCrudDto {
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
  /** 车站性质，国铁/合资 */
  stationNature: number;
  stationaryUsers: waterwayStationaryUser[];
}
export interface waterwayStationaryUser {
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
export type waterwayStationContactsCrudDto = Partial<waterwayStationContacts>;

/** 停限信息，新增实体 */
export type waterwayStopNoticeCrudDto = Partial<waterwayStopNotice>;

/** 专用线修改内容实体 */
export type waterwayPrivatelLineCrudDto = {
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

export type StationMarkType = {
  marker: BMapGL.Marker;
  label: BMapGL.Label;
  infoWindow: BMapGL.InfoWindow;
  data: MapwaterwayStationResult;
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
  list: MapwaterwayStationResult[];
  privateIndex: number;
  mpinit: boolean;
  isSearch: boolean;
  stationMarker: StationMarkType[];
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
  nearList: WaterwayStationDto[];
  nearLoading: boolean;
  locating: boolean;
  isReallySearch: boolean;
  nearText: string;
  portCoord: string;
};

export interface waterwayStationHighwayDispatch {
  yestodayDispatchList: waterwayStationHighwayDispatchItem[];
  weekData: string;
  monthData: string;
}
/** 站点接取送达记录 */
export interface waterwayStationHighwayDispatchItem {
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
  Chinawaterway: { id: 1, label: "国铁站" },
  JointCapital: { id: 2, label: "合资站" }
});

export interface NearLocationPointParam {
  latitude?: number;
  longitude?: number;
  provinceCode?: string;
  provinceName?: string;
  stationId?: string;
  stationName?: string;
}
export const supplierColumn = [
  {
    name: "supplierName",
    label: "供应商名称",
    align: "center"
  },
  {
    name: "supplierNatureName",
    label: "类型",
    width: "200px",
    align: "center"
  },
  {
    name: "supplierTypeName",
    label: "供应商分类",
    width: "200px",
    align: "center"
  }
  // {
  //   name: "partnerPhone",
  //   label: "联系电话",
  //   width: "140px",
  //   align: "center"
  // },
  // {
  //   name: "placeRegionName",
  //   label: "所在区域",
  //   width: "180px",
  //   align: "center"
  // },
  // {
  //   name: "address",
  //   label: "详细地址",
  //   width: "200px",
  //   align: "center"
  // }
];

// 作业区
export interface WaterZoneItem {
  waterPortInfoId: string;
  workZoneName: string;
  address: string;
  coord: string;
  specification: string;
  isScrap: boolean;
  id: string;
};

// 码头
export interface WaterWharfItem {
  waterPortInfoId: string;
  wharfName: string;
  wharfType: string;
  address: string;
  coord: string;
  specification: string;
  freeDays: number;
  berths: number;
  maxBerthT: number;
  isScrap: boolean;
  id: string;
};
