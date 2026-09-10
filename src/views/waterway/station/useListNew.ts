import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DcDeep } from '@dczy/tie-tools'
import { queryPorts } from '@/api/waterway-port'
import { getSystemDataShow } from '@/api/systemDataShowApi'
import { RequestScope } from '@/request'
import type { DCTableColumn } from '@/components/DCLayout/store'
import DcLayout from '@/components/DCLayout/indexExtented.vue'
import { createPrivatePhone } from '@/components/PrivatePhone/createPrivatePhone'
import { useStatisticTrace } from '@/hooks/useStatisticTrace'
import { useUserStore } from '@/store/modules/user'
import { useWaterwayStationStore } from './store/index'
import type { WaterwayQueryDto, WaterwayStationDto } from './types'

type SelectOption = Record<'value' | 'text', string>

export const stationGradeOptions = [
  '长江港口',
  '沿海港口',
  '京杭港口',
  '珠江港口',
  '四川水域港口',
  '赣江港口',
  '松花江港口',
  '汉江港口'
]

export const stationScaleOptions = [
  { label: '核心', value: '核心' },
  { label: '重要', value: '重要' },
  { label: '普通', value: '普通' },
  { label: '待开发港口', value: '待开发港口' }
]

const createDefaultQuery = (): WaterwayQueryDto => ({ page: 1, pageSize: 20 })

const formatAddress = (row: WaterwayStationDto): string => {
  const region = (row.PortAddress || '').replace(/^(重庆市|北京市|天津市|上海市),/, '')
  if (!row.Address) return region
  try {
    const parsed = JSON.parse(row.Address) as { regioname?: string; address?: string }
    return `${region}${parsed.regioname || parsed.address || ''}`
  } catch {
    return `${region}${row.Address}`
  }
}

export function useWaterwayPortList() {
  const layoutRef = ref<InstanceType<typeof DcLayout>>()
  const router = useRouter()
  const stationStore = useWaterwayStationStore()
  const userStore = useUserStore()
  const { SetTrace } = useStatisticTrace()
  const requestScope = new RequestScope()
  let requestSequence = 0

  const list = ref<WaterwayStationDto[]>([])
  const loading = ref(false)
  const total = ref(0)
  const provinceOptions = ref<SelectOption[]>([])
  const cityOptions = ref<SelectOption[]>([])
  const param = ref<WaterwayQueryDto>(createDefaultQuery())

  const loadOptions = async (mark: string, payload: Record<string, string> = {}) => {
    try {
      const data = await getSystemDataShow(mark, '', 0, 0, JSON.stringify(payload))
      return (data || []).map((item) => ({ text: String(item.label), value: String(item.label) }))
    } catch {
      return [] as SelectOption[]
    }
  }

  const initProvince = async () => {
    provinceOptions.value = await loadOptions('RailWayProvinceDictionary', { SSLJ: '' })
  }

  const initCity = async (province = '') => {
    cityOptions.value = await loadOptions(
      'RailWayProvinceCityTree',
      province ? { ProvinceShortName: province } : {}
    )
  }

  const handleChangeProvince = (province?: string) => {
    param.value.cityName = ''
    void initCity(province || '')
  }

  const loadData = async () => {
    const sequence = ++requestSequence
    requestScope.renew()
    loading.value = true
    const query = DcDeep.clone<WaterwayQueryDto>(param.value)
    query.address = [query.deptName, query.cityName].filter(Boolean).join(',')
    const isFirstPage = query.page === 1

    const [error, data] = await queryPorts(query, {
      signal: requestScope.withSignal({}).signal
    })
    if (sequence !== requestSequence) return
    loading.value = false
    if (error) return
    total.value = data?.totalCount || 0
    list.value = data?.items || []
    if (isFirstPage) await nextTick(() => layoutRef.value?.getTableHeight())
    SetTrace('$SELECT', '水运港口', '水运港口查询')
  }

  const handleSearch = (value?: MouseEvent | string) => {
    if (typeof value === 'string') param.value.portName = value
    param.value.page = 1
    void loadData()
  }

  const handlePageChange = (page: number, pageSize: number) => {
    param.value = { ...param.value, page, pageSize }
    void loadData()
  }

  const resetQuery = () => {
    param.value = createDefaultQuery()
    cityOptions.value = []
    void loadData()
  }

  const gotoDetails = (item: WaterwayStationDto) => {
    stationStore.push(DcDeep.clone(item))
    stationStore.setCurrent(DcDeep.clone(item))
    void router.push({
      path: '/resource-app/waterway-port-dt',
      query: { id: item._id || item.Id, name: item.PortAreaName }
    })
  }

  const tableColumns: DCTableColumn[] = [
    {
      name: 'PortAreaName',
      label: '港口名称',
      align: 'center',
      width: '150',
      type: 'slot',
      fixed: 'left'
    },
    { name: 'PortName', label: '港口全称', align: 'center', width: '150' },
    { name: 'PortType', label: '港口分类', align: 'center', width: '100' },
    { name: 'AreaName', label: '我司归属区域', align: 'center', width: '120' },
    {
      name: 'AreaUserName',
      label: '我司区域负责人',
      align: 'center',
      width: '200',
      type: 'html',
      formatter(row: WaterwayStationDto) {
        if (!row.AreaUserTel) return row.AreaUserName
        const phone = createPrivatePhone(row.AreaUserTel)
        return `<div style="display:flex">${row.AreaUserName || ''}(${phone.outerHTML})</div>`
      }
    },
    { name: 'PortSpecification', label: '备注', align: 'center' },
    {
      name: 'PortAddress',
      label: '所在城市',
      headerAlign: 'center',
      width: '100',
      formatter: (row: WaterwayStationDto) =>
        (row.PortAddress || '').replace(/^(重庆市|北京市|天津市|上海市),/, '')
    },
    { name: 'Address', label: '详细地址', align: 'center', width: '180', formatter: formatAddress }
  ]

  onMounted(() => {
    void Promise.all([initProvince(), initCity()])
    void loadData()
  })
  watch(
    () => userStore.currentUserId,
    (currentUserId, previousUserId) => {
      if (currentUserId === previousUserId) return
      requestSequence += 1
      requestScope.renew()
      stationStore.reset()
      if (currentUserId) {
        void loadData()
      } else {
        list.value = []
        total.value = 0
        loading.value = false
      }
    }
  )
  onBeforeUnmount(() => {
    requestSequence += 1
    requestScope.cancel('waterway port list unmounted')
  })

  return {
    layoutRef,
    list,
    loading,
    total,
    provinceOptions,
    cityOptions,
    param,
    tableColumns,
    handleChangeProvince,
    gotoDetails,
    handleSearch,
    handlePageChange,
    resetQuery,
    stationGradeOptions,
    stationScaleOptions,
    loadData
  }
}
