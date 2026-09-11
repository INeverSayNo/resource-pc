import {
  IFeatureRoleItem
} from "./types";
import { Rsp } from "../index/type";
import { BaseApi } from "@/request";
import { BASE_DATA_DCZY_URL } from "@/request/config";

interface FullRsp<T> extends Rsp<T> {
  result: T
}

const FeatureRolesManageApi = new BaseApi({
  baseURL: BASE_DATA_DCZY_URL,
  crypto: false,
  disableResponseError: true
});

function GetFeatureRoleList(params: any) {
  return FeatureRolesManageApi.get<FullRsp<{
    totalCount: number;
    items: IFeatureRoleItem[];
  }>>("/api/baseData/management/feature-roles", params);
}

function DeleteFeatureRole(id: string) {
  return FeatureRolesManageApi.delete(
    `/api/baseData/management/feature-roles/${id}`
  );
}

function CreateFeatureRole(payload: any) {
  return FeatureRolesManageApi.post(
    "/api/baseData/management/feature-roles",
    payload
  );
}

function updateFeatureRoleFeature(payload: any, id: string) {
  return FeatureRolesManageApi.put(
    `/api/baseData/management/feature-roles/${id}/feature`,
    payload
  );
}

export {
  GetFeatureRoleList,
  DeleteFeatureRole,
  CreateFeatureRole,
  updateFeatureRoleFeature
};
