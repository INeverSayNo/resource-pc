import { BaseApi } from '@/request'
import { ABPBASE_URL, USE_CRY_PTO } from '@/request/config'

export const getCompanyChoices = (isAccessControl: boolean, baseURL = ABPBASE_URL) =>
  new BaseApi({ baseURL, crypto: USE_CRY_PTO }).get<unknown[]>(
    '/api/BaseData/Organization/GetCompanyChoose',
    { isAccessControl },
    true
  )

export interface OrganizationTreeOptions {
  isAccessControl: boolean
  isFilterIsUsing: boolean
  isOA: boolean
  includeFunctional: boolean
}

export const getOrganizationTree = (
  options: OrganizationTreeOptions,
  baseURL = ABPBASE_URL
) =>
  new BaseApi({ baseURL, crypto: USE_CRY_PTO }).get<string>(
    '/api/BaseData/Organization/combo',
    options,
    true
  )
