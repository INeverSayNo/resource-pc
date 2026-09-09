import { BaseSearchParam, FileAttach } from "@/utils/base-entity";

export interface CmsHeadCrudDto {
  title?: string;
  keywords?: string;
  uri?: string;
  files?: Array<IFiles>;
  remark?: string;
  businessTypeMark?: string;
  businessTypeName?: string;
  businessId?: string;
  businessName?: string;
  mustRead?: boolean;
  releaseDate?: string;
  validDate?: string;
  isRelease?: boolean;
}
export type IFiles = {
  isScrap?: boolean;
  id?: string;
  fileGroupMark?: string;
  fileGroupName?: string;
  fileRealName?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  businessId?: string;
  creationDate?: string;
  remark?: string;
} & FileAttach;

export interface CmsQueryParam extends BaseSearchParam {
  mustRead?: boolean;
  businessId?: string;
  businessName?: string;
  businessTypeId?: string;
  remark?: string;
  keywords?: string;
  title?: string;
  validDate?: string[];
  releaseDate?: string[];
  /** 阅读状态，已读/未读/全部 */
  readStatus?: string;
  isManager?: boolean;
}

export interface CmsHeadDto extends CmsHeadCrudDto {
  id: string;
  creationTime: string;
  creatorId: string;
  creatorName: string;
  lastModificationTime?: string;
  lastModifierName?: string;
  lastModifierId?: string;
  selfIsRead: boolean;
  readerNum: number;
  files?: Array<IFiles>;
  readRecords?: Array<CmsReadRecords>;
}

export interface CmsReadRecords {
  id?: string;
  headId?: string;
  userId?: string;
  userName?: string;
  readDate?: string;
}
