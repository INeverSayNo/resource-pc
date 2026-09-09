import { ElLoading } from "element-plus";
import { GetSupplierExistInfo } from "./api";

type Emit = (
  eventName:
    | "openDetailDialog"
    | "closeDialog"
    | "openEditDialog"
    | "clearSupplierId",
  ...arg: any
) => void;
export default function useSupplierIsExist(emit: Emit) {
  function supplierIsExist(
    supplierName: string,
    SupplierNature: number,
    callback: () => void
  ) {
    const loading = ElLoading.service({ text: "供应商查询中..." });
    GetSupplierExistInfo({
      supplierName,
      SupplierNature
    })
      .then((res) => {
        loading.close();
        if (res.data) {
          emit("openEditDialog", res.data);
        } else {
          callback();
          emit("clearSupplierId");
        }
      })
      .catch((err) => {
        console.log(err);
        callback();
        loading.close();
      });
  }

  return {
    supplierIsExist
  };
}
