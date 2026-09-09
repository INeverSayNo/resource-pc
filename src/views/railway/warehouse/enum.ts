import { EnumEntity } from "@/utils/base-entity";

class WarehouseTypeEnum extends EnumEntity {
  Enum = {
    innerWarehouse: { id: 1, label: "站内仓库", value: 'innerWarehouse' },
    outerWarehouse: { id: 2, label: "站外仓库", value: 'outerWarehouse' },
    storageYard: { id: 3, label: "堆场", value: 'storageYard' },
    goodsShed: { id: 4, label: "货棚", value: 'goodsShed' }
  }
}
export const WarehouseType = new WarehouseTypeEnum();