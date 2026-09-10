import { RailwayStationDto, RailwayStationParam } from './types'
import { getSystemDataShow } from '@/api/systemDataShowApi'
import { useRoute, useRouter } from 'vue-router'
import { AsyncUpdate, QueryDtoStationAsync } from './api'
import { nextTick, onMounted, ref } from 'vue'
import { DCTableColumn } from '@/components/DCLayout/store'
import { useStatisticTrace } from '@/hooks/useStatisticTrace'
import DcLayout from '@/components/DCLayout/indexExtented.vue'

import { useRailwayStationStore } from './store/index'
import { createPrivatePhone } from '@/components/PrivatePhone/createPrivatePhone'
import { checkFunPermissionAsync } from '@/utils/funPermissionChecked'
import { ElMessageBox } from 'element-plus'
import { DcDeep } from '@dczy/tie-tools'

type optionsType = Record<'value' | 'text', string>

export function useList() {
  const railwayStationStore = useRailwayStationStore()
  const layoutRef = ref<InstanceType<typeof DcLayout>>()
  const router = useRouter()
  const route = useRoute()
  const { SetTrace } = useStatisticTrace()
  const list = ref<RailwayStationDto[]>([])
  const loading = ref(false)
  const total = ref(0)
  const bureauOptions = ref<optionsType[]>([])
  const trainDeptOptions = ref<optionsType[]>([])
  const provinceOptions = ref<optionsType[]>([])
  const cityOptions = ref<optionsType[]>([])
  const showVisit = ref(false)
  const showCms = ref(false)
  const cmsId = ref('')
  const currentStation = ref<RailwayStationDto>({} as RailwayStationDto)

  const param = ref<RailwayStationParam>({
    page: 1,
    pageSize: 20,
    stationProp: 'IsHyStation',
    transactType: '_all',
    railwayStationGrade: '_all',
    isStationary: '_all',
    isAgreement: '_all'
  })

  const permission = ref<{ singleUpdate: boolean; allUpdate: boolean }>({
    singleUpdate: false,
    allUpdate: false
  })
  function initPermission() {
    const all = checkFunPermissionAsync(route.path, 'allUpdate')
    const single = checkFunPermissionAsync(route.path, 'singleUpdate')
    Promise.all([all, single]).then((res) => {
      permission.value = {
        singleUpdate: res[1] === true,
        allUpdate: res[0] === true
      }
    })
  }

  function handleSearch(val?: MouseEvent | string) {
    if (typeof val === 'string') {
      param.value.railwayStationName = val
    }
    param.value.page = 1
    loadData()
  }

  function renderShow(val: string, type: 'BureauCode' | 'TrainCode') {
    const options = type === 'BureauCode' ? bureauOptions.value : trainDeptOptions.value
    return options.find((x: any) => x.value === val || x.realValue === val)?.text
  }

  function handleChangeBureau(val: any) {
    if (val) {
      initTrainDept(val.toString())
      initProvince(val.toString())
    }
    param.value.railwayTrainCode = ''
    param.value.provinceName = ''
    param.value.cityName = ''
    initCity('')
  }

  function handleChangeProvince(val: any) {
    initCity(val.toString())
  }

  function loadData() {
    const isFirstPage = param.value.page === 1
    if (isFirstPage) {
      list.value = []
    }
    try {
      loading.value = true
      const temp = DcDeep.clone<RailwayStationParam>(param.value)
      switch (temp.stationProp) {
        case 'IsHyStation':
          temp.isHyStation = true
          break
        case 'IsCrhExpress':
          temp.isCrhExpress = true
          break
        case 'IsHbExpress':
          temp.isHbExpress = true
          break
      }
      delete temp.stationProp
      if (temp.transactType) {
        delete temp.isDanger
        delete temp.isContainer
        temp[temp.transactType] = true
        delete temp.transactType
      }
      Object.keys(temp).forEach((key) => {
        if (
          ['railwayBureauCode', 'railwayTrainCode', 'provinceName', 'cityName'].includes(key) &&
          temp[key].length
        ) {
          temp[key] = temp[key].toString()
        }
        if (temp[key] === '_all') {
          delete temp[key]
        }
      })
      QueryDtoStationAsync(temp)
        .then((res) => {
          total.value = res?.totalCount || 0
          list.value = res?.items || []
          if (isFirstPage) {
            layoutRef.value?.getTableHeight()
          }
        })
        .finally(() => {
          loading.value = false
        })
    } catch (e) {
      loading.value = false
    }
    SetTrace('$SELECT', '铁路站点', '全国铁路站点')
  }

  function initProvince(sslj: string) {
    const param = { SSLJ: sslj }
    getSystemDataShow('RailWayProvinceDictionary', '', 0, 0, JSON.stringify(param)).then((res) => {
      if (res?.length) {
        provinceOptions.value = res.map((it) => {
          it.text = it.label
          it.value = it.label
          return it
        })
      }
    })
  }

  function initCity(province: string) {
    const post = {}
    if (province) {
      post['ProvinceShortName'] = province
    }
    if (param.value.railwayBureauCode) {
      post['SSLJ'] = param.value.railwayBureauCode
    }
    getSystemDataShow('RailWayProvinceCityTree', '', 0, 0, JSON.stringify(post)).then((res) => {
      if (res?.length) {
        cityOptions.value = res.map((it) => {
          it.text = it.label
          it.value = it.label
          return it
        })
      }
    })
  }

  function initTrainDept(bureau: string) {
    const param = { bureauCode: bureau }
    getSystemDataShow('RailwayTrainDeptSelect', '', 0, 0, JSON.stringify(param), false).then(
      (res) => {
        if (res?.length) {
          trainDeptOptions.value = res.map((it) => {
            it.realValue = it.value
            it.text = it.label
            // it.value = it.label;
            return it
          })
        }
      }
    )
  }

  function initData() {
    getSystemDataShow('RailwayBureauSelect', '', 0, 0, '', true).then((res) => {
      if (res?.length) {
        bureauOptions.value = res.map((item) => {
          item.text = `${item.label}局`
          return item
        })
      }
    })
    initTrainDept('')
    initProvince('')
    initCity('')
  }

  function gotoPage(type: 'map' | 'details', item: RailwayStationDto) {
    const query =
      type === 'map'
        ? {
            name: item.railwayStationName
          }
        : {
            id: item.id,
            name: item.railwayStationName
          }
    railwayStationStore.push(DcDeep.clone<RailwayStationDto>(item))
    railwayStationStore.setCurrent(DcDeep.clone<RailwayStationDto>(item))

    router.push({
      path: type === 'map' ? '/dashboard' : '/resource-app/station-dt',
      query
    })
  }

  function handlePageChange(page: number, size: number) {
    const temp = DcDeep.clone<RailwayStationParam>(param.value)
    temp.page = page
    temp.pageSize = size
    param.value = temp
    nextTick(() => {
      loadData()
    })
  }
  function handleShowVisit(item: RailwayStationDto) {
    currentStation.value = item
    nextTick(() => {
      showVisit.value = true
    })
  }

  function handleShowCms(item: RailwayStationDto) {
    if (Reflect.has(item, 'id')) {
      cmsId.value = item.id
    } else {
      cmsId.value = ''
    }
    nextTick(() => {
      showCms.value = true
    })
  }

  function handleAsyncUpdate(row?: RailwayStationDto, isSingle = false) {
    if (!row && isSingle) {
      ElMessageBox.prompt('根据站点名称更新', '请输入', {
        inputPlaceholder: '请输入需更新的站点名称',
        inputValidator: (val) => !!val,
        inputErrorMessage: '请输入需更新的站点名称'
      }).then((res) => {
        AsyncUpdate(res.value)
      })
    } else {
      const isAll = !row
      AsyncUpdate(row?.railwayStationName || '', isAll, isAll)
    }
  }

  onMounted(() => {
    initPermission()
    initData()
    loadData()
  })
  const TableColumn: DCTableColumn[] = [
    {
      name: 'railwayStationName',
      label: '车站名称',
      align: 'left',
      type: 'slot',
      fixed: 'left',
      width: '200'
    },
    {
      name: 'stationGrade',
      label: '车站等级',
      align: 'center',
      width: '80',
      hidden: true
    },
    {
      name: 'areaCompanyName',
      label: '所属区域、负责人',
      headerAlign: 'center',
      width: '260',
      type: 'html',
      formatter(row: RailwayStationDto) {
        if (!row?.principalPhone) return row.areaCompanyName
        const ele = createPrivatePhone(row?.principalPhone, row.principalName)
        return `<div style="display:flex">${row.areaCompanyName}(${ele.outerHTML})</div>`
      }
    },
    {
      name: 'stationaryUserNames',
      label: '驻站人员',
      align: 'center',
      width: '160',
      formatter(row: RailwayStationDto) {
        return row.stationaryUserNames?.join(' / ') || '-'
      }
    },
    {
      name: 'businessLimit',
      label: '货场整车办理限制',
      headerAlign: 'center',
      width: '200'
    },
    {
      name: 'hasPricePolicy',
      type: 'slot',
      label: '有无优价',
      align: 'center',
      width: '80'
      // formatter(row: RailwayStationDto) {
      //   return row.hasPricePolicy ? "有" : "无"
      // }
    },
    {
      name: 'hasPrivateLine',
      type: 'slot',
      label: '有无专用线',
      align: 'center',
      width: '100'
      // formatter(row: RailwayStationDto) {
      //   return row.hasPrivateLine ? "有" : "无";
      // }
    },
    {
      name: 'tags',
      label: '站点标签',
      align: 'center',
      type: 'slot',
      width: '350',
      showOverflowTooltip: false
    },
    {
      name: 'railwayTrainCode',
      label: '路局/车务段',
      headerAlign: 'center',
      width: '150',
      formatter: (row: RailwayStationDto) => {
        return `${row.railwayBureauName || ''} / ${row.railwayTrainName || ''}`
      }
    },

    {
      name: 'provinceName',
      label: '所在城市',
      headerAlign: 'center',
      width: '150',
      formatter: (row: RailwayStationDto) => {
        const zxs = ['重庆市', '北京市', '天津市', '上海市']
        const cityName = zxs.includes(row.provinceName) ? row.districtName : row.cityName
        return `${row.provinceName || ''} / ${cityName}`
      }
    }
  ]

  return {
    layoutRef,
    list,
    loading,
    total,
    bureauOptions,
    trainDeptOptions,
    provinceOptions,
    cityOptions,
    param,
    TableColumn,
    showVisit,
    showCms,
    cmsId,
    currentStation,
    permission,
    handleChangeBureau,
    handleChangeProvince,
    gotoPage,
    handleSearch,
    handlePageChange,
    handleShowVisit,
    handleShowCms,
    handleAsyncUpdate
  }
}
