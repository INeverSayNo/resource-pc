import { DcCommon } from "@dczy/tie-tools";

export interface Rules {
  trigger: string;
  enum: string;
  len?: number;
  max?: number;
  message: string;
  min?: number;
  pattern: string;
  required: boolean;
  type: string;
}
export interface order {
  fieldname: string;
  orderby: string; // asc/desc
  sort: number;
}
export interface sysfieldset {
  fieldname: string;
  show: boolean;
}
export interface WidgetForm {
  list: any[];
  config: {
    size: string;
    hideRequiredAsterisk: boolean;
    hideFieldLabel: boolean;
    labelWidth: number;
    labelPosition: string;
    resourceTypeId: string;
    orders: order[];
    sysfieldset: sysfieldset[];
    mobileShowFieldNum: number;
    isSearchFirst: boolean // 是否查询优先（针对移动端，用于首次查询时只查询 查询字段等，不查询列表数据）
  };
}

const rules: Rules = {
  trigger: "blur",
  enum: "",
  len: undefined,
  max: undefined,
  message: "",
  min: undefined,
  pattern: "",
  required: true,
  type: "any"
};

export const widgetForm: WidgetForm = {
  list: [],
  config: {
    size: "small",
    hideRequiredAsterisk: false,
    hideFieldLabel: false,
    labelWidth: 100,
    labelPosition: "right",
    resourceTypeId: "",
    orders: [
      {
        fieldname: "",
        orderby: "asc", // asc/desc
        sort: 0
      }
    ],
    sysfieldset: [
      { fieldname: "CreatorName", show: false },
      { fieldname: "CreationTime", show: false },
      { fieldname: "OrganizationName", show: false },
      { fieldname: "LastModifierName", show: false },
      { fieldname: "LastModificationTime", show: true }
    ],
    mobileShowFieldNum: 5, // 移动端默认显示字段个数
    isSearchFirst: false
  }
};

// 字段控制
const fieldControl = {
  isorgdatafilter: false,
  keyfield: false,
  checkrepeat: false,
  updatecontrol: false,
  costcalculation: false,
  canimport: true,
  canexport: true,
  cansearch: true,
  isHighlight: false // 是否高亮显示
};
// 字段级联参数
export const fieldCascaderParam = {
  paramName: "", // 查询参数字段名
  fieldName: "" // 本表单用作级联查询传入的字段名
};

export interface SelectProps {
  label: string;
  value: string;
  fromType: string;
}
export const selectProps: SelectProps = {
  label: "label",
  value: "value",
  fromType: "SystemSelectData" // SystemSelectData:自定义下拉框；SystemDataShowSelect：数据展现集成中字典下拉框
};
export const remoteSelect = {
  selectMark: "",
  selectItems: Array(selectProps),
  props: {
    value: "value",
    label: "label"
  },
  cascaderParam: Array(fieldCascaderParam) // 级联参数字段，该字段值作为本控件查询参数
};
export const resourceObject: any[] = [];
export interface TreeSelectProps {
  label: string;
  value: string;
}
export const treeSelectProps: TreeSelectProps = {
  label: "label",
  value: "value"
};
export const remoteDataShowTree = {
  showMark: "",
  selectItems: Array(treeSelectProps),
  props: {
    value: "value",
    label: "label",
    parentId: "parentId",
    children: "children"
  },
  cascaderParam: Array(fieldCascaderParam) // 级联参数字段，该字段值作为本控件查询参数
};

export interface SelectTableProps {
  label: string;
  value: string;
  props: {
    value: string;
    label: string;
  };
}
export const selectTableProps: SelectTableProps = {
  label: "label",
  value: "value",
  props: {
    value: "value",
    label: "label"
  }
};
export const remoteDataShowTable = {
  showMark: "",
  selectItems: Array(selectTableProps),
  cascaderParam: Array(fieldCascaderParam) // 级联参数字段，该字段值作为本控件查询参数
};

export const JudgeType = {
  Eq: "Eq", // ===
  Ne: "Ne", // !==
  GT: "GT", // >
  GTE: "GTE", // >=
  LT: "LT", // <
  LTE: "LTE", // <=
  Like: "Like"
};
export const JudgeTypeArr = [
  {
    label: "等于",
    value: "Eq"
  },
  {
    label: "不等于",
    value: "Ne"
  },
  {
    label: "大于",
    value: "GT"
  },
  {
    label: "大于等于",
    value: "GTE"
  },
  {
    label: "小于",
    value: "LT"
  },
  {
    label: "小于等于",
    value: "LTE"
  },
  {
    label: "包含",
    value: "Like"
  }
];
export interface ShowIf {
  field: string;
  value: string;
  judgetype: string;
}
export const showIf: ShowIf = {
  field: "", // 字段名
  value: "", // 值
  judgetype: "Eq" // 判断符号
};
export const showIfArr = Array(showIf);
export const basicComponents = [
  {
    label: "单行文本",
    type: "input",
    options: {
      width: "100%",
      defaultValue: "",
      placeholder: "",
      maxlength: null,
      prefix: "",
      suffix: "",
      prepend: "",
      append: "",
      disabled: false,
      clearable: false,
      readonly: false,
      rules,
      fieldControl,
      showIfArr
    }
  },
  {
    label: "密码框",
    type: "password",
    options: {
      width: "100%",
      defaultValue: "",
      placeholder: "",
      maxlength: null,
      prefix: "",
      suffix: "",
      prepend: "",
      append: "",
      showPassword: true,
      disabled: false,
      clearable: false,
      readonly: false,
      rules,
      fieldControl,
      showIfArr
    }
  },
  {
    label: "多行文本",
    type: "textarea",
    options: {
      width: "100%",
      defaultValue: "",
      placeholder: "",
      maxlength: null,
      rows: 4,
      autosize: false,
      showWordLimit: false,
      disabled: false,
      clearable: false,
      readonly: false,
      rules,
      fieldControl,
      showIfArr
    }
  },
  {
    label: "计数器",
    type: "number",
    options: {
      width: "",
      defaultValue: 0,
      min: 0,
      max: 100,
      step: 1,
      btnIsRight: true,
      disabled: false,
      rules,
      fieldControl: {
        keyfield: false,
        updatecontrol: true,
        checkrepeat: false,
        costcalculation: true,
        canimport: true,
        canexport: true,
        cansearch: false,
        isHighlight: false
      },
      showIfArr
    }
  },
  {
    label: "单选框组",
    type: "radio",
    options: {
      defaultValue: "",
      width: "",
      inline: true,
      remote: true,
      showLabel: false,
      remoteFunc: "",
      options: [
        {
          value: "Option 1",
          label: "Option 1"
        },
        {
          value: "Option 2",
          label: "Option 2"
        },
        {
          value: "Option 3",
          label: "Option 3"
        }
      ],
      remoteOptions: [],
      props: {
        value: "value",
        label: "label"
      },
      disabled: false,
      rules,
      fieldControl,
      remoteType: "systemData",
      remoteSelect,
      showIfArr,
      searchMultiple: false,
      showOther: false,
      isleftmenu: false
    }
  },
  {
    label: "多选框组",
    type: "checkbox",
    options: {
      defaultValue: [],
      width: "",
      inline: true,
      remote: true,
      showLabel: false,
      remoteFunc: "",
      options: [
        {
          label: "Option 1",
          value: "Option 1"
        },
        {
          label: "Option 2",
          value: "Option 2"
        },
        {
          label: "Option 3",
          value: "Option 3"
        }
      ],
      remoteOptions: [],
      props: {
        value: "value",
        label: "label"
      },
      disabled: false,
      rules,
      fieldControl,
      remoteType: "systemData",
      remoteSelect,
      showIfArr,
      searchMultiple: false,
      showOther: false
    }
  },
  {
    label: "时间选择器",
    type: "time",
    options: {
      defaultValue: "",
      width: "",
      placeholder: "请选择时间",
      format: "HH:mm:ss",
      valueFormat: "HH:mm:ss",
      readonly: false,
      editable: true,
      clearable: true,
      disabled: false,
      rules,
      fieldControl: {
        updatecontrol: true,
        costcalculation: false,
        canimport: true,
        canexport: true,
        cansearch: true,
        isHighlight: false
      },
      showIfArr
    }
  },
  {
    label: "日期选择器",
    type: "date",
    options: {
      type: "date",
      defaultValue: "",
      width: "",
      placeholder: "请选择时间",
      format: "YYYY-MM-DD",
      readonly: false,
      editable: true,
      clearable: true,
      disabled: false,
      searchNotRange: true,
      rules,
      fieldControl: {
        keyfield: false,
        updatecontrol: true,
        checkrepeat: false,
        costcalculation: false,
        canimport: true,
        canexport: true,
        cansearch: true,
        isHighlight: false
      },
      showIfArr
    }
  },
  {
    label: "评分",
    type: "rate",
    options: {
      defaultValue: 0,
      max: 5,
      allowHalf: false,
      disabled: false,
      rules,
      fieldControl: {
        updatecontrol: true,
        canimport: true,
        canexport: true,
        cansearch: true,
        isHighlight: false
      },
      showIfArr
    }
  },
  {
    label: "下拉选择框",
    type: "select",
    options: {
      defaultValue: "",
      width: "200px",
      multiple: false,
      searchMultiple: false,
      placeholder: "",
      remote: true,
      showLabel: false,
      filterable: false,
      clearable: false,
      disabled: false,
      props: {
        label: "label",
        value: "value"
      },
      options: [
        {
          label: "Option 1",
          value: "Option 1"
        },
        {
          label: "Option 2",
          value: "Option 2"
        },
        {
          label: "Option 3",
          value: "Option 3"
        }
      ],
      remoteOptions: [],
      remoteFunc: "",
      rules,
      fieldControl,
      remoteType: "systemData",
      remoteSelect,
      isleftmenu: false,
      showIfArr
    }
  },
  {
    label: "开关",
    type: "switch",
    options: {
      defaultValue: false,
      disabled: false,
      activeText: "",
      inactiveText: "",
      activeValue: true,
      inactiveValue: false,
      rules,
      fieldControl: {
        checkrepeat: false,
        updatecontrol: true,
        costcalculation: false,
        canimport: true,
        canexport: true,
        cansearch: true,
        isHighlight: false
      },
      showIfArr
    }
  },
  {
    label: "滑块",
    type: "slider",
    options: {
      defaultValue: 0,
      width: "",
      min: 0,
      max: 100,
      step: 1,
      disabled: false,
      range: false,
      rules,
      fieldControl: {
        updatecontrol: true,
        costcalculation: false,
        canimport: true,
        canexport: true,
        cansearch: true,
        isHighlight: false
      },
      showIfArr
    }
  },
  {
    label: "文字",
    type: "text",
    options: {
      defaultValue: "This is a text",
      showIfArr
    }
  },
  {
    label: "链接",
    type: "link",
    options: {
      host: "https://rv.daochen.com", // 内部地址host
      text: "预览",
      target: "_blank",
      underline: true,
      disabled: false,
      type: "primary", // 可空，default/success/warning/danger/info
      showIfArr
    }
  }
];

export const advanceComponents = [
  {
    label: "附件",
    type: "img-upload",
    options: {
      defaultValue: [],
      name: "file",
      action: "", // http://example.com/upload
      method: "post",
      listType: "text",
      accept: null, //  accept: "image/*",
      limit: 3,
      multiple: false,
      disabled: false,
      rules,
      fieldControl: {
        updatecontrol: true,
        canimport: true,
        canexport: true,
        isHighlight: false
      },
      showIfArr
    }
  },
  {
    label: "富文本编辑器",
    type: "richtext-editor",
    options: {
      defaultValue: "",
      width: "",
      disabled: false,
      fieldControl: {
        updatecontrol: true,
        canimport: true,
        canexport: true,
        cansearch: true
      },
      showIfArr
    }
  },
  {
    label: "级联选择器",
    type: "cascader",
    options: {
      defaultValue: [],
      width: "200px",
      placeholder: "",
      disabled: false,
      clearable: false,
      filterable: false,
      remote: true,
      remoteOptions: [],
      props: {
        label: "label",
        value: "value",
        children: "children",
        checkStrictly: true
      },
      remoteFunc: "",
      rules,
      fieldControl,
      remoteType: "systemData",
      remoteDataShowTree,
      showIfArr
    }
  },
  {
    label: "表格",
    type: "table",
    nofield: true, // 非字段，不展示字段名和字段标签
    columns: [
      {
        label: "列1",
        name: "column1",
        list: []
      },
      {
        label: "列2",
        name: "column2",
        list: []
      }
    ],
    tableData: [
      {
        id: DcCommon.guid(),
        column1: "",
        column2: ""
      }
    ],
    options: {
      addBtn: true,
      delBtn: true,
      // importBtn: false,//导入暂未开发
      selection: true,
      index: true,
      showIfArr
    }
  },
  {
    label: "下拉树选择器",
    type: "treeselect",
    options: {
      defaultValue: [],
      placeholder: "请选择",
      multiple: false,
      searchMultiple: false,
      disabled: false,
      width: "200px",
      props: {
        parent: "parentId",
        label: "label",
        value: "value",
        children: "children"
      },
      remote: true,
      remoteOptions: [],
      remoteFunc: "",
      rules,
      fieldControl,
      remoteType: "systemData",
      remoteDataShowTree,
      isleftmenu: false,
      showIfArr
    }
  },
  {
    label: "列表选择器",
    type: "tableselect",
    options: {
      props: {
        label: "label",
        value: "value"
      },
      defaultValue: "",
      width: "200px",
      placeholder: "请选择",
      disabled: false,
      remote: true,
      multiple: false,
      searchMultiple: false,
      clearable: false,
      tableWidth: "800px",
      remoteOptions: [],
      remoteMethod: "GET",
      remoteFunc: "",
      rules,
      fieldControl,
      remoteType: "systemData",
      remoteDataShowTable,
      showIfArr
    }
  },
  {
    label: "省市区选择器",
    type: "areaselect",
    options: {
      defaultValue: [],
      width: "200px",
      placeholder: "请选择",
      disabled: false,
      rules,
      fieldControl,
      showLevel: 3, // 选择几级
      checkStrictly: true, // checkStrictly:是否严格的遵守父子节点不互相关联,true时可选择任意一级
      showIfArr
    }
  },
  {
    label: "坐标选择器",
    type: "bmapselect",
    options: {
      defaultValue: [],
      disabled: false,
      rules,
      fieldControl,
      showIfArr
    }
  },
  {
    label: "铁路车站",
    type: "railwaystation",
    options: {
      defaultValue: "",
      placeholder: "",
      width: "",
      clearable: false,
      readonly: false,
      disabled: false,
      rules,
      fieldControl,
      showIfArr
    }
  },
  {
    label: "铁路货物信息",
    type: "railwaygoods",
    options: {
      defaultValue: "",
      placeholder: "",
      width: "",
      clearable: false,
      readonly: false,
      disabled: false,
      rules,
      fieldControl,
      showIfArr
    }
  },
  {
    label: "资源Tab页面",
    type: "resourceTabPage",
    nofield: true,
    options: {
      type: "",
      closable: false,
      addable: false,
      tabPosition: "top",
      stretch: true,
      showIfArr: []
    },
    tabPaneOptions: [
      {
        label: "Tab",
        disabled: false,
        name: "tab",
        closable: false,
        lazy: false,
        resourceObjectId: "",
        resourceObjectItem: resourceObject,
        showIfArr: []
      }
    ]
  }
];

export const layoutComponents = [
  {
    label: "栅格布局",
    type: "grid",
    columns: [
      {
        span: 12,
        list: []
      },
      {
        span: 12,
        list: []
      }
    ],
    options: {
      showIfArr: [],
      gutter: 0,
      justify: "start",
      align: "top"
    }
  }
];

export const auxiliaryComponents = [
  {
    label: "提示",
    type: "alert",
    nofield: true, // 非字段，不展示字段名和字段标签
    options: {
      title: "标题",
      description: "描述",
      type: "success",
      effect: "light", // light/dark
      showicon: false, // 是否展示图标
      closable: false, // 是否可关闭
      showIfArr
    }
  },
  {
    label: "分割线",
    type: "divider",
    nofield: true, // 非字段，不展示字段名和字段标签
    options: {
      direction: "horizontal", // horizontal/vertical
      contentposition: "left", // left / right / center
      content: "分割线",
      showIfArr
    }
  },
  {
    label: "标题",
    type: "gap",
    nofield: true, // 非字段，不展示字段名和字段标签
    options: {
      content: "标题", // 内容
      type: "success", //  'success' | 'warning' | 'info' | 'error';
      position: "left", // 'left' | 'right' | 'top' | 'bottom';
      isBackground: true, // 是否有背景色
      radiusSize: 4, // 圆弧大小
      radiusWidth: 5 // 竖线宽度
    }
  },
  {
    label: "图片",
    type: "img-view",
    nofield: true, // 非字段，不展示字段名和字段标签
    options: {
      fileList: [],
      srcList: [],
      width: "100px", 
      height: "100px", 
      initialIndex: "0", // 预览图从第几个开始
      fit: "cover"
    }
  }
];
