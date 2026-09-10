import { DCTableColumn } from "@/components/DCLayout/store";
import { formatTime } from "@/utils";
import { RailwayNatureEnum } from "./types";
import { DcDeep } from "@dczy/tie-tools";
const mainTableCols: DCTableColumn[] = [
  {
    name: "xfkey",
    label: "批准号",
    width: "180",
    type: "slot",
    align: "center",
    span: 2,
    dtItemMinWidth: 250
  },
  {
    name: "railwayNatureType",
    label: "国铁/地铁",
    width: "110",
    align: "center",
    dtShow: false,
    formatter: (r, c, val) => {
      return RailwayNatureEnum.getSelf(val)?.label;
    },
    dtFormatter(cellValue, data) {
      return RailwayNatureEnum.getSelf(cellValue)?.label;
    }
  },
  {
    name: "policyType",
    label: "项目类型",
    width: "120",
    align: "center",
    span: 2,
    dtItemMinWidth: 250
  },
  {
    name: "coefficient",
    label: "运费价差系数",
    width: "130",
    align: "center",
    classname: "theme-danger",
    span: 2,
    type: "slot"
  },
  // {
  //   name: "isUsed",
  //   label: "是否可用",
  //   width: "80",
  //   align: "center",
  //   span: 2,
  //   dtShow: false,
  //   formatter: (r, c, val) => {
  //     return val || val == null ? "是" : "否"
  //   },
  //   dtFormatter: (val) => {
  //     return val || val == null ? "是" : "否"
  //   }
  // },
  {
    name: "sender",
    label: "发货人",
    width: "150",
    align: "center",
    type: "slot",
    span: 2
  },
  {
    name: "containerType",
    label: "箱型",
    align: "center",
    span: 2
  },
  {
    name: "containerTypeMark",
    label: "特种箱标记",
    align: "center",
    width: "120",
    span: 2,
    formatter: (row) => {
      if (row.ticketType || row.ticketType !== "集装箱") return ""
      return row.containerTypeMark == "1" ? "铁龙箱" : "非铁龙箱";
    }
  },
  {
    name: "containerTypesName",
    label: "特殊箱型名称",
    width: "120",
    align: "center",
    span: 2
  },
  {
    name: "trainType",
    label: "车型",
    align: "center",
    span: 2
  },
  {
    name: "station",
    label: "发站范围",
    type: "slot",
    width: "250",
    align: "center",
    span: 2
  },
  {
    name: "arrivalStation",
    label: "到站范围",
    width: "250",
    type: "slot",
    align: "center",
    span: 2
  },
  {
    name: "goodsName",
    label: "品类/品名",
    align: "center",
    width: "250",
    type: "slot",
    span: 2
  },
  {
    name: "excludeGoodsName",
    label: "品类/品名(不含)",
    width: "120",
    align: "center",
    span: 2
  },
  {
    name: "startDate",
    label: "起始日期",
    width: "110",
    span: 2,
    formatter: (row, column, val) => {
      return formatTime(val, "yyyy-MM-dd");
    },
    dtFormatter: (val) => {
      return formatTime(val, "yyyy-MM-dd");
    },
    align: "center"
  },
  {
    name: "endDate",
    label: "终止日期",
    width: "110",
    span: 2,
    formatter: (row, column, val) => {
      return formatTime(val, "yyyy-MM-dd");
    },
    dtFormatter: (val) => {
      return formatTime(val, "yyyy-MM-dd");
    },
    align: "center"
  },
  {
    name: "bureau",
    label: "发局",
    type: "slot",
    align: "center",
    span: 2,
    hidden: true
  },
  {
    name: "province",
    label: "发货省",
    type: "slot",
    align: "center",
    span: 2,
    hidden: true
  },
  {
    name: "arrivalBureau",
    label: "到局",
    type: "slot",
    align: "center",
    span: 2,
    hidden: true
  },
  {
    name: "arrivalProvince",
    label: "到货省",
    type: "slot",
    align: "center",
    span: 2,
    hidden: true
  },

  {
    name: "ticketType",
    label: "票种",
    align: "center",
    span: 2
  },
  {
    name: "scope",
    label: "运输范围",
    align: "center",
    span: 2
  },
  {
    name: "remark",
    label: "备注",
    width: "250",
    headerAlign: "center",
    span: 2
  }
];

export const mainDetailsCols = DcDeep.clone<DCTableColumn[]>(mainTableCols)
  .filter((x) => !Reflect.has(x, "dtShow") || x.dtShow)
  .map((col) => {
    if (col.hidden) col.hidden = false;
    if (col.name === "station") {
      col.label = "发站";
    }
    if (col.name === "arrivalStation") {
      col.label = "到站";
    }
    return col;
  });

const detailsTableCols: DCTableColumn[] = [
  {
    name: "lowerGrade",
    label: "下浮档次",
    width: "80",
    align: "center"
  },
  {
    name: "chargeTypeName",
    label: "费用项目",
    width: "350",
    showOverflowTooltip: false,
    align: "center"
  },
  {
    name: "coefficient",
    label: "价差系数%",
    width: "110",
    align: "center",
    type: "slot",
    classname: "theme-danger"
  }
];

const detailsTableCols2: DCTableColumn[] = DcDeep.clone<DCTableColumn[]>(
  detailsTableCols
).map((r) => {
  if (r.name === "chargeTypeName") {
    delete r.width;
  }
  return r;
});

const CodeNameCols = [
  "province",
  "excludeProvince",
  "bureau",
  "excludeBureau",
  "station",
  "excludeStation",
  "arrivalProvince",
  "arrivalExcludeProvince",
  "arrivalBureau",
  "arrivalExcludeBureau",
  "arrivalStation",
  "arrivalExcludeStation",
  "goods",
  "excludeGoods"
];

const lineCardTableCols: DCTableColumn[] = [
  {
    name: "costItem",
    label: "费用项",
    headerAlign: "center"
  },
  {
    name: "price",
    label: "正价",
    width: "100",
    headerAlign: "center",
    align: "right"
  },
  {
    name: "coefficient",
    label: "价差系数%",
    width: "110",
    headerAlign: "center",
    align: "right"
  },
  {
    name: "goodPrice",
    label: "优价",
    width: "110",
    headerAlign: "center",
    align: "right"
  },
  {
    name: "unit",
    label: "单位",
    width: "110",
    align: "center"
  }
];
const lineCardDataSetting = [
  {
    label: "运费",
    field: "priceItem.stsCharge",
    coefficient: "policyItem.coefficient"
  },
  {
    label: "装卸费",
    field: "priceItem.loadCost",
    unit: "元"
  },
  {
    label: "接取送达费",
    field: "priceItem.receiveCharge",
    unit: "元"
  },
  {
    label: "集装箱使用费",
    field: "priceItem.useBoxCharge",
    unit: "元"
  },
  {
    label: "国联换装费",
    field: "priceItem.glhzCost",
    unit: "元"
  },
  {
    label: "印花税",
    field: "priceItem.printCost",
    unit: "元"
  }
];
export {
  mainTableCols,
  detailsTableCols,
  detailsTableCols2,
  CodeNameCols,
  lineCardTableCols,
  lineCardDataSetting
};
