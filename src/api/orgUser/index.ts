import { BaseApi } from '@/request'
import { ABPBASE_URL, GATEWAY_URL, USE_CRY_PTO } from '@/request/config'

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
  total?: number
}

const api = new BaseApi({ baseURL: GATEWAY_URL, crypto: USE_CRY_PTO })
const abpApi = new BaseApi({
  baseURL: ABPBASE_URL,
  crypto: USE_CRY_PTO
})
async function GetOrgUsers(params = {}, method: 'get' | 'post' = 'get') {
  return api[method]<OrgUserResponse>(
    '/api/BaseData/User/user-query',
    { distinct: true, page: 1, limit: 20000, ...params },
    true
  )
}

async function GetDcAreas(params: any) {
  return abpApi.get('/api/BaseData/Organization/GetAreas', params)
}

async function GetOrgList() {
  return abpApi.get('/api/BaseData/Organization/combo')
}

export { GetDcAreas, GetOrgUsers, GetOrgList }
