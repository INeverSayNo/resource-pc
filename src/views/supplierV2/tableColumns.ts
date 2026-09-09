import { DCTableColumn } from "@/components/DCLayout/store";
import { formatTime } from "@/utils";
import { SupplierNatureEnum } from "./Enum";
import { SupplierHeadDto } from "./types";
import { createPrivatePhone } from '@/components/PrivatePhone/createPrivatePhone';

export const showColSetting = new Map<string, string[]>([
  [
    "enterprise",
    [
      "industryName",
      "companyPhone",
      "supplierCMDC",
      "registDate",
      "staffSize",
      "shortName"
    ]
  ],
  ["person", ["contact", "contactPhone"]]
]);

function getLastBusinessTypeName(val?: string) {
  if (val) {
    return val
      .split("|")
      .map((x) => {
        const v = x.split("/");
        return v[v.length - 1];
      })
      .join(",");
  }
  return "";
}

export const EnterpriseTbCols: DCTableColumn[] = [
  {
    label: "审核状态",
    name: "auditStatus",
    width: "100px",
    align: "center",
    type: "slot"
  },
  {
    label: "供应商编号",
    name: "supplierCode",
    headerAlign: "center",
    width: "150px"
  },
  // {
  //   label: '供应商名称',
  //   name: 'shortName',
  //   headerAlign: 'center'
  // },
  {
    label: "供应商名称",
    name: "supplierName",
    type: "slot",
    width: "200px",
    headerAlign: "center"
  },
  {
    label: "供应商简称",
    name: "shortName",
    headerAlign: "center",
    hidden: true,
    width: "150px"
  },
  {
    label: "供应商分类",
    name: "enterpriseBusinessTypeNames",
    headerAlign: "center",
    width: "150px",
    formatter: (row: SupplierHeadDto) => {
      return row.supplierNature === SupplierNatureEnum.Enum.Enterprise.id
        ? getLastBusinessTypeName(
            row?.enterpriseExtend?.enterpriseBusinessTypeNames
          )
        : getLastBusinessTypeName(row?.personExtend?.personBusinessTypeNames);
    },
    dtFormatter: (v: any, row: SupplierHeadDto) => {
      return row.supplierNature === SupplierNatureEnum.Enum.Enterprise.id
        ? getLastBusinessTypeName(
            row?.enterpriseExtend?.enterpriseBusinessTypeNames
          )
        : getLastBusinessTypeName(row?.personExtend?.personBusinessTypeNames);
    }
  },
  {
    label: "联系人姓名",
    name: "contact",
    headerAlign: "center",
    hidden: true,
    formatter: (row: SupplierHeadDto) => {
      return row.personExtend?.contact;
    },
    dtFormatter: (v: any, data: SupplierHeadDto) => {
      return data.personExtend?.contact;
    }
  },
  {
    label: "联系人电话",
    name: "contactPhone",
    headerAlign: "center",
    hidden: true,
    type: "html",
    formatter: (row: SupplierHeadDto) => {
      if (!row.personExtend?.contactPhone) return "";
      const ele = createPrivatePhone(row.personExtend?.contactPhone)
      return ele.outerHTML
    },
    dtFormatter: (v: any, data: SupplierHeadDto) => {
      if (!data.personExtend?.contactPhone) return "";
      const ele = createPrivatePhone(data.personExtend?.contactPhone)
      return ele.outerHTML
    }
  },
  {
    label: "所属行业",
    name: "industryName",
    headerAlign: "center",
    hidden: true,
    width: "150px",
    formatter: (row: SupplierHeadDto) => {
      return row?.enterpriseExtend?.industryName;
    },
    dtFormatter: (v: any, data: SupplierHeadDto) => {
      return data?.enterpriseExtend?.industryName;
    }
  },
  {
    label: "主营业务",
    name: "businessTypeNames",
    headerAlign: "center",
    width: "150px"
  },
  {
    label: "公司电话",
    name: "companyPhone",
    headerAlign: "center",
    hidden: true,
    type: "html",
    width: "120px",
    formatter: (row: SupplierHeadDto) => {
      if (!row.enterpriseExtend?.companyPhone) return "";
      const ele = createPrivatePhone(row.enterpriseExtend?.companyPhone)
      return ele.outerHTML
    },
    dtFormatter: (v: any, data: SupplierHeadDto) => {
      if (!data.enterpriseExtend?.companyPhone) return "";
      const ele = createPrivatePhone(data.enterpriseExtend?.companyPhone)
      return ele.outerHTML
    }
  },
  {
    label: "质量认证体系",
    name: "supplierCMDC",
    align: "center",
    type: "slot",
    hidden: true,
    width: "150px"
  },

  {
    label: "成立日期",
    name: "registDate",
    headerAlign: "center",
    hidden: true,
    width: "120px",
    formatter: (row: SupplierHeadDto) => {
      return formatTime(row?.enterpriseExtend?.registDate, "yyyy-MM-dd");
    },
    dtFormatter: (v: any, data: SupplierHeadDto) => {
      return formatTime(data?.enterpriseExtend?.registDate, "yyyy-MM-dd");
    }
  },
  {
    label: "人员规模",
    name: "staffSize",
    headerAlign: "center",
    width: "90px",
    hidden: true,
    formatter: (row: SupplierHeadDto) => {
      return row?.enterpriseExtend?.staffSize;
    },
    dtFormatter: (v: any, data: SupplierHeadDto) => {
      return data?.enterpriseExtend?.staffSize;
    }
  },

  {
    label: "供应商来源",
    name: "sourceSysName",
    align: "center",
    width: "120px"
  },
  {
    label: "最后更新时间",
    name: "lastModificationTime",
    align: "center",
    width: "160px",
    formatter: (row: SupplierHeadDto) => {
      return formatTime(
        row.lastModificationTime || row.creationTime,
        "yyyy-MM-dd HH:mm"
      );
    },
    dtFormatter: (v: any, data: SupplierHeadDto) => {
      return formatTime(
        data.lastModificationTime || data.creationTime,
        "yyyy-MM-dd HH:mm"
      );
    }
  },
  {
    label: "所属机构",
    name: "ownerOrgName",
    align: "center",
    width: "120px",
    hidden: true
  }
];
