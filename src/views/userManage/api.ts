
import { UserItem, IPositionItem } from "./types";
import { Rsp } from "../index/type";
import { BaseApi } from "@/request";
import { BASE_DATA_DCZY_URL } from "@/request/config";

const UserManageApi = new BaseApi({
  baseURL: BASE_DATA_DCZY_URL,
  crypto: false,
  disableResponseError: true
});

interface FullRsp<T> extends Rsp<T> {
  result: T;
}

function GetUserList(params: any) {
  return UserManageApi.get<
    FullRsp<{
      totalCount: number;
      items: UserItem[];
    }>
  >("/api/baseData/management/users", params);
}

function GetAllPositions(
  params = { maxResultCount: 999, skipCount: 0, filter: "DCZY" }
) {
  return UserManageApi.get<
    FullRsp<{
      totalCount: number;
      items: IPositionItem[];
    }>
  >("/api/baseData/management/positions", params);
}

function DeleteUser(id: string) {
  return UserManageApi.delete(`/api/baseData/management/users/${id}`);
}

function CreateUser(payload: any) {
  return UserManageApi.post("/api/baseData/management/users", {
    ...payload,
    isOutSide: true
  });
}

function UpdateUser(payload: any, id: string) {
  return UserManageApi.put(`/api/baseData/management/users/${id}`, payload);
}

function ResetPassword(userId: string, password: string) {
  return UserManageApi.post("/api/baseData/management/users/reset-password", {
    userId,
    password
  });
}

export {
  GetUserList,
  GetAllPositions,
  DeleteUser,
  ResetPassword,
  CreateUser,
  UpdateUser
};
