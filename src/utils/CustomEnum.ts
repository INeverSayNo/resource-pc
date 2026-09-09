// #region  自定义枚举
export type EnumItemType = {
  id: string | number;
  label: string;
  [key: string]: any;
};
type EnumTypeConstraint = {
  [key: string]: EnumItemType;
};
type EnumType<T extends EnumTypeConstraint> = {
  [P in keyof T]: T[P];
};

class CustomEnumItem<T extends EnumTypeConstraint> {
  private Enum: EnumType<T>;
  constructor(enumOptions: EnumType<T>) {
    this.Enum = enumOptions;
    Object.keys(enumOptions).forEach((key) => {
      if (!["Enum", "getSelf", "getArray"].includes(key)) {
        this[key] = this.Enum[key].id;
      }
    });
  }
  getSelf = (id: number | string) => {
    let self: EnumItemType = { id: -1, label: "" };
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
  getArray = () => {
    const result: EnumItemType[] = [];
    for (const key in this.Enum) {
      if (
        this.Enum[key].id ||
        (typeof this.Enum[key].id === "number" && this.Enum[key].id === 0)
      ) {
        result.push({ ...this.Enum[key] });
      }
    }
    return result;
  };
}
// eslint-disable-next-line no-unused-vars
type ExtendedProperties<T> = { [P in keyof T]: number | string };

export default function CustomEnum<T extends EnumTypeConstraint>(
  enumOptions: EnumType<T>
): CustomEnumItem<T> & ExtendedProperties<T> {
  return new CustomEnumItem<T>(enumOptions) as CustomEnumItem<T> &
    ExtendedProperties<T>;
}
// #endregion
