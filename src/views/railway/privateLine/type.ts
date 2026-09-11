import type { FileAttach } from '@/utils/base-entity'
import type { RailWayPrivatelLine } from '@/views/railway/station/types'

export type PrivateLineStationType = 'all' | 'start' | 'arrive'

export interface PrivateLineQuery {
  page: number
  pageSize: number
  name?: string
  stationName?: string
  isSend?: boolean
  category?: string
  isContainer?: boolean
  isDanger?: boolean
}

export interface PrivateLineAttachment extends FileAttach {
  id?: string
  filePath?: string
  fileType?: string
  fileRealName?: string
}

export interface PrivateLineItem extends RailWayPrivatelLine {
  tags?: string[]
  fileAttach?: PrivateLineAttachment[]
  fileAttachIds?: string | string[]
  isScrap?: boolean
  scraperId?: string | null
  scraperName?: string | null
  scrapTime?: string | null
  organizationId?: string
  organizationRelationshipId?: string
  organizationCode?: string
  organizationRelationshipCode?: string
  organizationName?: string
  creatorName?: string
  lastModifierName?: string
  deleterName?: string | null
  isDeleted?: boolean
  deleterId?: string | null
  deletionTime?: string | null
  lastModificationTime?: string
  lastModifierId?: string
  creationTime?: string
  creatorId?: string
}
