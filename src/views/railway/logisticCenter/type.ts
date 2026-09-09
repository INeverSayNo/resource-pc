export interface LogisticCenterItem {
  contactsList: object;
  id: string;
  name: string;
  address: { address: string; lat: string; lng: string };
  province: string;
  contacts: string;
  phone: string;
  remark: string;
  principalUserId: object;
  principalUserName: object;
  principalUserPhone: object;
  mpUserId: string;
  mpUserName: object;
  mpDateTime: string;
}

export interface LogisticCenterDetail {
  contactsList: {
    id: string;
    centerId: string;
    contacts: string;
    mobilePhone: string;
    telPhone: string | null;
    duty: string;
    remark: string;
    serviceTime: string;
    isValid: boolean;
    mpUserId: string;
    mpUserName: object;
    mpDateTime: string;
  }[];
  id: string;
  name: string;
  address: {
    address: string;
    lat: string;
    lng: string;
    regionName: string | null;
  };
  province: string;
  contacts: string;
  phone: string;
  remark: string;
  principalUserId: string | null;
  principalUserName: string | null;
  principalUserPhone: string | null;
  mpUserId: string;
  mpUserName: string | null;
  mpDateTime: string;
}

export interface DepartmentItem {
  id: string; // 联系人Id
  centerId: string; // 物流中心Id
  contacts: string; // 营业部联系人
  mobilePhone: string; // 营业部手机
  telPhone: string; // 营业部座机
  duty: string; // 营业部联系人职务
  remark: string; // 营业部联系人备注、负责业务
  serviceTime: string; // 营业部服务时间
  isValid: boolean; // 是否验证
  mpUserId: string; // 维护人员Id
  mpUserName: string; // 维护人员名称
  mpDateTime: string; // 维护时间
  businessOrgName: string; // 所属营业部名称
  stationIds: string; // 站点Ids
  stationNames: string; // 站点名称
  principalUserId: string; // 我司负责人Id
  principalUserName: string; // 我司负责人姓名
  principalUserPhone: string; // 我司负责人电话
}

export interface UploadRsp {
  FileRealName: string;
  FileName: string;
  FilePath: string;
  FileSize: number;
  FileType: string;
}

export interface UploadBusinessOrgRsp {
  id: string;
  centerId: string;
  businessOrgName: string;
  businessOrgAddress: {
    address: string;
    lat: string;
    lng: string;
    regionName: string;
  };
  contacts: string;
  mobilePhone: string;
  telPhone: string;
  duty: string;
  remark: string;
  serviceTime: string;
  stationIds: string;
  stationNames: string;
  principalUserId: string;
  principalUserName: string;
  principalUserPhone: string;
  isScrap: boolean;
  isValid: boolean;
  mpUserId: string;
  mpUserName: object;
  mpDateTime: string;
}

export interface BusinessOrgItem {
  id: string;
  centerId: string;
  businessOrgName: string;
  businessOrgAddress: {
    address: string;
    lat: string;
    lng: string;
    regionName: string;
  };
  contacts: string;
  mobilePhone: string;
  telPhone: string;
  duty: string;
  remark: string;
  serviceTime: string;
  stationIds: string;
  stationNames: string;
  principalUserId: string;
  principalUserName: string;
  principalUserPhone: string;
  isScrap: boolean;
  isValid: boolean;
  mpUserId: string;
  mpUserName: string | null;
  mpDateTime: string;
}
