
import BaseService from "@/api/baseService";
import { PreviewImgItem } from './type';

const imagesApi = new BaseService('railway-image')

/**
 * 新增站点图片
 * @param param
 * @returns
 */
export function AddStationImages(param: any) {
  return imagesApi
    .OpionDefine(`create`, param, 'POST', false)
    .then(res => (res || {}))
}
/**
 * 查询站点图片
 * @param id
 * @returns
 */
export function GetStationImages(id: string) {
  return imagesApi
    .OpionDefine(`${id}/getbyid`, '', 'GET', false)
    .then(res => (res?.data || []) as Array<PreviewImgItem>)
}
/**
 * 删除
 * @param id
 * @returns
 */
export function DeleteStationImages(id: string) {
  return imagesApi
    .OpionDefine(`${id}/delete`, '', 'DELETE', false)
    .then(res => (res))
}