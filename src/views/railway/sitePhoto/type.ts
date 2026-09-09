export interface PreviewImgItem {
  id: string;
  stationId: string;
  typeMark: string;
  typeName: string;
  fileId: string;
  fileGroupMark: string;
  fileGroupName: string;
  fileRealName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  createTime: string;
}

export interface UploadResponse {
  isFolder: boolean;
  path: string;
  name: string;
  size: number;
  creationDate: string;
  lastModifiedDate: string;
  metadata: { Id: string; DisplayName: string };
};

export interface ElementUploadResponse {
  name: string;
  percentage: number;
  status: string;
  size: number;
  raw: { uid: number };
  uid: number;
  url: string;
  response: UploadResponse;
};


export interface UploadSuccessParams {
  stationId: string;
  typeMark: string;
  typeName: string;
  imageFile: {
      id: string;
      fileGroupMark: string;
      fileGroupName: string;
      fileRealName: string;
      fileName: string;
      filePath: string;
      fileSize: number;
      fileType: string;
      creationDate: string;
  };
  resourceId?:string
  resourceName?:string
  id: string;
}