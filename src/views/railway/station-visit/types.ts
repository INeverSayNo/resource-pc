import CustomEnum from '@/utils/CustomEnum'
import ResourceVisitApi from '@/views/resource-visit/api'
import type { VisitRecordHead, VisitRecordHeadCrud } from '@/views/resource-visit/types'

const api = new ResourceVisitApi<StationVisitExtend>()
const env = (import.meta.env.VITE_ENV_TYPE as string) || "dev"
const resourceObject = {
  id:
    env === 'pro'
      ? '3a00ef85-a57a-dd67-3427-5e8d7a7bdf4a'
      : '3a00ab0e-1194-c042-89ad-becd2abb452d',
  tbName: 'ResourceDiy_RailWayStation'
}

type StationVisitExtend = {
  visitBusinessType?: number
  businessObjId?: string
  businessObjName?: string
  contact?: string
  contactPhone?: string
  visitType?: string
  nextVisitDate?: string
}

const VisitBusinessTypeEnum = CustomEnum({
  Station: { id: 0, label: '车站货场' },
  PrivateLine: { id: 1, label: '专用线' }
})
type StationVisitRecord = VisitRecordHead<StationVisitExtend>;
type StationVisitRecordCrud = VisitRecordHeadCrud<StationVisitExtend>

export type { StationVisitExtend, StationVisitRecord, StationVisitRecordCrud }
export { VisitBusinessTypeEnum, resourceObject, api }
