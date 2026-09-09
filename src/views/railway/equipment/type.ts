export interface EquipmentItem {
  id: string;
  equipmentType: string;
  equipmentTypeName: string;
  siteType: string;
  siteTypeName: string;
  siteId: string;
  siteName: string;
  liftingWeight: number;
  num: number;
  efficiency: number;
  applyScope: string;
  remark: string;
  fileAttachIds: string;
  creationTime: string;
  creatorId: string;
  creatorName: string;
  scraperId: string;
  scrapTime: string;
  isScrap: boolean;
  lastModifierName: object;
  lastModificationTime: object;
  lastModifierId: object;
  fileAttachs: {
    isScrap: boolean;
    id: string;
    fileGroupMark: string;
    fileGroupName: string;
    fileRealName: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    businessId: string;
    creationDate: string;
    remark: string;
  }[];
}
