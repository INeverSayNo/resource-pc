
// 接口返回数据 外层
export interface ResourceObjWrap {
    resouceTopTypeName: string
    resourceTypeRelationShipCode: string
    sort: number
    resourceDiyList:Array<ResourceObjDiyItem>
}

export interface ResourceObjDiyItem {
    allFields: string | number | null
    iconCssClass: string | number | null
    iconFilePath: string | number | null
    resourceDiyObjectId: string
    resourceDiyObjectName: string
    resourceTypeId: string
    resourceTypeName: string
    resourceTypeRelationShipCode: string
    route: string | number | null
    searchFields: string | number | null
    sort: number
    widgetFormJson: string
}

export interface Rsp<T> {
    isSuccessful: boolean
    message: string | null
    multipleData: any
    multipleMessage: any
    data: T
}

