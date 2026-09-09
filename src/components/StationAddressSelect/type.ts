export interface StationRecordItem {
  nodeType: any;
  geom: any;
  name: string;
  tgsPointTypeId: number;
  tgsPointTypeName: string;
  province: string;
  city: string;
  district: string;
  address: string;
  latlng: string;
  id: string;
}

export interface IAddressState {
  address: string;
  lat: number | string;
  lng: number | string;
  adt: {
    province: string;
    city: string;
    district: string;
    town: string;
  };
}

export interface SearchRecordResponse {
  recordList: {
    recordType: number;
    recordName: string;
    value: string;
    valueId: string;
    latlng: string;
    province: string;
    city: string;
    district: string;
    creationTime: string;
    creatorId: string;
    createName: string;
    isScrap: boolean;
    id: string;
  }[];
  hotStation: {
    recordType: number;
    recordName: string;
    value: string;
    valueId: string;
    latlng: string;
    province: string;
    city: string;
    district: string;
    creationTime: string;
    creatorId: string;
    createName: string;
    isScrap: boolean;
    id: string;
  };
  hotPort: {
    recordType: number;
    recordName: string;
    value: string;
    valueId: string;
    latlng: string;
    province: string;
    city: string;
    district: string;
    creationTime: string;
    creatorId: string;
    createName: string;
    isScrap: boolean;
    id: string;
  };
}

export interface ChooseItem {
  province: string;
  lat: string | number;
  lng: string | number;
  city: string;
  district: string;
  typeId: number;
  address: string;
  id: string;
}
