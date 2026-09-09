import { EnumEntity } from "@/utils/base-entity";

/**
 * 运输类型
 */
class TransportType extends EnumEntity {
  Enum = {
    Railway: { id: 1, label: "铁路", icon: "train" },
    Waterway: { id: 3, label: "水路", tagType: "deliverCar" },
    highway: { id: 2, label: "公路", icon: "deliverCar" }
  };
}
export const TransportTypeEnum = new TransportType();

class SearchRecordType extends EnumEntity {
  Enum = {
    Railway: {
      id: 1,
      label: "铁路站点",
      icon: "railway"
    },
    Highway: {
      id: 2,
      icon: "record-address",
      label: "公路停车场"
    },
    Port: {
      id: 3,
      icon: "record-port",
      label: "港口码头"
    },
    Airport: {
      id: 4,
      icon: "record-airport",
      label: "机场"
    },
    Warehouse: {
      id: 5,
      icon: "record-warehouse",
      label: "物流仓储"
    },
    Address: {
      id: 99,
      icon: "record-address",
      label: "地址"
    }
  };
}

export const SearchRecordTypeEnum = new SearchRecordType();
