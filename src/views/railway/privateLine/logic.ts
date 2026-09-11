import { GetAddress } from '@/utils'
import type { PrivateLineAttachment, PrivateLineQuery, PrivateLineStationType } from './type'

export interface PrivateLineFilters {
  stationType: PrivateLineStationType
  category: string
  useContainer: 'y' | 'n'
  useDanger: 'y' | 'n'
}

export const createPrivateLineQuery = (privateName: unknown = ''): PrivateLineQuery => ({
  page: 1,
  pageSize: 20,
  name: typeof privateName === 'string' ? privateName : '',
  stationName: ''
})

export const buildPrivateLineQuery = (
  query: PrivateLineQuery,
  filters: PrivateLineFilters
): PrivateLineQuery => {
  const params: PrivateLineQuery = {
    page: query.page,
    pageSize: query.pageSize,
    name: query.name?.trim(),
    stationName: query.stationName?.trim()
  }
  if (filters.stationType !== 'all') {
    params.isSend = filters.stationType === 'start'
    params.category = filters.category.trim()
    params.isContainer = filters.useContainer === 'y'
    params.isDanger = filters.useDanger === 'y'
  }
  return params
}

export const splitPrivateLineValues = (value?: string) =>
  (value || '')
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean)

export const normalizePrivateLineTags = (tags?: string[]) =>
  (Array.isArray(tags) ? tags : []).flatMap((tag) => splitPrivateLineValues(String(tag)))

export const getPrivateLineAddress = (address?: string) => {
  if (!address || address === 'null') return '地址收集中'
  return GetAddress(address)?.address || address
}

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp'])

export const isPrivateLineImage = (file: PrivateLineAttachment) => {
  const value = file.fileType || file.filePath || file.fileRealName || ''
  const fileExtension = value.split('?')[0].split('.').pop()?.toLowerCase() || ''
  return imageExtensions.has(fileExtension)
}
