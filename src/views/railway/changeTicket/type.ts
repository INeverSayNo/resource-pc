export type EnumItem = Record<"label" | "value", string>;

export interface ChangeTicketDetail {
  fileAttachs: {
    id: string;
    fileGroupMark: object;
    fileGroupName: object;
    fileRealName: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    businessId: string;
    creationDate: string;
    remark: object;
    isScrap: boolean;
  }[];
  stationId: string;
  stationName: string;
  transportType: string;
  transportTypeName: string|null;
  changeCost: number;
  elapsedTime: number;
  changeType: number;
  contacts: string;
  phone: string;
  fileAttachIds: string;
  remark: string;
  isScrap: boolean;
  scraperId: object;
  scraperName: object;
  scrapTime: object;
  creatorName: string;
  lastModifierName: object;
  deleterName: object;
  isDeleted: boolean;
  deleterId: object;
  deletionTime: object;
  lastModificationTime: object;
  lastModifierId: object;
  creationTime: string;
  creatorId: string;
  id: string;
  unit:string | null
}
