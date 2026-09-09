import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import { cloneDeep } from "lodash";
import { Address } from "./base-entity";
import { isExternal } from "./validate";
import { Ref, unref } from 'vue';
dayjs.extend(utc);

// 拷贝时间
function cloneDate(date) {
  const constructor = date.constructor;
  return new constructor(date.valueOf());
}

/**
 * 对象数组深拷贝
 * @param {Array,Object} source 需要深拷贝的对象数组
 * @param {Array} noClone 不需要深拷贝的属性集合
 */
export function deepClone<T = any>(source: any, noClone: string[] = []): T {
  if (noClone.length === 0) {
    return cloneDeep(source);
  }

  if (source == null) return source;
  if (!source && typeof source !== "object") {
    throw new Error("error arguments deepClone");
  }
  if (source instanceof Date) return cloneDate(source);
  const targetObj: any = source.constructor === Array ? [] : {};
  Object.keys(source).forEach((keys: string) => {
    if (
      source[keys] &&
      typeof source[keys] === "object" &&
      noClone.indexOf(keys) === -1
    ) {
      targetObj[keys] = deepClone(source[keys], noClone);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
}

/**
 * 查找数组对象的某个下标
 * @param {Array} ary 查找的数组
 * @param {Functon} fn 判断的方法
 */
export function findIndex(ary: any, fn: Function): number {
  if (ary.findIndex) {
    return ary.findIndex(fn);
  }
  let index = -1;
  ary.some((item: any, i: number, ary: any) => {
    const ret: any = fn(item, i, ary);
    if (ret) {
      index = i;
      return ret;
    }
  });
  return index;
}

/**
 * @param {String|Number} value 要验证的字符串或数值
 * @param {*} validList 用来验证的列表
 */
export function oneOf(
  value: string | number,
  validList: string[] | number[]
): boolean {
  for (let i = 0; i < validList.length; i++) {
    if (value === validList[i]) {
      return true;
    }
  }
  return false;
}

/**
 * 生成随机字符串
 */
export function toAnyString() {
  const str: string = "xxxxx-xxxxx-4xxxx-yxxxx-xxxxx".replace(
    /[xy]/g,
    (c: string) => {
      const r: number = (Math.random() * 16) | 0;
      const v: number = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString();
    }
  );
  return str;
}

/**
 * 截取URL参数
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url: string) {
  const search: string = url.split("?")[1];
  if (!search) {
    return {};
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, " ") +
    '"}'
  );
}

/**
 * @param {date} time 需要转换的时间
 * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss
 */
export function formatTime(time: any, fmt: string) {
  if (!time || time === "0001-01-01T00:00:00") return "";
  else {
    const date = new Date(time);
    const o = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "H+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
      "q+": Math.floor((date.getMonth() + 3) / 3),
      S: date.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (const k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  }
}

/**
 * @param {date} time 需要转换的时间
 * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss
 */
export function formatDateTime(time: any, fmt: string) {
  if (!time) return "";
  else {
    const date = new Date(time);
    return dayjs(date).format(fmt);
  }
}

export const validateObject = (rule: any, value: any, callback: Function) => {
  if (value && Object.keys(value).length > 0) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};

export const validatePhone = (rule: any, value: any, callback: Function) => {
  const reg =
    /^(((\+\d{2,3}-)?\d{2,3}-\d{7,8})|((\d{2,4}-)?\d{7,8})|((\+\d{2}-)?(\d{2,3}-)?(1[3-9][0-9]{9})))$/;
  if (value && !reg.test(value)) {
    callback(new Error(rule.message || "请输入正确格式的电话号码"));
  } else {
    callback();
  }
};

export const validateEn = (rule: any, value: any, callback: Function) => {
  const reg = /^[a-zA-Z]{1,50}$/;
  if (value && !reg.test(value)) {
    callback(new Error(rule.message || "只能输入英文字母"));
  } else {
    callback();
  }
};

export const validateWebUrl = (rule: any, value: any, callback: Function) => {
  // let strReg = "^((https|http|ftp|rtsp|mms)?://)";
  // strReg += "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?";
  // strReg += "(([0-9]{1,3}.){3}[0-9]{1,3}";
  // strReg += "|";
  // strReg += "([0-9a-z_!~*'()-]+.)*";
  // strReg += "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].";
  // strReg += "[a-z]{2,6})";
  // strReg += "(:[0-9]{1,4})?";
  // strReg += "((/?)|(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  // const reg = new RegExp(strReg);

  if (value && !isExternal(value)) {
    callback(new Error(rule.message || "请输入正确格式的网址信息"));
  } else {
    callback();
  }
};

export const validateIdCard = (rule: any, value: any, callback: Function) => {
  const reg =
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  if (value && !reg.test(value)) {
    callback(new Error(rule.message || "请输入正确格式的身份证号码"));
  } else {
    callback();
  }
};

export function validatorNoHZZM(rule: any, value: any, callback: Function) {
  // const reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
  // const regZm = /^[a-zA-Z]{1,50}$/;
  const reg = /.*[\u4e00-\u9fa5]+.*$/;
  const regZm = /.*[A-Za-z]+.*$/;
  if (!rule.required && !value) {
    callback();
    return;
  }
  if (reg.test(value) || regZm.test(value) || (value && value.length < 8)) {
    callback(new Error(rule.message || "请输入正确数字类型"));
  } else {
    callback();
  }
}

export const dateShortcuts = [
  {
    text: "最近一周",
    value: (() => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    })()
  },
  {
    text: "最近一个月",
    value: (() => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    })()
  },
  {
    text: "最近三个月",
    value: (() => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    })()
  }
];

export const addHeight = (item: any, maxHight: number, speed: number) => {
  let itemHeight = parseInt(item.style.height.replace(/[a-z]/gi, ""));
  if (itemHeight <= maxHight) {
    itemHeight = itemHeight + 1; // （每次增加改变像素的值）;
    item.style.height = itemHeight + "px";
    setTimeout(() => {
      addHeight(item, maxHight, speed);
    }, speed);
  }
};
export const subHeight = (item: any, minHight: number, speed: number) => {
  let itemHeight = parseInt(item.style.height.replace(/[a-z]/gi, ""));
  if (itemHeight > minHight) {
    itemHeight = itemHeight - 1; // （每次减小像素的值）
    item.style.height = itemHeight + "px";
    setTimeout(() => {
      subHeight(item, minHight, speed);
    }, speed);
  }
};

export const getTreeDataLabels = (
  data: any[],
  values: any,
  props: { value: string; label: string; children: string }
) => {
  if (!props) {
    props = { value: "value", label: "label", children: "children" };
  }
  const each = (eachData: any[], temp: any[]) => {
    eachData.forEach((item) => {
      temp.push({ value: item[props.value], label: item[props.label] });
      if (
        item[props.children] &&
        Array.isArray(item[props.children]) &&
        item[props.children].length > 0
      ) {
        each(item[props.children], temp);
      }
    });
  };
  const tempData: any = [];
  each(data, tempData);
  if (Array.isArray(values)) {
    return values.map((val) => {
      return (tempData.find((it: any) => it.value === val) || {}).label || "";
    });
  } else {
    return (tempData.find((it: any) => it.value === values) || {}).label || "";
  }
};

export const guid = () => {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
};

export function findLast(data: Array<any>, cb: Function) {
  const length = data.length;
  let index = length - 1;
  let result;
  for (; index >= 0; index--) {
    if (cb(data[index], index)) {
      result = data[index];
      break;
    }
  }
  return result;
}

export function isNilOrUndefined(obj: any) {
  return obj == null || obj === undefined;
}

export const isUrlPath = (args: any) => {
  if (args) {
    const lower = args.toLowerCase();
    return lower.startsWith("https://") || lower.startsWith("http://");
  }
  return false;
};

export function treeToList(
  data: any[],
  result: any[],
  key = "Id",
  childrenKey = "children"
) {
  data.forEach((item) => {
    if (!result.some((r) => r[key] === item[key])) {
      const temp = deepClone(item);
      delete temp[childrenKey];
      result.push(temp);
    }
    if (item[childrenKey] && item[childrenKey].length > 0) {
      treeToList(item[childrenKey], result, key, childrenKey);
    }
  });
  return result;
}

export function firstToLower(input: string) {
  const first = input?.substring(0, 1).toLocaleLowerCase();
  return `${first}${input?.substring(1)}`;
}

export function GetObjectByPath(data: any, path: string) {
  if (!path) return data;
  const pathArray = path.split(".");
  if (pathArray.length === 1) {
    return data[path];
  }
  let temp = data;
  pathArray.forEach((key) => {
    if (key) {
      const intKey = parseInt(key);
      if (isNaN(intKey)) {
        temp = temp[key];
      } else {
        temp = temp[intKey];
      }
    }
  });
  return temp;
}

export function SetObjectByPath(data: any, path: string, value: any) {
  if (!path) return;
  const pathArray = path.split(".");
  if (pathArray.length === 1) {
    data[path] = value;
  }
  let temp = data;
  pathArray.forEach((key, index) => {
    if (key) {
      if (isNaN(key as any)) {
        if (index === pathArray.length - 1) {
          temp[key] = value;
        } else {
          temp = temp[key];
        }
      } else {
        const intKey = parseInt(key);
        if (index === pathArray.length - 1) {
          temp[intKey] = value;
        } else {
          temp = temp[intKey];
        }
      }
    }
  });
}

export const getUrlParams = (url: string, name = "") => {
  const _url = url || window.location.href;
  const param = param2Obj(_url);
  if (name) return param[name] || ''
  return param;

  // const _urlParams = _url.match(/([?&])(.+?=[^&]+)/gim);
  // const param = _urlParams
  //   ? _urlParams.reduce((a: any, b: any) => {
  //       const value = b.slice(1).split("=");
  //       a[value[0]] = value[1];
  //       return a;
  //     }, {})
  //   : {};
  // if (name) return param[name] || "";
  // return param;
};

// 计算两点之间的执行距离
export function getDistance(
  startPiont: { lat: number; lng: number },
  endPoint: { lat: number; lng: number },
  unitStep = 1
) {
  return (
    Math.round(
      (distanceByLnglat(
        startPiont.lng,
        startPiont.lat,
        endPoint.lng,
        endPoint.lat
      ) /
        unitStep) *
      100
    ) / 100
  );
}

export function distanceByLnglat(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
) {
  const radLat1 = Rad(lat1);
  const radLat2 = Rad(lat2);
  const a = radLat1 - radLat2;
  const b = Rad(lng1) - Rad(lng2);
  let s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    );
  s = s * 6378137.0; // 取WGS84标准参考椭球中的地球长半径(单位:m)
  s = Math.round(s * 10000) / 10000;
  return s;
}

function Rad(d: number) {
  return (d * Math.PI) / 180.0;
}

export function numberVlaueSelectClear(obj: any, property: string) {
  delete obj[property];
}

export function GetAddress(address: string, needDefault = false) {
  try {
    return JSON.parse(address) as Address;
  } catch (error) {
    if (needDefault) {
      return {
        address: "",
        lat: "",
        lng: ""
      };
    }
    return undefined;
  }
}

export interface UserInfo {
  isIdentify: boolean;
  headImg?: string;
  aud: string;
  auth_time: number;
  client_id: string;
  email: string;
  erp_area_name: string;
  erp_area_id: string;
  email_verified: boolean;
  erp_is_manager: boolean;
  erp_org_code: string;
  erp_org_id: string;
  erp_org_name: string;
  erp_org_relation_code: string;
  erp_org_relation_id: string;
  erp_userid: string;
  erp_username: string;
  erp_useroaid: string;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  idp: string;
  iss: string;
  name: string;
  nbf: number;
  phone_number: string;
  phone_number_verified: boolean;
  preferred_username: string;
  role: string;
  sub: string;
  user_type: string;
  appids: string[];
}

// 获取缓存中的用户信息
export const GetUserInfo = () => {
  const euser = localStorage.getItem("CurUser");
  const curUser: UserInfo = euser ? JSON.parse(euser) : {};
  if (euser) {
    // curUser.appids = ["resource", "supplierClient"];
    return curUser;
  }
  return {} as UserInfo;
};

export function GetTotalRow(
  data: any[],
  totalRemakCol: string,
  exludeCol: string[] = []
) {
  if (data?.length) {
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    const total: any = {};
    const numKeys: string[] = [];
    keys
      .filter((x) => !exludeCol.includes(x))
      .forEach((key) => {
        if (key === totalRemakCol) {
          total[key] = "合计：";
        } else if (typeof firstRow[key] !== "number") {
          total[key] = "";
        } else {
          total[key] = 0;
          numKeys.push(key);
        }
      });
    data.forEach((row) => {
      numKeys.forEach((key) => {
        total[key] += Number(row[key]);
      });
    });
    data.push(total);
  }
}

type AddressObject = {
  province?: string;
  city?: string;
  county?: string;
  town?: string;
  village?: string;
};
export function GetAddressObject(address?: string) {
  if (!address) return undefined;
  const pattern =
    /(?<province>[^省]+自治区|.*?省|.*?行政区|.*?市)?(?<city>[^市]+自治州|.*?地区|.*?行政单位|.+盟|市辖区|.*?市|.*?县)?(?<county>[^县]+县|.+区|.+市|.+旗|.+海域|.+岛)?(?<town>[^区]+区|.+镇)?(?<village>.*)/;
  const result = address.match(pattern);
  if (result?.groups) {
    const zxs = ["北京市", "上海市", "天津市", "重庆市"];
    if (result.groups["province"].endsWith("市")) {
      if (!zxs.includes(result.groups["province"]) && !result.groups["city"]) {
        result.groups["city"] = result.groups["province"];
        result.groups["province"] = "";
      } else if (
        zxs.includes(result.groups["province"]) &&
        !result.groups["city"]
      ) {
        result.groups["city"] = result.groups["province"];
      }
    }
    return result.groups as AddressObject;
  }
  return undefined;
}

export const randomCode = (length = 6) => {
  const code = "abcdefghijklmnopqrstuvwxyz";
  return [...Array(length)]
    .map(() => code[Math.floor(Math.random() * code.length)])
    .join("");
};

export const useClickAway = (el: HTMLElement | Ref<HTMLElement> | Ref<null>, callback: () => void) => {
  document.addEventListener("click", (e) => {
    if (unref(el) && !unref(el)!.contains(e.target as Node)) {
      callback();
    }
  });
};
