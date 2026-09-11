import { IFeatureItem, IApplicationModuleItem, IApplicationItem } from "./types";
import { Rsp } from "../index/type";
import { BaseApi, FILE_URL, GETFILE_URL } from "@/request";
import { BASE_DATA_DCZY_URL } from "@/request/config";


interface FullRsp<T> extends Rsp<T> {
  result: T
}

const uploadSetting = {
  // 上传文件到该文件夹
  uploadFolder: "ResourceDiy",
  // uploadAction: `${FILE_URL}?folder=ResourceDiy`,
  uploadAction: `${FILE_URL}/ResourceDiy%2FIcon`,
  UploadGetUrl: `${GETFILE_URL}`,
  acceptTypes: "image/jpeg,image/png",
  maxSize: 1
};

const FeatureManageApi = new BaseApi({
  baseURL: BASE_DATA_DCZY_URL,
  crypto: false,
  disableResponseError: true
});

function GetFeatureList(params: any) {
  return FeatureManageApi.get<FullRsp<{
    totalCount: number;
    items: IFeatureItem[];
  }>>("/api/baseData/management/features", params);
}

function DeleteFeature(id: string) {
  return FeatureManageApi.delete(`/api/baseData/management/features/${id}`);
}

function CreateFeature(payload: any) {
  return FeatureManageApi.post("/api/baseData/management/features", payload);
}

function UpdateFeature(payload: any, id: string) {
  return FeatureManageApi.put(
    `/api/baseData/management/features/${id}`,
    payload
  );
}

function GetApplicationModuleList(params = { maxResultCount: 999, skipCount: 0 , applicationId:""}) {
  return FeatureManageApi.get<FullRsp<{
    totalCount: number;
    items: IApplicationModuleItem[];
  }>>("/api/baseData/management/application-modules", params);
}

function GetApplicationList(params = { maxResultCount: 999, skipCount: 0, code:"DCZY" }) {
  return FeatureManageApi.get<FullRsp<{
    totalCount: number;
    items: IApplicationItem[];
  }>>("/api/baseData/management/applications", params);
}

export {
  uploadSetting,
  GetFeatureList,
  DeleteFeature,
  CreateFeature,
  UpdateFeature,
  GetApplicationList,
  GetApplicationModuleList
};
