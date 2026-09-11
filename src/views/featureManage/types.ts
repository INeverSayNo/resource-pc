export interface IFeatureItem {
  id: string;
  applicationModuleId: string;
  code: string;
  name: string;
  controllerName: string;
  actionName: string;
  url: string;
  level: number;
  sort: number;
  remark: string;
  isMenu: boolean;
  isShortCut: boolean;
  parameters: string;
  icon: string;
}

export interface IApplicationModuleItem {
  applicationId: string;
  code: string;
  name: string;
  sort: number;
  isFreeze: boolean;
  icon: object;
  id: string;
}

export interface IApplicationItem {
  domain: string;
  visitUrl: object;
  code: string;
  name: string;
  isFreeze: boolean;
  sort: number;
  isOut: boolean;
  icon: string;
  systemTypeMark: string;
  systemTypeName: string;
  loginUrl: object;
  id: string;
  modules?: IApplicationModuleItem[];
}

export interface IFeatureGroupItem extends IApplicationItem {
  children: Array<IApplicationModuleItem & { children: IFeatureItem[] }>;
}
