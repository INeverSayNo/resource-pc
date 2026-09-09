import { BaseSearchParam } from '@/utils/base-entity'
interface VisitExtend {
  [key: string]: any
}

interface VisitRecordHead<T extends VisitExtend, RT = VisitExtend> {
  id?: string
  creationTime?: string
  creatorId?: string
  creatorName?: string
  lastModificationTime?: string
  lastModifierId?: string
  lastModifierName?: string
  businessId?: string
  businessName?: string
  visitDate?: string
  visitContent?: string
  visitUserId?: string
  visitUserName?: string
  visitExtendJson?: T
  replyExtendJson?: Array<ReplyExtend<RT>>
  [key: string]: any
}

type VisitRecordHeadCrud<T extends VisitExtend> = Omit<
  VisitRecordHead<T>,
  | 'id'
  | 'creationTime'
  | 'creatorId'
  | 'creatorName'
  | 'lastModificationTime'
  | 'lastModifierId'
  | 'lastModifierName'
  | 'replyExtendJson'
  | 'businessId'
  | 'visitExtendJson'
> & {
  businessId: string
  businessTypeId: string
  businessTbName: string
  visitExtendJson: T
}

type ReplyExtend<T> = {
  replyUserId?: string
  replyUserName?: string
  replyContent?: string
  replyDate?: string
  replyExtendJson?: T
}

type VisitRecordParam = {
  businessId?: string
  businessName?: string
  businessTypeId?: string
  businessTbName?: string
  KeyWords?:string
} & BaseSearchParam

type VisitStatisticsParam = {
  VisitBusinessType: 1 | 2
  AreaId: string | null
  UserId: string | null
  UserName: string | null
  VisitType: '到访' | '电话' | '微信'|null
  StartDate: string | null
  EndDate: string | null
}

type VisitStatisticsResultDto = {
  areaName: string
  userName: string
  visitType: string
  visitCount: number
}

export type {
  VisitRecordHead,
  VisitRecordHeadCrud,
  ReplyExtend,
  VisitRecordParam,
  VisitExtend,
  VisitStatisticsParam,
  VisitStatisticsResultDto
}
