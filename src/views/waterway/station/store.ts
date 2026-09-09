const env = (import.meta.env.VITE_ENV_TYPE as string) || "dev";
/** 车站 基础信息显示配置 */
export const StationDtField = [
  { field: "scopeOfBusiness", clipboard: false, label: "业务范围" },
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
  ["集装箱发送、到达", "warning"],
  ["危险品办理", "danger"],
  ["沿海港口","success"],
  ["长江港口","success"],
  ["京杭港口","success"],
  ["珠江港口","success"],
  ["湘江港口","success"],
  ["汉江港口","success"],
  ["松花江港口","success"],
  ["国际港口","success"],
  ["集装箱","primary"],
  ["散货","primary"],
  ["杂货","primary"],
  ["罐船","primary"],
  ["国有码头","warning"],
  ["有进港铁路","danger"],
]);

export const stationLevelNameMap = new Map<string, string>([
  ["Core", "核心港口"],
  ["Important", "重要港口"],
  ["Ordinary", "普通港口"],
  ["Todo", "待开发港口"]
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

export const NationalityOptions = [
  { field: "af", label: "阿富汗" },
  { field: "al", label: "阿尔巴尼亚" },
  { field: "dz", label: "阿尔及利亚" },
  { field: "as", label: "美属萨摩亚" },
  { field: "ad", label: "安道尔" },
  { field: "ao", label: "安哥拉" },
  { field: "ai", label: "安圭拉" },
  { field: "ag", label: "安提瓜和巴布达" },
  { field: "ar", label: "阿根廷" },
  { field: "am", label: "亚美尼亚" },
  { field: "aw", label: "阿鲁巴" },
  { field: "au", label: "澳大利亚" },
  { field: "at", label: "奥地利" },
  { field: "az", label: "阿塞拜疆" },
  { field: "bs", label: "巴哈马" },
  { field: "bh", label: "巴林" },
  { field: "bd", label: "孟加拉国" },
  { field: "bb", label: "巴巴多斯" },
  { field: "by", label: "白俄罗斯" },
  { field: "be", label: "比利时" },
  { field: "bz", label: "伯利兹" },
  { field: "bj", label: "贝尔哈" },
  { field: "bt", label: "不丹" },
  { field: "bo", label: "玻利维亚" },
  { field: "ba", label: "波斯尼亚和黑塞哥维那" },
  { field: "bw", label: "博茨瓦纳" },
  { field: "br", label: "巴西" },
  { field: "bn", label: "文莱" },
  { field: "bg", label: "保加利亚" },
  { field: "bf", label: "布基纳法索" },
  { field: "bi", label: "布隆迪" },
  { field: "kh", label: "柬埔寨" },
  { field: "cm", label: "喀麦隆" },
  { field: "ca", label: "加拿大" },
  { field: "cv", label: "佛得角" },
  { field: "ky", label: "开曼群岛" },
  { field: "cf", label: "中非共和国" },
  { field: "td", label: "乍得" },
  { field: "cl", label: "智利" },
  { field: "cn", label: "中国" },
  { field: "co", label: "哥伦比亚" },
  { field: "km", label: "科摩罗" },
  { field: "cg", label: "刚果（布）" },
  { field: "cd", label: "刚果（金）" },
  { field: "cr", label: "哥斯达黎加" },
  { field: "ci", label: "科特迪瓦" },
  { field: "hr", label: "克罗地亚" },
  { field: "cu", label: "古巴" },
  { field: "cy", label: "塞浦路斯" },
  { field: "cz", label: "捷克" },
  { field: "dk", label: "丹麦" },
  { field: "dj", label: "吉布提" },
  { field: "dm", label: "多米尼加" },
  { field: "do", label: "多米尼加共和国" },
  { field: "ec", label: "厄瓜多尔" },
  { field: "eg", label: "埃及" },
  { field: "sv", label: "萨尔瓦多" },
  { field: "gq", label: "赤道几内亚" },
  { field: "er", label: "厄立特里亚" },
  { field: "ee", label: "爱沙尼亚" },
  { field: "sz", label: "斯威士兰" },
  { field: "et", label: "埃塞俄比亚" },
  { field: "fk", label: "福克兰群岛" },
  { field: "fo", label: "法罗群岛" },
  { field: "fj", label: "斐济" },
  { field: "fi", label: "芬兰" },
  { field: "fr", label: "法国" },
  { field: "gf", label: "法属圭亚那" },
  { field: "pf", label: "法属波利尼西亚" },
  { field: "ga", label: "加蓬" },
  { field: "gm", label: "冈比亚" },
  { field: "ge", label: "格鲁吉亚" },
  { field: "de", label: "德国" },
  { field: "gh", label: "加纳" },
  { field: "gi", label: "直布罗陀" },
  { field: "gr", label: "希腊" },
  { field: "gl", label: "格陵兰" },
  { field: "gd", label: "格林纳达" },
  { field: "gp", label: "瓜德罗普" },
  { field: "gu", label: "关岛" },
  { field: "gt", label: "危地马拉" },
  { field: "gn", label: "几内亚" },
  { field: "gw", label: "几内亚比绍" },
  { field: "gy", label: "圭亚那" },
  { field: "ht", label: "海地" },
  { field: "hn", label: "洪都拉斯" },
  { field: "hk", label: "香港" },
  { field: "hu", label: "匈牙利" },
  { field: "is", label: "冰岛" },
  { field: "in", label: "印度" },
  { field: "id", label: "印度尼西亚" },
  { field: "ir", label: "伊朗" },
  { field: "iq", label: "伊拉克" },
  { field: "ie", label: "爱尔兰" },
  { field: "il", label: "以色列" },
  { field: "it", label: "意大利" },
  { field: "jm", label: "牙买加" },
  { field: "jp", label: "日本" },
  { field: "jo", label: "约旦" },
  { field: "kz", label: "哈萨克斯坦" },
  { field: "ke", label: "肯尼亚" },
  { field: "ki", label: "基里巴斯" },
  { field: "kw", label: "科威特" },
  { field: "kg", label: "吉尔吉斯斯坦" },
  { field: "la", label: "老挝" },
  { field: "lv", label: "拉脱维亚" },
  { field: "lb", label: "黎巴嫩" },
  { field: "ls", label: "莱索托" },
  { field: "lr", label: "利比里亚" },
  { field: "ly", label: "利比亚" },
  { field: "li", label: "列支敦士登" },
  { field: "lt", label: "立陶宛" },
  { field: "lu", label: "卢森堡" },
  { field: "mo", label: "澳门" },
  { field: "mk", label: "北马其顿" },
  { field: "mg", label: "马达加斯加" },
  { field: "mw", label: "马拉维" },
  { field: "my", label: "马来西亚" },
  { field: "mv", label: "马尔代夫" },
  { field: "ml", label: "马里" },
  { field: "mt", label: "马耳他" },
  { field: "mh", label: "马绍尔群岛" },
  { field: "mq", label: "马提尼克" },
  { field: "mr", label: "毛里塔尼亚" },
  { field: "mu", label: "毛里求斯" },
  { field: "yt", label: "马约特" },
  { field: "mx", label: "墨西哥" },
  { field: "fm", label: "密克罗尼西亚" },
  { field: "md", label: "摩尔多瓦" },
  { field: "mc", label: "摩纳哥" },
  { field: "mn", label: "蒙古" },
  { field: "me", label: "黑山" },
  { field: "ms", label: "蒙特塞拉特" },
  { field: "ma", label: "摩洛哥" },
  { field: "mz", label: "莫桑比克" },
  { field: "mm", label: "缅甸" },
  { field: "na", label: "纳米比亚" },
  { field: "nr", label: "瑙鲁" },
  { field: "np", label: "尼泊尔" },
  { field: "nl", label: "荷兰" },
  { field: "nc", label: "新喀里多尼亚" },
  { field: "nz", label: "新西兰" },
  { field: "ni", label: "尼加拉瓜" },
  { field: "ne", label: "尼日尔" },
  { field: "ng", label: "尼日利亚" },
  { field: "nu", label: "纽埃" },
  { field: "kp", label: "朝鲜" },
  { field: "mp", label: "北马里亚纳群岛" },
  { field: "no", label: "挪威" },
  { field: "om", label: "阿曼" },
  { field: "pk", label: "巴基斯坦" },
  { field: "pw", label: "帕劳" },
  { field: "pa", label: "巴拿马" },
  { field: "pg", label: "巴布亚新几内亚" },
  { field: "py", label: "巴拉圭" },
  { field: "pe", label: "秘鲁" },
  { field: "ph", label: "菲律宾" },
  { field: "pl", label: "波兰" },
  { field: "pt", label: "葡萄牙" },
  { field: "pr", label: "波多黎各" },
  { field: "qa", label: "卡塔尔" },
  { field: "re", label: "留尼汪" },
  { field: "ro", label: "罗马尼亚" },
  { field: "ru", label: "俄罗斯" },
  { field: "rw", label: "卢旺达" },
  { field: "bl", label: "圣巴泰勒米" },
  { field: "sh", label: "圣赫勒拿" },
  { field: "kn", label: "圣基茨和尼维斯" },
  { field: "lc", label: "圣卢西亚" },
  { field: "mf", label: "圣马丁" },
  { field: "pm", label: "圣皮埃尔和密克隆" },
  { field: "vc", label: "圣文森特和格林纳丁斯" },
  { field: "ws", label: "萨摩亚" },
  { field: "sm", label: "圣马力诺" },
  { field: "st", label: "圣多美和普林西比" },
  { field: "sa", label: "沙特阿拉伯" },
  { field: "sn", label: "塞内加尔" },
  { field: "rs", label: "塞尔维亚" },
  { field: "sc", label: "塞舌尔" },
  { field: "sl", label: "塞拉利昂" },
  { field: "sg", label: "新加坡" },
  { field: "sx", label: "荷属圣马丁" },
  { field: "sk", label: "斯洛伐克" },
  { field: "si", label: "斯洛文尼亚" },
  { field: "sb", label: "所罗门群岛" },
  { field: "so", label: "索马里" },
  { field: "za", label: "南非" },
  { field: "gs", label: "南乔治亚岛和南桑威奇群岛" },
  { field: "kr", label: "韩国" },
  { field: "ss", label: "南苏丹" },
  { field: "es", label: "西班牙" },
  { field: "lk", label: "斯里兰卡" },
  { field: "sd", label: "苏丹" },
  { field: "sr", label: "苏里南" },
  { field: "sj", label: "斯瓦尔巴群岛和扬马延岛" },
  { field: "se", label: "瑞典" },
  { field: "ch", label: "瑞士" },
  { field: "sy", label: "叙利亚" },
  { field: "tw", label: "台湾" },
  { field: "tj", label: "塔吉克斯坦" },
  { field: "tz", label: "坦桑尼亚" },
  { field: "th", label: "泰国" },
  { field: "tg", label: "多哥" },
  { field: "tk", label: "托克劳" },
  { field: "to", label: "汤加" },
  { field: "tt", label: "特立尼达和多巴哥" },
  { field: "tn", label: "突尼斯" },
  { field: "tr", label: "土耳其" },
  { field: "tm", label: "土库曼斯坦" },
  { field: "tc", label: "特克斯和凯科斯群岛" },
  { field: "tv", label: "图瓦卢" },
  { field: "ug", label: "乌干达" },
  { field: "ua", label: "乌克兰" },
  { field: "ae", label: "阿联酋" },
  { field: "gb", label: "英国" },
  { field: "us", label: "美国" },
  { field: "uy", label: "乌拉圭" },
  { field: "uz", label: "乌兹别克斯坦" },
  { field: "vu", label: "瓦努阿图" },
  { field: "ve", label: "委内瑞拉" },
  { field: "vn", label: "越南" },
  { field: "wf", label: "瓦利斯和富图纳" },
  { field: "ye", label: "也门" },
  { field: "zm", label: "赞比亚" },
  { field: "zw", label: "津巴布韦" }
  ];