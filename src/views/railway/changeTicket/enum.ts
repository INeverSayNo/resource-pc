import { EnumEntity } from "@/utils/base-entity";

// 换装方式
class ChangeTypeEnum extends EnumEntity {
  Enum = {
    OnStation: { id: 0, label: "站内", value: "onStation" },
    OutStation: { id: 1, label: "站外", value: "outStation" }
  };
}
export const changeType = new ChangeTypeEnum();

// 运输方式
class TransportTypeEnum extends EnumEntity {
  Enum = {
    Zc: { id: 1, label: "整车", value: "zc" },
    Jzx20: { id: 2, label: "20尺集装箱", value: "jzx20" },
    Jzx40: { id: 3, label: "40尺集装箱", value: "jzx40" },
    Jzx35: { id: 4, label: "35吨敞顶箱", value: "jzx35" },
    Pl: { id: 5, label: "批量快运", value: "pl" }
  };
}
export const transportType = new TransportTypeEnum();

// 费用单位
class UnitTypeEnum extends EnumEntity {
  Enum = {
    cartful: { id: 1, label: "元/车", value: "cartful" },
    boxful: { id: 2, label: "元/箱", value: "boxful" },
    tonful: { id: 3, label: "元/吨", value: "tonful" }
  };
}
export const unitType = new UnitTypeEnum();
