import { PagedResultDto } from '@/utils/base-entity';
import BaseService from '@/api/baseService'; 
import {
  VisitRecordHeadCrud,
  VisitExtend,
  ReplyExtend,
  VisitRecordParam,
  VisitRecordHead,
  VisitStatisticsParam,
  VisitStatisticsResultDto
} from './types'

export default class ResourceVisitApi<T extends VisitExtend, RT = VisitExtend> {
  api = new BaseService('resource-visit')
  /**
   * 新增拜访记录
   * @param param
   * @returns
   */
  Create(param: VisitRecordHeadCrud<T>) {
    return this.api
      .Create(param)
      .then(res => (res?.data || false) as boolean)
      .catch(() => {
        return false
      })
  }
  /**
   * 新增拜访记录（回复，评价，受理）信息
   * @param recordId 拜访记录Id
   * @param param
   * @returns
   */
  CreateReply(recordId: string, param: ReplyExtend<RT>) {
    return this.api
      .OpionDefine(`${recordId}/create-reply`, param, 'POST', false)
      .then(res => (res?.data || false) as boolean)
      .catch(() => {
        return false
      })
  }
  /**
   * 分页查询拜访记录
   * @param param
   * @returns
   */
  Query(param: VisitRecordParam) {
    return this.api
      .Query(param)
      .then(res => (res?.data || {}) as PagedResultDto<VisitRecordHead<T, RT>>)
      .catch(() => {
        return {} as PagedResultDto<VisitRecordHead<T, RT>>
      })
  }
   /**
   * 拜访记录统计
   * @param param
   * @returns
   */
   Statistics(param: VisitStatisticsParam) {
    return this.api
    .OpionDefine(`query-statisitcs`, param, 'POST', false)
    .then(res => res)
    .catch(() => {
      return {} as PagedResultDto<VisitStatisticsResultDto>
    })
  }
}
