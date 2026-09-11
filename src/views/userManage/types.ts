export interface UserItem {
  logonName: string;
  code: string;
  userName: string;
  shortName: string;
  sourcePW: string;
  random: string;
  gender: boolean;
  idCard: string;
  email: object;
  telephone: string;
  phone: string;
  address: null | string;
  qq: object;
  bankName: string;
  bankAccount: string;
  createTime: string;
  isFreeze: boolean;
  freezeReason: null | string;
  remark: null | string;
  isOutSide: boolean;
  isSuperMgr: boolean;
  entryTime: string;
  entryCompanyId: string;
  entryCompanyCode: string;
  entryCompanyName: string;
  isInitPassword: boolean;
  status: number;
  transferDate: string;
  appKey: object;
  isAppEnable: object;
  appStartDate: object;
  appEndDate: object;
  accountType: number;
  positionId: string;
  id: string;
}

export interface IPositionItem {
  organizationRelationshipId: string;
  positionCategoryId: string;
  positionId: string;
  code: string;
  name: string;
  sort: number;
  lv: number;
  id: string;
}

export interface ISaveUserPayload {
  logonName: string;
  positionId: string;
  code: string;
  userName: string;
  password?: string;
  gender: boolean | null;
  phone: string;
  address: string;
  isOutSide: boolean;
  isSuperMgr: boolean;
  isFreeze: boolean;
  freezeReason: string;
  remark: string;
}
