import { BaseApi } from '@/request'
import { GATEWAY_URL, USE_CRY_PTO } from '@/request/config'

export interface OrgUser {
  id: string
  userName?: string
  phone?: string
  organizationName?: string
  currentAreaName?: string
  code?: string
  logonName?: string
}

interface OrgUserResponse {
  rows?: OrgUser[]
}

const api = new BaseApi({ baseURL: GATEWAY_URL, crypto: USE_CRY_PTO })

export const getOrgUsers = () =>
  api.get<OrgUserResponse>(
    '/api/BaseData/User/user-query',
    { distinct: true, page: 1, limit: 20000 },
    true
  )
