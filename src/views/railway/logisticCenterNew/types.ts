export interface AddressInfo {
  address: string
  lat: string | number
  lng: string | number
  regionName?: string
}

export interface PageData<T> {
  totalCount: number
  items: T[]
  isSuccessful?: boolean
  message?: string | null
}

export interface PageQuery {
  page: number
  limit: number
}

export interface CenterQuery extends PageQuery {
  searchName: string
  railwayCompany: string
  province: string
  areaCompany: string
  addressDetail: string
}

export interface CenterListItem {
  id: string
  organizationName: string
  organizationCode?: string
  organizationAddressDetail?: string
  ourResponsibleRegionalCompanyName?: string
  belongRailwayCompany?: string
  firstPageImgUrl?: string
  dataCompletionDegree: number
  businessDepartmentCount: number
  stationCount: number
  businessDepartmentList: string[]
  stationList: string[]
  formatAddress?: AddressInfo
}

export interface FileInfo {
  fileName?: string | null
  filePath: string
  fileSize?: number
  fileType?: string | null
  url?: string
  name?: string
  path?: string
  uid?: string | number
}

export interface CenterDetail {
  id: string
  organizationName: string
  organizationCode?: string
  organizationAddressDetail?: string
  ourResponsibleRegionalCompanyId?: string
  ourResponsibleRegionalCompanyName?: string
  ourResponsibleUserId?: string
  ourResponsibleUserName?: string
  ourResponsibleUserPhone?: string
  belongRailwayCompany?: string | null
  province?: string
  remark?: string
  firstPageImgUrl?: string
  dataCompletionDegree: number
  businessDepartmentCount: number
  stationCount: number
  allDepartmentCount: number
  alreadyContactDepartmentCount: number
  allContactPersonCount: number
  alreadyContactPersonCount: number
  businessLabelList: string[]
  imgList: string[]
  otherImgInfoList?: FileInfo[]
  formatAddress?: AddressInfo
}

export interface VisitGraphItem {
  visitiDate?: string | null
  visitUserName: string
  visitUserOrgName?: string
  contactPhone?: string
  contactUserName: string
}

export interface OrganizationNode {
  id: string
  parentId?: string
  organizationType: number
  organizationName: string
  descendantCount?: number
  ourResponsibleUserName?: string
  ourResponsibleRegionalCompanyName?: string
  contactUserName?: string | null
  childList?: OrganizationNode[] | null
  visitRecordList?: VisitGraphItem[] | null
}

export interface OrganizationRelation {
  otherRelationList: unknown[]
  centerOrganizationList: OrganizationNode[]
}

export interface NamedItem {
  id: string
  name: string
  stationId?: string
}

export interface OrganizationListItem {
  id: string
  name: string
  addressDetail?: string
  contactPersonCount: number
  childInstitutionList: NamedItem[]
  childStationList: NamedItem[]
  ourResponsibleUserName?: string
  ourResponsibleUserId?: string
  ourResponsibleUserPhone?: string | null
  modifyTimeStr?: string
  serverTime?: string | null
  organizationType?: number
  formatAddress?: AddressInfo
}

export interface OrganizationDetail {
  id: string
  organizationName: string
  organizationCode?: string
  organizationRelationCode?: string
  organizationAddressDetail?: string
  organizationRelationName?: string
  ourResponsibleRegionalCompanyId?: string
  ourResponsibleRegionalCompanyName?: string
  ourResponsibleUserId?: string
  ourResponsibleUserName?: string
  ourResponsibleUserPhone?: string
  province?: string
  administrativeRegionCode?: string
  administrativeRegion?: string
  firstPageImgUrl?: string
  contactPersonCount?: number
  directContactPersonCount?: number
  remark?: string
  belongRailwayCompany?: string | null
  organizationType?: number
  serverTime?: string | null
  isContacted?: boolean
  childStationList?: Array<{
    id: string
    stationId: string
    stationName: string
  }>
  otherImgInfoList?: FileInfo[]
}

export interface StationOption {
  id: string
  label: string
}

export interface StationRecord {
  id: string
  railwayStationName: string
}

export interface ContactItem {
  id: string
  centerOrganizationId: string
  organizationRelationName?: string
  contactName: string
  contactMobilePhone?: string
  contactTelephone?: string
  contactDuty: string
  contactDutyDesc?: string
  roomNum?: string
  gender: number | null
  showAndCallingPhone: boolean
  creatorName?: string
  CreatorPhone?: string
}

export interface VisitFile {
  id: string
  filePath: string
}

export interface VisitRecord {
  id: string
  businessName?: string
  visitDate: string
  visitContent?: string
  visitUserName?: string
  visitExtendJson?: {
    contact?: string
    contactPhone?: string
    visitType?: string
  }
  fileAttachDtos?: VisitFile[]
}

export interface CenterLabel {
  id: string
  centerOrganizationId: string
  labelName: string
}

export interface CenterFormPayload {
  id: string
  organizationName: string
  organizationAddressDetail: string | null
  ourResponsibleRegionalCompanyId: string
  ourResponsibleRegionalCompanyName: string
  ourResponsibleUserId?: string
  ourResponsibleUserName?: string
  ourResponsibleUserPhone?: string
  belongRailwayCompany: string
  province: string
  remark: string
  organizationType: number
  firstPageImgUrl?: string
  otherImgInfoList?: FileInfo[]
  contributor: string
  contributionaTime: string
}

export interface OrganizationFormPayload {
  id?: string
  parentOrganizationId?: string
  organizationType: number
  organizationName: string
  organizationAddressDetail: string | null
  ourResponsibleRegionalCompanyId: string
  ourResponsibleRegionalCompanyName: string
  ourResponsibleUserId: string
  ourResponsibleUserName: string
  ourResponsibleUserPhone: string
  province: string
  remark: string
  serverTime: string
  contributor: string
  contributionaTime: string
  isContacted: boolean
}

export interface ContactFormPayload {
  id?: string
  centerOrganizationId: string
  contactName: string
  contactMobilePhone: string
  contactTelephone: string
  contactDuty: string
  contactDutyDesc: string
  roomNum: string
  gender: number
  contributor: string
  contributionaTime: string
}

export interface UploadedFile {
  name: string
  path: string
  size: number
  type?: string
  url?: string
  uid?: number | string
}

export const ORGANIZATION_TYPES = [
  { id: 0, label: '物流中心', color: '#00284f' },
  { id: 1, label: '职能机构', color: '#e36844' },
  { id: 2, label: '业务机构', color: '#81d3f8' }
] as const

export type EditorNode = CenterDetail | OrganizationNode | OrganizationListItem
