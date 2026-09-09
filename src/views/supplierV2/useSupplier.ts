import { isUrlPath } from "@/utils";
import { Ref } from "vue";
import { BaseData, GetSystemBaseDataAsync } from "../../api/dictionaryApi";
import { GETFILE_URL } from "@/request";
import {
  GetSupplierByNature,
  GetSupplierTypeTree,
  QueryEnterprise,
  QueryPerson,
  supplierHeadApi
} from "./api";
import { SupplierNatureEnum } from "./Enum";

import {
  SupplierEnterpriseParamDto,
  SupplierHeadDto,
  SupplierPersonParamDto,
  SupplierTypeHeadDto
} from "./types";

export function useSupplier() {
  function loadData(
    query: SupplierEnterpriseParamDto | SupplierPersonParamDto,
    type: "person" | "enterprise",
    data: Ref<SupplierHeadDto[]>,
    total: Ref<number>,
    loading: Ref<boolean>
  ) {
    loading.value = true;
    if (type === "person") {
      QueryPerson(query as SupplierPersonParamDto)
        .then((res) => {
          data.value = res.items || [];
          total.value = res.totalCount;
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      QueryEnterprise(query as SupplierEnterpriseParamDto)
        .then((res) => {
          data.value = res.items || [];
          total.value = res.totalCount;
        })
        .finally(() => {
          loading.value = false;
        });
    }
  }
  /**
   * 根据Id,获取供应商信息，并处理图片数据
   * @param id
   * @returns
   */
  function GetSupplierById(id: string) {
    return supplierHeadApi.GetById(id).then((res) => {
      if (res?.isSuccessful) {
        const data = res.data as SupplierHeadDto;
        if (data.enterpriseExtend?.cmdcFile) {
          if (!isUrlPath(data.enterpriseExtend.cmdcFile.filePath)) {
            data.enterpriseExtend.cmdcFile.url = `${GETFILE_URL}${data.enterpriseExtend.cmdcFile.filePath}`;
          }
        }
        if (data.personExtend?.idCardBackFile) {
          if (!isUrlPath(data.personExtend.idCardBackFile.filePath)) {
            data.personExtend.idCardBackFile.url = `${GETFILE_URL}${data.personExtend.idCardBackFile.filePath}`;
          }
        }
        if (data.personExtend?.idCardFrontFile) {
          if (!isUrlPath(data.personExtend.idCardFrontFile.filePath)) {
            data.personExtend.idCardFrontFile.url = `${GETFILE_URL}${data.personExtend.idCardFrontFile.filePath}`;
          }
        }
        return data;
      }
      return {} as SupplierHeadDto;
    });
  }
  function GetBusinessTypeNamesAndValues(
    val: any[],
    supplierTypeData: SupplierTypeHeadDto[]
  ) {
    if (val?.length) {
      const names = val.map((v: string[]) => {
        return v
          .map((x) => {
            return supplierTypeData.find((y) => y.code === x)?.name;
          })
          .join("/");
      });
      const values = val.map((v: string[]) => {
        return v.join(".");
      });
      return {
        values: values.join("|"),
        names: names.join("|")
      };
    } else {
      return {
        values: "",
        names: ""
      };
    }
  }

  function GetMainBusiness(
    val: any[],
    supplierTypeData: SupplierTypeHeadDto[],
    baseData: BaseData[]
  ) {
    if (val) {
      const result: BaseData[] = [];
      val.forEach((v: string[]) => {
        v.forEach((x) => {
          const lb = supplierTypeData.find((y) => y.code === x)
            ?.linkBusinessType;
          if (lb) {
            const lbAry = lb.split(",");
            lbAry.forEach((l) => {
              if (!result.some((y) => y.value === l)) {
                const item = baseData.find((x) => x.value === l);
                if (item) result.push(item);
              }
            });
          }
        });
      });
      return result;
    }
    return [];
  }
  function loadTypeData(activeName: string, callback) {
    GetSupplierByNature(
      activeName === "enterprise"
        ? SupplierNatureEnum.Enum.Enterprise.id
        : SupplierNatureEnum.Enum.Personal.id,
      activeName,
      true
    ).then((res) => {
      if (res) {
        callback(res);
      }
    });
  }

  function loadTypeTreeData(callback) {
    GetSupplierTypeTree().then((res) => {
      callback(res);
    });
  }

  function loadBusinessData(callback?: any) {
    GetSystemBaseDataAsync("MainBusiness").then((res) => {
      if (callback) {
        callback(res);
      }
    });
  }
  return {
    loadData,
    GetSupplierById,
    GetBusinessTypeNamesAndValues,
    GetMainBusiness,
    loadTypeData,
    loadBusinessData,
    loadTypeTreeData
  };
}
