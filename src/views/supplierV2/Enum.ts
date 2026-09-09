import { EnumEntity } from "@/utils/base-entity";
import CustomEnum from "@/utils/CustomEnum";

/**
 * 供应商性质
 */
class SupplierNature extends EnumEntity {
  Enum = {
    Enterprise: { id: 1, label: "企业" },
    Personal: { id: 2, label: "个体" }
  };
}
export const SupplierNatureEnum = new SupplierNature();
/**
 * 供应商按合作情况分类
 */
class SupplierType extends EnumEntity {
  Enum = {
    Ordinary: { id: 3, label: "一般供应商" },
    Special: { id: 1, label: "特殊供应商" },
    Strategy: { id: 2, label: "战略供应商" },
    Potential: { id: 4, label: "潜在供应商" }
  };
}
export const SupplierTypeEnum = new SupplierType();
/**
 * 供应商评级
 */
class AssessLevel extends EnumEntity {
  Enum = {
    S: { id: 1, label: "S级特殊供应商" },
    A: { id: 2, label: "A级优秀供应商" },
    B: { id: 3, label: "B级合格供应商" },
    C: { id: 4, label: "C级辅助供应商" },
    D: { id: 5, label: "D级不合格供应商" }
  };
}
export const AssessLevelEnum = new AssessLevel();
/**
 * 主营业务分类
 */
class BusinessType extends EnumEntity {
  Enum = {
    Highway: { id: 1, label: "公路业务", isPerson: true },
    Railway: { id: 2, label: "铁路业务" },
    Waterway: { id: 3, label: "水路业务", isPerson: true },
    International: { id: 4, label: "国际业务" },
    Warehouse: { id: 5, label: "仓储业务" },
    Stevedoring: { id: 6, label: "装卸业务", isPerson: true },
    Lease: { id: 7, label: "租赁业务" },
    OfficeConsumables: { id: 8, label: "办公耗材业务" },
    PaymentPlatform: { id: 9, label: "支付平台业务" },
    Other: { id: 10, label: "其他业务" }
  };
}
export const BusinessTypeEnum = new BusinessType();
/**
 * 企业供应商类型
 */
class EnterpriseBusinessType extends EnumEntity {
  Enum = {
    Transport: { id: 1, label: "运输" },
    Storage: { id: 2, label: "仓储" },
    Stevedoring: { id: 3, label: "装卸" },
    Lease: { id: 4, label: "租赁" },
    Office: { id: 5, label: "办公耗材" },
    Platform: { id: 6, label: "平台" },
    Other: { id: 7, label: "其他" }
  };
}
export const EnterpriseBusinessTypeEnum = new EnterpriseBusinessType();
/**
 * 个体供应商类型
 */
class PersonBusinessType extends EnumEntity {
  Enum = {
    Driver: { id: 1, label: "司机" },
    CarTeam: { id: 2, label: "车队" },
    Loader: { id: 3, label: "装卸工" },
    LoadTeam: { id: 4, label: "装卸队" },
    BoatOwner: { id: 5, label: "船东" }
  };
}
export const PersonBusinessTypeEnum = new PersonBusinessType();
/**
 * 证书类型
 */
class LicenceType extends EnumEntity {
  Enum = {
    Driving: { id: 1, label: "驾驶证" },
    Vehicle: { id: 2, label: "行驶证" },
    RoadTransportCf: { id: 3, label: "道路运输许可证" },
    QualificationCf: { id: 4, label: "从业资格证" },
    ShipOperationCf: { id: 5, label: "船舶营运证" },
    DangerousStorageCf: { id: 6, label: "危险品仓储经营许可证" }
  };
}
export const LicenceTypeEnum = new LicenceType();
/**
 * 供应商来源系统
 */
class SourceSys extends EnumEntity {
  Enum = {
    Default: { id: 0, label: "资源系统" },
    ERP: { id: 1, label: "ERP" },
    Regist: { id: 2, label: "自行注册" },
    Wlhy: { id: 3, label: "网络货运" },
    Customer: { id: 4, label: "客户系统" }
  };
}
export const SourceSysEnum = new SourceSys();
/**
 * 可接受结算方式
 */
class PaymentType extends EnumEntity {
  Enum = {
    Year: { id: 1, label: "年付" },
    Quarter: { id: 2, label: "季度付" },
    Month: { id: 3, label: "月付" },
    Cash: { id: 4, label: "现结" }
  };
}
export const PaymentTypeEnum = new PaymentType();
/**
 * 结算方式
 */
class SettleType extends EnumEntity {
  Enum = {
    TransferAccounts: { id: 1, label: "转账" },
    Cash: { id: 2, label: "现金" },
    PrePay: { id: 3, label: "预付" }
  };
}
export const SettleTypeEnum = new SettleType();
/**
 * 结算周期
 */
class SettleCycle extends EnumEntity {
  Enum = {
    Month: { id: 1, label: "月结" },
    Quarter: { id: 2, label: "季结" },
    Order: { id: 3, label: "票结" },
    Year: { id: 4, label: "年结" },
    Other: { id: 5, label: "其他" }
  };
}
export const SettleCycleEnum = new SettleCycle();
/**
 * 合同签约类型
 */
class ContractSignType extends EnumEntity {
  Enum = {
    New: { id: 1, label: "新签" },
    ReNew: { id: 2, label: "续签" },
    Postpone: { id: 3, label: "延期" },
    Once: { id: 4, label: "一次性" },
    Supplemental: { id: 5, label: "补充" }
  };
}
export const ContractSignTypeEnum = new ContractSignType();

/**
 * 审批状态
 */
class AuditStatus extends EnumEntity {
  Enum = {
    NotApproved: { id: 0, label: "未审批" },
    UnderApproved: { id: 1, label: "审批中" },
    Approved: { id: 2, label: "审批通过" },
    ApprovalFailed: { id: 3, label: "审批不通过" }
  };
}
export const AuditStatusEnum = new AuditStatus();

/**
 * 供应商标签类型
 */
export const SupplierTagTypeEnum = CustomEnum({
  BussinessType: { id: 1, label: "供应商类型" },
  VehicleType: { id: 2, label: "车辆类型" },
  ShipType: { id: 3, label: "船舶类型" },
  Contract: { id: 4, label: "合同客户" },
  MainBusiness: { id: 5, label: "主营业务" },
  ShipLoadWeight: { id: 6, label: "船舶载重" },
  CarLength: { id: 7, label: "车长" },
  Custom: { id: 98, label: "自定义" },
  Other: { id: 99, label: "其他" }
});
