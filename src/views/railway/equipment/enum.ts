import { EnumEntity } from "@/utils/base-entity";

class SiteTypeEnum extends EnumEntity {
  Enum = {
    station: { id: 1, label: "车站", value: "station" },
    warehouse: { id: 2, label: "仓库", value: "warehouse" }
  };
}
export const siteType = new SiteTypeEnum();