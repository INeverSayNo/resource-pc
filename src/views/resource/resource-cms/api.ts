import BaseService from "@/api/baseService";
import { PagedResultDto } from "@/utils/base-entity";
import {
  CmsHeadCrudDto,
  CmsHeadDto,
  CmsQueryParam,
  CmsReadRecords
} from "./types";

class ResourceCmsApi {
  api = new BaseService("resource-cms");

  /**
   * 创建
   * @param param
   * @returns
   */
  Create(param: CmsHeadCrudDto) {
    return this.api
      .Create(param)
      .then((res) => (res?.data || false) as boolean);
  }

  /**
   * 修改
   * @param id
   * @param param
   * @returns
   */
  Update(id: string, param: CmsHeadCrudDto) {
    return this.api
      .Update(id, param)
      .then((res) => (res?.data || false) as boolean);
  }

  /**
   * 删除
   * @param id
   * @returns
   */
  Delete(id: string) {
    return this.api.Delete(id).then((res) => (res?.data || false) as boolean);
  }

  /**
   * 根据Id,获取阅读记录
   * @param id
   * @returns
   */
  GetReadRecordsById(id: string) {
    return this.api
      .OpionDefine(`${id}/get-read-records`, "", "GET", false)
      .then((res) => (res?.data || []) as CmsReadRecords[]);
  }

  /**
   * 分页查询
   * @param param
   * @returns
   */
  Query(param: CmsQueryParam) {
    return this.api
      .Query(param)
      .then((res) => (res?.data || {}) as PagedResultDto<CmsHeadDto>);
  }

  /**
   * 获取当前登录账号必读且未读的信息
   * @returns
   */
  GetMustReadList() {
    return this.api
      .OpionDefine(`get-must-read-list`, "", "GET", false)
      .then((res) => (res?.data || []) as CmsHeadDto[]);
  }

  /**
   * 阅读信息
   * @param id
   * @returns
   */
  Read(id: string) {
    return this.api
      .OpionDefine(`${id}/read`, "", "POST", false)
      .then((res) => (res?.data || false) as boolean);
  }
}
const resourceCmsApi = new ResourceCmsApi();
export default resourceCmsApi;
