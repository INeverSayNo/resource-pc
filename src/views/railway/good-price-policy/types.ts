import { BaseSearchParam } from "@/utils/base-entity";
import CustomEnum from "@/utils/CustomEnum";
import { RailwayGoodPricePolicyEx } from "../station/types";

// #region 优价记录查询
/** 优价查询参数 */
interface PricePolicyQueryParam extends BaseSearchParam {
  /** 发省 */
  province?: string;
  /** 发局code */
  bureau?: string;
  /** 发站名 */
  station?: string;
  /** 政策类型 */
  policyType?: string;
  /** 货物品类/品名 */
  goodsCode?: string;
  /** 货物品类/品名 */
  goodsName?: string;
  /** 到省 */
  arrivalProvince?: string;
  /** 到局code */
  arrivalBureau?: string;
  /** 到站名 */
  arrivalStation?: string;
  /** 车型 */
  trainType?: string;
  /** 票种 */
  ticketType?: string;
  /** 集装箱类型 */
  containerType?: string;
  /** 有效期 */
  vaildDate?: string;
  /** 发货人 */
  sender?: string;
  /** 下浮批准号 */
  xfkey?: string;
  /** 是否包含过期数据 */
  includeExpiration?: boolean;
  /** 是否精确匹配品名编码 */
  isPrecise?: boolean;
  /** 是否仅返回精确匹配的优价，否返回可能匹配的优价 */
  isOnlyPrecise?: boolean;
  /** 是否可用 */
  isUsed?: boolean;
  [key: string]: any;
}
/** 优价主表查询结果 */
interface PolicyAllSimpleResult {
  id?: string;
  policyId?: string;
  xfkey?: string;
  province?: CodeName[];
  excludeProvince?: CodeName[];
  bureau?: CodeName[];
  excludeBureau?: CodeName[];
  station?: CodeName[];
  excludeStation?: CodeName[];
  arrivalProvince?: CodeName[];
  arrivalExcludeProvince?: CodeName[];
  arrivalBureau?: CodeName[];
  arrivalExcludeBureau?: CodeName[];
  arrivalStation?: CodeName[];
  arrivalExcludeStation?: CodeName[];
  goods?: CodeName[];
  excludeGoods?: CodeName[];

  provinceName?: string;
  excludeProvinceName?: string;
  bureauName?: string;
  excludeBureauName?: string;
  stationName?: string;
  excludeStationName?: string;
  arrivalProvinceName?: string;
  arrivalExcludeProvinceName?: string;
  arrivalBureauName?: string;
  arrivalExcludeBureauName?: string;
  arrivalStationName?: string;
  arrivalExcludeStationName?: string;
  goodsName?: string;
  excludeGoodsName?: string;

  policyType?: string;
  coefficient?: number;
  trainType?: string;
  containerType?: string;
  containerTypeMark?: string;
  containerTypes?: string;
  containerTypesName?: string;
  sender?: string;
  ticketType?: string;
  scope?: string;
  startDate?: string;
  endDate?: string;
  details?: PricePolicyResult[];
  dtLoading?: boolean;
  /** 是否过期 */
  isExpiration?: boolean;
  remark?: string;
  railwayNatureType?: number;
  /** 是否可用 */
  isUsed?: boolean;
}
export type PolicyAllSimpleRecordDto = PolicyAllSimpleResult & {
  policyExs?: RailwayGoodPricePolicyEx[];
};
/** 优价明细 */
interface PricePolicyResult {
  id?: string;
  policyId?: string;
  xfkey?: string;
  lowerGrade?: string;
  chargeTypeCode?: string;
  chargeTypeName?: string;
  coefficient?: number;
}

interface PolicyAllSimpleUpdateDto {
  id?: string;
  containerType?: string;
  containerTypes: string[];
  remark?: string;
}

interface GoodsItems {
  goodsCode: string;
  goodsName: string;
  isType?: boolean;
  exclude: boolean;
  [key: string]: any;
}

interface CodeName {
  code: string;
  name: string;
  children?: CodeName[]
}

// #endregion

// #region 优价线路查询
/** 优价线路查询参数 */
interface PricePolicyQueryLineParam {
  /** 发货地址 */
  address?: string;
  /** 到货地址 */
  arrivalAddress?: string;
  /** 发站名 */
  station?: string;
  /** 到站名 */
  arrivalStation?: string;
  /** 货物品类/品名 */
  goodsCode?: string;
  /** 货物品类/品名 */
  goodsName?: string;
  /** 办理方式 */
  serviceType?: number;
  /** 发运量 */
  freightVolume?: number;
  /** 发运量单位 */
  freightUnit?: string;
}
/** 正价价格 */
interface RailwayInquiryPriceDto {
  id?: string;
  transactType?: number;
  transactTypeName?: string;
  stsCharge?: number;
  loadCost?: number;
  glhzCost?: number;
  printCost?: number;
  useBoxCharge?: number;
  receiveCharge?: number;
  price?: number;
  unit?: string;
  policyId?: string;
  policyPrice?: number;
  priceSource?: string;
  contributor?: string;
  contributorName?: string;
  contributorPhone?: string;
}

interface PolicyShowDto {
  /** 线路 a->c 或 a->b->c */
  line?: string;
  /** 优价合计 */
  price?: number;
  policyItem?: {
    xfkey?: string;
    policyId?: string;
    policyType?: string;
    coefficient?: number;
  };
  priceItem?: RailwayInquiryPriceDto;
  children?: PolicyShowDto[];
}

interface PolicyShowItem {
  line?: string;
  parentLine?: string;
  coefficientOptions?: { label: string; value: string }[];
  items?: PolicyShowDto[];
  children?: PolicyShowItem[];
  currentPrice?: any[];
}

/** 办理方式【整车、集装箱20尺、集装箱40尺、35吨敞顶箱、批量快运】 */
const TransactTypeEnum = CustomEnum({
  Zc: { id: 1, label: "整车", shape: "square" },
  Jzx20: { id: 2, label: "20尺集装箱", shape: "square" },
  Jzx40: { id: 3, label: "40尺集装箱", shape: "square" },
  Jzx35: { id: 4, label: "35吨敞顶箱", shape: "square" },
  Pl: { id: 5, label: "批量快运", shape: "square" }
});
const RailwayNatureEnum = CustomEnum({
  National: { id: 0, label: "国铁" },
  Local: { id: 1, label: "地方铁路" }
});
// #endregion

export type {
  PricePolicyQueryParam,
  PolicyAllSimpleResult,
  PricePolicyResult,
  GoodsItems,
  CodeName,
  PricePolicyQueryLineParam,
  PolicyShowDto,
  PolicyShowItem,
  PolicyAllSimpleUpdateDto
};
export { TransactTypeEnum, RailwayNatureEnum }
