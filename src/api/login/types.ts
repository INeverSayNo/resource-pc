export interface LoginCredentials {
  username: string
  password: string
}

export type OaLoginCredentials = LoginCredentials

export interface LinkedAccount {
  id: string
  areaName?: string
  organizationName?: string
}

export interface BackendMenuNode {
  featureUrl?: string
  featureName?: string
  featureControllerName?: string
  featureIsMenu?: boolean
  featureIsShortCut?: boolean
  childModules?: BackendMenuNode[]
  menuCode?: string
  code?: string
  name?: string
  icon?: string
  menuIcon?: string
}

export type BackendMenuResponse = BackendMenuNode[] | BackendMenuNode | string
