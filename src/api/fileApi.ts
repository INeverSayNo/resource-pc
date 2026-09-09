import BaseService from './baseService'
import type { FileAttach } from '@/utils/base-entity'

const fileApi = new BaseService('file-attach')

export const GetFileListByIds = (ids: string[]) =>
  fileApi
    .OpionDefine<any>(`getbatches-by-id/${ids.join(',')}`, '', 'GET', false)
    .then((response) => (response?.data || []) as FileAttach[])

export const GetFileListByBusinessId = (businessId: string) =>
  fileApi
    .OpionDefine<any>(`${businessId}/get-by-business-id`, '', 'GET', false)
    .then((response) => (response?.data || []) as FileAttach[])
