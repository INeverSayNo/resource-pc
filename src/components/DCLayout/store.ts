import { DcDate } from "@dczy/tie-tools";

type FilterModel = {
  text: string;
  value: string;
};

type editOptionType = {
  type: string;
  remoteMethod?: Promise<any>;
  items?: any[];
  props?: any;
};

export type DCTableColumn = {
  name?: string;
  label?: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  type?: string | "slot" | "html" | "img-upload";
  formatter?: (row: any, column: any, cellValue: any, rindex?: number) => any;
  dtFormatter?: (cellValue: any, data: any) => any;
  dtShow?: boolean;
  span?: number;
  headerAlign?: "left" | "center" | "right";
  showOverflowTooltip?: boolean;
  filters?: Array<FilterModel>;
  classname?: string;
  labelclassname?: string;
  hidden?: boolean;
  value?: any;
  sortable?: boolean;
  children?: Array<DCTableColumn>;
  editOptions?: editOptionType;
  isHighlight?: boolean;
  icon?: string;
  dtItemMinWidth?: number;
};

export const defaultTreeProps = {
  parent: "parentId",
  value: "id",
  children: "children",
  label: "TypeName"
};

export const defaultColums: DCTableColumn[] = [
  {
    name: "sort",
    label: "排序",
    align: "center",
    width: "80px"
  },
  {
    name: "isScrap",
    label: "是否作废",
    align: "center",
    width: "80px",
    formatter: (_row: any, _column: any, cellValue: any) => {
      return cellValue ? "是" : "否";
    }
  },
  {
    name: "creationTime",
    label: "创建日期",
    width: "140px",
    formatter: (_row: any, _column: any, cellValue: any) => {
      return DcDate.format(cellValue, "yyyy-MM-dd HH:mm");
    }
  },
  {
    name: "creatorName",
    label: "创建人员",
    width: "100px"
  }
];
