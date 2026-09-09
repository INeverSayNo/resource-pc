const env = (import.meta.env.VITE_ENV_TYPE as string) || "dev";
/** 车站 基础信息显示配置 */
export const StationDtField = [
  // { field: "scopeOfBusiness", clipboard: false, label: "业务范围" },
  {
    field: "railwayBureauName",
    label: "路局/车务段",
    children: [
      { field: "railwayBureauName", clipboard: false, suffix: " / " },
      { field: "railwayTrainName", class: "no-border" }
    ]
  },
  { field: "railwayLine", label: "线路" },
  { field: "address", label: "地址" },
  { field: "railwayStationCode", label: "编码" },
  { field: "railwayStationDbm", label: "代码" },
  { field: "isHyStation", label: "货运站", isBoolean: true },
  { field: "isCrhExpress", label: "高铁快运", isBoolean: true },
  { field: "isHbExpress", label: "行包快运", isBoolean: true, suffix: "" },
  {
    field: "logisticCenterName",
    label: "所属物流中心",
  },
  // {
  //   field: "principalName",
  //   label: "负责区域",
  //   children: [
  //     { field: "areaCompanyName", checkValue: true, suffix: " / " },
  //     { field: "principalName", class: "no-border" },
  //     { field: "principalPhone", clipboard: true, class: "no-border" }
  //   ]
  // },
  {
    field: "agreementCompanyName",
    label: "发运协议签订公司",
    checkValue: true
  },
  { field: "proxySupplierName", label: "代理运输供应商", checkValue: true },
  {
    field: "advantageRemark",
    label: "优势内容",
    class: "theme-success",
    colspan: 24,
    checkValue: true
  }
  // { field: "stationGrade", label: "车站等级" }
];

/** 车站基础信息，标签 */
export const StationTag = [
  { field: "isAdvantage", label: "优势站点", type: "text", tagType: "danger" },
  {
    field: "isAgreement",
    label: "已签订发运协议",
    type: "text",
    tagType: "primary"
  },
  { field: "isImportant", label: "重要站点", type: "text", tagType: "warning" },
  {
    field: "hasProxySupplier",
    label: "有代理运输供应商",
    type: "text",
    tagType: "primary"
  },
  {
    field: "isStationary",
    label: "有驻站人员",
    type: "text",
    tagType: "success"
  }
];
export const tagColorMap = new Map<string, string>([
  ["国铁站", "success"],
  ["合资站", "warning"],
  ["货运站", "primary"],
  // ["已签发运协议", "success"],
  ["有货运代理", "success"],
  ["有接取送达", "primary"],
  ["集装箱发送", "warning"],
  ["集装箱到达", "warning"],
  ["批量散货", "success"],
  ["批量快运", "success"],
  ["集装箱发送、到达", "warning"],
  ["危险品办理", "danger"],
  ["下水站", "success"],
  ["出境口岸", "primary"]
]);

export const tagColorPortMap = new Map<string, string>([
  ["长江港口", "success"],
  ["沿海港口", "warning"],
  ["京杭港口", "primary"],
  ["珠江港口", "success"],
  ["四川水域港口", "success"],
  ["赣江港口", "warning"],
  ["松花江港口", "primary"],
  ["汉江港口", "success"],
  ["Core", "danger"],
  ["Important", "primary"],
  ["Ordinary", "success"],
  ["Todo", ""]
]);

export const stationLevelColorMap = new Map<string, string>([
  ["Core", "red"],
  ["Important", "orange"],
  ["Ordinary", ""],
  ["Todo", "#909399"]
]);
export const stationLevelTextMap = new Map<string, string>([
  ["Core", "★★★"],
  ["Important", "★★"],
  ["Ordinary", "★"],
  ["Todo", ""]
]);

/** 货场字段信息 */
export const YardField = [
  { field: "handleScope", label: "普货整车办理范围", colspan: 24 },
  { field: "containerSendHS", label: "集装箱发送办理范围", colspan: 12 },
  { field: "containerArriveHS", label: "集装箱到达办理范围", colspan: 12 },
  { field: "danger", label: "危险品办理范围", colspan: 24 },
  { field: "maxLiftingCapacity", label: "最大起重能力" },
  { field: "forkliftLC", label: "叉车起重能力" },
  { field: "container20LC", label: "20尺集装箱起重能力" },
  { field: "container40LC", label: "40尺集装箱起重能力" },
  { field: "containerMixedLoading", label: "集装箱货物混装", isBoolean: true },
  { field: "yardChargeItem", label: "暂存费收费标准", colspan: 24 }
];
/** 货场办理范围字段 */
export const YardHandleScopeField = [
  { field: "scope", label: "" },
  { field: "lshw", label: "零散", isBoolean: true },
  { field: "pllshw", label: "批量散货", isBoolean: true },
  { field: "cx", label: "超限", isBoolean: true },
  { field: "cz", label: "超重", isBoolean: true },
  { field: "hwhz", label: "货物混装", isBoolean: true }
];

/** 集装箱类型对应值 */
export const ContainerType = [
  { field: "jzx20bz", label: "20尺" },
  { field: "jzx40bz", label: "40尺" },
  { field: "jzx35cd", label: "35敞顶箱" },
  { field: "jzx35gsh", label: "35尺干散货箱" },
  { field: "jzx20gsh", label: "20尺干散货箱" },
  { field: "jzx20szsn", label: "20尺水泥罐式箱" },
  { field: "jzx20yt", label: "20尺液体罐式箱" },
  { field: "jzx20sylq", label: "20尺石油沥青罐式箱" },
  { field: "jzx35jg", label: "" },
  { field: "jzxbjx", label: "" },
  { field: "jzxzdx", label: "" },
  { field: "jzx35", label: "" }
];
/** 保量要求 */
export const QuantityRequireType = [
  { label: "按月", value: "按月" },
  { label: "按季", value: "按季" },
  { label: "按次", value: "按次" },
  { label: "按年", value: "按年" }
];
/** 货场费用类型以及单位配置 */
export const YardChargeType = [
  { label: "整车货物", value: "整车货物", unit: "元/车.天" },
  { label: "20尺集装箱", value: "20尺集装箱", unit: "元/箱.天" },
  { label: "40尺集装箱", value: "40尺集装箱", unit: "元/箱.天" },
  { label: "其他货物", value: "其他货物", unit: "元/吨.天" }
];
/** 专用线详情显示字段 */
export const PrivateLineField = [
  { field: "num", label: "代码" },
  { field: "transferMileage", label: "取送车里程(米)" },
  {
    field: "contacts",
    label: "联系人",
    children: [
      { field: "contacts", class: "no-border" },
      { field: "phone", isClip: true, class: "no-border cu-pointer" }
    ]
  },
  { field: "chargeRemark", label: "收费标准", colspan: 24, class: "success" },
  { field: "sendCategory", label: "发送品类", colspan: 12, class: "success" },
  { field: "arriveCategory", label: "达到品类", colspan: 12, class: "success" },
  { field: "overrun", label: "超限/超重", isBoolean: true },
  { field: "containerSendHS", label: "集装箱发送办理范围", class: "success" },
  { field: "containerArriveHS", label: "集装箱到达办理范围", class: "success" },
  { field: "containerMixedLoading", label: "集装箱混装", isBoolean: true },

  { field: "address", label: "专用线地址", colspan: 24 },

  { field: "maxLiftingCapacity", label: "最大起重能力", isMore: true },
  { field: "forkliftLC", label: "叉车起重能力", isMore: true },
  { field: "container20LC", label: "20尺集装箱起重能力", isMore: true },
  { field: "container40LC", label: "40尺集装箱起重能力", isMore: true },

  {
    field: "dangerSendFilling",
    label: "危险品发送灌装",
    isMore: true,
    class: "success"
  },
  {
    field: "dangerSendNotFilling",
    label: "危险品发送非灌装",
    isMore: true,
    class: "success"
  },
  {
    field: "dangerSendContainer",
    label: "危险品发送集装箱",
    isMore: true,
    class: "success"
  },
  {
    field: "dangerArriveFilling",
    label: "危险品到达灌装",
    isMore: true,
    class: "success"
  },
  {
    field: "dangerArriveNotFilling",
    label: "危险品到达非灌装",
    isMore: true,
    class: "success"
  },
  {
    field: "dangerArriveContainer",
    label: "危险品到达集装箱",
    isMore: true,
    class: "success"
  }
];

/** 仓储资源Id配置 */
const warehouseResourceObjectSetting = new Map<string, string>([
  ["dev", "3a025fa8-d43a-43b4-03c7-cc7641bf992b"],
  ["pro", "3a025fa8-d43a-43b4-03c7-cc7641bf992b"]
]);
export const warehouseResourceObjectId =
  warehouseResourceObjectSetting.get(env);
