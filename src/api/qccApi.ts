import { BaseApi, requireApiData } from '@/request'
import { SYSTEM_BASE_DATA_URL, USE_CRY_PTO } from '@/request/config'

const api = new BaseApi({ baseURL: SYSTEM_BASE_DATA_URL, crypto: USE_CRY_PTO })

export const GetCompanyAutoAsync = (name: string) =>
  requireApiData(
    api.get<any>(`/api/supplier/qcc/get-companyname-list/${encodeURIComponent(name)}`, undefined, true)
  ).then((response) => response?.data)

export const GetCompanyBaseDetailAsync = (name: string) =>
  requireApiData(
    api.get<any>(
      `/api/supplier/qcc/get-companyinfo-byfullname/${encodeURIComponent(name)}`,
      undefined,
      true
    )
  )
