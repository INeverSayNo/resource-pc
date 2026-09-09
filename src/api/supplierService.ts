import BaseService from './baseService'
import { SYSTEM_BASE_DATA_URL } from '@/request/config'

export default class SupplierBaseService extends BaseService {
  constructor(controller: string) {
    super(controller, 'supplier', SYSTEM_BASE_DATA_URL)
  }
}
