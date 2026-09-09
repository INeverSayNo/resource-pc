import { BaseApi, requireApiData } from '@/request'
import { FILE_URL, GETFILE_URL, OCR_URL, USE_CRY_PTO } from '@/request/config'

export const fileAction = FILE_URL

export interface IdCard {
  idNum: string
  name?: string
  sex?: string
  feteDay?: string
  feteDayFormat?: Date
  address?: string
  nation?: string
  dateOfIssue?: string
  dateOfIssueFormat?: Date
  expiryDate?: string
  expiryDateFormat?: Date
  issuingAuthority?: string
}

export interface BusinessLicense {
  orgName?: string
  legalPerson?: string
  address?: string
  effectiveEndDate?: string
  effectiveEndDateFormat?: Date
  licenseNumber?: string
  socialCreditCode?: string
}

const api = new BaseApi({ baseURL: OCR_URL, crypto: USE_CRY_PTO })
const normalizePath = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${GETFILE_URL}${path.startsWith('/') ? path : `/${path}`}`

const recognize = <T>(endpoint: string, path: string) =>
  requireApiData(api.post<T>(endpoint, { imageUrl: normalizePath(path) }, true))

export const OcrIdCardFont = (path: string) => recognize<IdCard>('/api/platform/ocr/idcard/front', path)
export const OcrIdCardBack = (path: string) => recognize<IdCard>('/api/platform/ocr/idcard/back', path)
export const OcrBuinessLicense = (path: string) =>
  recognize<BusinessLicense>('/api/platform/ocr/business-license', path)
