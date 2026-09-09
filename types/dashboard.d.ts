declare namespace Dashboard {
  interface ProvinceItem {
    provinceName: string;
    provinceLocation: BMapGL.Point | null;
    cityList: cityItem[];
  }
  interface cityItem {
    cityName: string;
    cityLocation: BMapGL.Point | undefined;
    stationList: StationItem[];
    portList: PortItem[];
  }
  interface StationItem {
    station: {
      id: string;
      cityLocation: string;
      railwayStationName: string;
      railwayStationCode: string;
      railwayStationDbm: string;
      address: string;
      containerSendHS: string;
      containerArriveHS: string;
      provinceName: string;
      provinceLocation: string;
      cityName: string;
      districtName: string;
      stationGrade: string;
      railwayLocation: string;
      isImportant: boolean;
      rate: number;
      stationLevelMark: string | null;
      stationLevelName: string | null;
      isContainer: null | boolean;
      formatLocation: BMapGL.Point;
    };
    zyxList: {
      id: string;
      stationId: string;
      stationName: string;
      name: string;
      num: string;
      transferMileage: number;
      arriveCategory: string;
      sendCategory: string;
      contacts: string | null;
      phone: string | null;
      address: string | null;
      containerSendHS: string;
      containerArriveHS: string;
    }[];
  }
  interface PortItem {
    station: {
      _id: string;
      id: string;
      portScale: string;
      portType: string;
      portName: string;
      portAreaName: string;
      provinceName: string;
      provinceLocation: string;
      cityName: string;
      cityLocation: string;
      areaId: string;
      areaName: string;
      areaUserId: string;
      areaUserName: string;
      areaUserTel: string;
      portSpecification: string;
      portAddress: string;
      portCoord: string;
      address: string;
      formatLocation: BMapGL.Point;
    };
    contact: {
      waterPortInfoId: string;
      contactId: object;
      contact: string;
      contactTel: string;
      serviceBrochure: string;
    }[];
  }
  /** 车站列表展示信息 */
  export interface RailwayStationDto {
    id: string;
    scopeOfBusiness?: string;
    railwayStationCode: string;
    railwayLocation: string;
    railwayStationDbm: string;
    railwayStationName: string;
    businessLimit: string;
    isImportant: boolean;
    rate: number;
    stationGrade: string;
    areaCompany: string;
    areaCompanyName: string;
    principalId: string;
    principalName: string;
    principalPhone: string;
    stationaryUserNames?: Array<string>;
    yardBusinessLmit: null;
    hasPricePolicy: boolean;
    hasPrivateLine: boolean;
    tags: Array<string>;
    railwayBureauCode: string;
    railwayBureauName: string;
    railwayTrainCode: string;
    railwayTrainName: string;
    provinceName: string;
    /** 图片数量 */
    pictureNum: number;
    cityName: string;
    districtName: string;
    /** 是否货运站 */
    isHyStation: boolean;
    /** 是否高铁 */
    isCrhExpress: boolean;
    /** 是否行包快运 */
    isHbExpress: boolean;
    /** 站点分级 */
    stationLevelMark: string;
    stationLevelName: string;
    levelSign: string;
    levelExHanding: string;
    levelHasStationary: string;
    levelHasSupplier: string;
    levelHasWarehouse: string;
    levelHasLoader: string;
    /** 站点性质 */
    stationNature: number;
    stationNatureName: string;
    distance: number;
    cmsNoReadNum: number;
    cmsNum: number;
    cmsReadNum: number;
    logisticCenterName: string | null;
    logisticCenterId: string | null;
    introduction: string;
    message: string;
    navigate: boolean | undefined;
  }

  /** 港口列表展示信息 */
  export interface WaterPortStationDto {
    /** Id */
    _id: string;
    /** 港口分级 */
    portScale: string;
    /** 港口分类名称  */
    portType: string;
    /** 港口名称  */
    portName: string;
    /** 港区名称 */
    portAreaName: string;
    /** 省，市，区 */
    portAddress: string;
    /** 坐标lat/lng */
    portCoord: string;
    /** 详细地址 */
    address: Address | undefined;
    /** 地址坐标Json */
    addressCode: string;
    /** 备注 */
    portSpecification: string;
    /** 归属区域id */
    areaId: string;
    /** 归属区域名称 */
    areaName: string;
    /** 区域负责人id */
    areaUserId: string;
    /** 区域负责人 */
    areaUserName: string;
    /** 区域负责人电话 */
    areaUserTel: string;
    /** 标签多个逗号分隔 */
    tags: boolean;
    /** 备注 */
    remark: boolean;
    /** 阅读次数 */
    viewCount: number;
    distance: number;
    navigate: boolean | undefined;
  }
  interface NearPortItem {
    _id: string;
    portScale: string;
    portType: string;
    portName: string;
    portAreaName: string;
    portAddress: string;
    portCoord: string;
    address: string;
    addressCode: object;
    portSpecification: object;
    areaId: string;
    areaName: string;
    areaUserId: string;
    areaUserName: string;
    areaUserTel: string;
    updateOrganizationName: object;
    viewCount: number;
    tags: object;
    remark: object;
    distance: number;
    distanceSort: number;
    isScrap: boolean;
    scraperId: object;
    scraperName: object;
    scrapTime: object;
    organizationId: string;
    organizationRelationshipId: string;
    organizationCode: string;
    organizationRelationshipCode: string;
    organizationName: string;
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
    id: object;
  }
  interface RailwayStationParam {
    page: number;
    pageSize: number;
    /** 路局编码*/
    railwayBureauCode?: string;
    /** 车务段*/
    railwayTrainCode?: string;
    /** 站点名称*/
    railwayStationName?: string;
    /** 站点编码 tmism*/
    railwayStationCode?: string;
    /** 站点代码*/
    railwayStationDbm?: string;
    /** 省*/
    provinceName?: string;
    /** 市*/
    cityName?: string;
    /** 是否货运*/
    isHyStation?: boolean;
    /** 是否高铁快运*/
    isCrhExpress?: boolean;
    /** 是否行包快运*/
    isHbExpress?: boolean;
    /** 是否与车站签订发运协议*/
    isAgreement?: boolean;
    /** 是否优势站点*/
    isAdvantage?: boolean;
    /** 是否有驻站人员*/
    isStationary?: boolean;
    areaCompanyId?: string;
    /** 集装箱办理*/
    isContainer?: boolean;
    /** 危险品办理 */
    isDanger?: boolean;
    /** 是否重要站点 */
    isImportant?: boolean;
    /** 站点属性 */
    stationProp?: string;
    /** 办理类型 */
    transactType?: string;
  }
  interface NearLocationPointParam {
    latitude?: number;
    longitude?: number;
    provinceCode?: string;
    provinceName?: string;
    stationId?: string;
    stationName?: string;
  }
  interface CmsHeadCrudDto {
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
  type IFiles = {
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

  interface CmsQueryParam extends BaseSearchParam {
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

  interface CmsHeadDto extends CmsHeadCrudDto {
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

  interface CmsReadRecords {
    id?: string;
    headId?: string;
    userId?: string;
    userName?: string;
    readDate?: string;
  }
  interface NavigationState {
    startPoint: {
      name: string;
      point: BMapGL.Point | null;
    };
    endPoint: {
      name: string;
      point: BMapGL.Point | null;
    };
    routeAddress: string;
    mapAutoCompleteInput: BMapGL.Autocomplete | null;
    mapRouteOverlays: {
      polyLine: BMapGL.Polyline | null;
      start: BMapGL.Marker | null;
      end: BMapGL.Marker | null;
    };
    mapAutoCompleteResult: {
      value: string;
    }[];
    mapAutoLoading: boolean;
    mapRouteDescription: string;
    existingRouteInfo: {
      polyLine: BMapGL.Polyline | null;
      marker: {
        start: BMapGL.Marker | null;
        end: BMapGL.Marker | null;
      };
    };
  }
}
