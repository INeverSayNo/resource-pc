const CurUser = JSON.parse(localStorage.getItem("CurUser") || "{}");
export const baseEntity = {
  isScrap: false,
  creatorName: CurUser.given_name || "",
  createOrgId: CurUser.erp_org_id || "",
  createOrgName: CurUser.erp_org_name || "",
  LastModifierId: CurUser.erp_userid,
  CreatorId: CurUser.erp_userid
};

export const mongoBaseEntity = {
  IsScrap: false,
  CreatorName: CurUser.given_name || "",
  CreateOrgId: CurUser.erp_org_id || "",
  CreateOrgName: CurUser.erp_org_name || "",
  LastModifierId: CurUser.erp_userid,
  CreatorId: CurUser.erp_userid
};

export interface Entity {
  isScrap?: boolean;
  creatorName?: string;
  createOrgId?: string;
  createOrgName?: string;
  LastModifierId?: string;
  CreatorId?: string;
}

export interface BaseFullEntity {
  id?: string;
  isScrap?: boolean;
  creatorName?: string;
  createOrgId?: string;
  createOrgName?: string;
  LastModifierId?: string;
  CreatorId?: string;
}
export interface BaseCrudEntity {
  isScrap?: boolean;
}
export interface BaseEntity {
  id?: string;
  isScrap?: boolean;
}

export interface BasePageResultEntity<T> {
  isSuccessful?: boolean;
  message?: string;
  totalCount?: number;
  items?: Array<T>;
}

export interface BaseSearchParam {
  sumfield?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  totalRowsCount?: number;
  IsExport?: boolean;
  IsAllPage?: boolean;
  total?: number;
  totalpagecount?: number;
}

type EnumItemValueType = { id: any; label: string; [xkey: string]: any };

type EnumItemType = {
  [key: string]: EnumItemValueType;
};

export class EnumEntity {
  Enum: EnumItemType;
  constructor(inpt?: EnumItemType) {
    this.Enum = inpt || {};
  }
  getSelf = (id: number): EnumItemValueType => {
    let self = { id: -1, label: "" };

    for (const key in this.Enum) {
      if (
        (this.Enum[key].id ||
          (typeof this.Enum[key].id === "number" && this.Enum[key].id === 0)) &&
        this.Enum[key].id === id
      ) {
        self = { ...this.Enum[key] };
        break;
      }
    }
    return self;
  };
  getArray = (param?: object): Array<EnumItemValueType> => {
    const result: any = [];
    for (const key in this.Enum) {
      if (
        this.Enum[key].id ||
        (typeof this.Enum[key].id === "number" && this.Enum[key].id === 0)
      ) {
        if (param) {
          const checkAry = Object.keys(param).map((key2) => {
            return this.Enum[key][key2] === param[key2];
          });
          if (checkAry.every((x) => x)) {
            result.push({ ...this.Enum[key] });
          }
        } else {
          result.push({ ...this.Enum[key] });
        }
      }
    }
    return result;
  };
}

export interface FileAttach {
  id?: string;
  fileRealName?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  creationDate?: string;
  [key: string]: any;
}
/**
 * 性别
 */
class Sex extends EnumEntity {
  Enum = {
    Man: { id: 0, label: "男" },
    Female: { id: 1, label: "女" }
  };
}
export const SexEnum = new Sex();
/**
 * 对公账户
 */
class AccountType extends EnumEntity {
  Enum = {
    Company: { id: 1, label: "对公" },
    Person: { id: 2, label: "对私" }
  };
}
export const AccountTypeEnum = new AccountType();
/**
 * 币种
 */
class Currency extends EnumEntity {
  Enum = {
    CNY: { id: 1, label: "人民币" },
    USD: { id: 2, label: "美元" },
    EUR: { id: 3, label: "欧元" }
  };
}
export const CurrencyEnum = new Currency();
/**
 * 审核状态
 */
class ApprovalStatus extends EnumEntity {
  Enum = {
    NotApproved: { id: 0, label: "未审批" },
    UnderApproved: { id: 1, label: "审批中" },
    Approved: { id: 2, label: "审批通过" },
    ApprovalFailed: { id: 3, label: "审批不通过" }
  };
}
export const ApprovalStatusEnum = new ApprovalStatus();
/**
 * 消息类型
 */
class MsgPushType extends EnumEntity {
  Enum = {
    Weixin: { id: 1, label: "微信" },
    SMS: { id: 2, label: "短信" },
    Notice: { id: 3, label: "站内通知" }
  };
}
export const MsgPushTypeEnum = new MsgPushType();

export interface PagedResultDto<T> {
  totalCount: number;
  items?: T[];
  isSuccessful: boolean;
  message: string;
}

export interface Address {
  address: string;
  lat: string;
  lng: string;
}
