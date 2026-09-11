<template>
  <div class="station-details">
    <div class="title">
      <DAliIcon name="portIcon" width="26" height="26"/>
      {{ state.waterPort.portAreaName || route.query.name || '港口详情' }}
      <el-tag v-if="state.waterPort.portNationality" class="define mr-5px fw-bold" type="danger">
        {{ state.waterPort.portNationality }}
      </el-tag>
      <el-tag
        v-if="state.waterPort.portScale"
        class="define mr-5px fw-bold"
        :type="stationLevelTagType[state.waterPort.portScale] || 'info'"
      >
        {{ stationLevelNameMap.get(state.waterPort.portScale) || state.waterPort.portScale }}
      </el-tag>
      <el-tag
        v-for="tag in state.tags"
        :key="tag"
        plain
        class="define mr-5px fw-bold"
        :type="tagColorMap.get(tag) || 'danger'"
      >
        {{ tag }}
      </el-tag>
    </div>

    <BaseInfo
      :key="`base-${detailScopeKey}`"
      :station="state.waterPort"
      :carrying-capacity-list="state.portTrafficability"
      :file-attach="state.fileAttach"
      @reload="loadData"
    />
    <Contact
      :key="`contact-${detailScopeKey}`"
      :station-id="stationId"
      :contacts="state.portContact"
      @reload="loadData"
    />
    <br />
    <FileUpload
      :key="`files-${detailScopeKey}`"
      :station-id="stationId"
      :list="state.fileAttach"
      @reload="loadData"
    />
    <br />
    <OutRates
      :key="`stowage-${detailScopeKey}`"
      :data="state.portStowage"
      :station-id="stationId"
      :wharf-data="state.portWharf"
      @reload="loadData"
    />
    <FeeStandards
      :key="`fees-${detailScopeKey}`"
      :fee-standards="state.portJobFee"
      :station-id="stationId"
      :wharf-data="state.portWharf"
      :work-zone-data="state.portWorkZone"
      @reload="loadData"
    />
    <SitePhoto
      :key="`photos-${detailScopeKey}`"
      :station-id="stationId"
      :wharf-data="state.portWharf"
    />
    <PortLocationMap
      :center-latlng="portLocation"
      :port-name="state.waterPort.portAreaName || route.query.name"
    />
    <SupplierEx
      :key="`suppliers-${detailScopeKey}`"
      :station-id="stationId"
      :station-name="state.waterPort.portName"
      type="waterPort"
      @reload="loadData"
    />
    <Wharf
      :key="`wharfs-${detailScopeKey}`"
      :data="state.portWharf"
      :station-id="stationId"
      @reload="loadData"
    />
    <CarryingCapacity
      :key="`trafficability-${detailScopeKey}`"
      :list="state.portTrafficability"
      :station-id="stationId"
      @reload="loadData"
    />
    <VisitRecord
      :key="`visits-${detailScopeKey}`"
      :station-id="stationId"
      :station-name="state.waterPort.portAreaName || state.waterPort.portName"
      :wharf-data="state.portWharf"
      :work-zone-data="state.portWorkZone"
      :contact-data="state.portContact"
      @reload="loadData"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, reactive, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElLoading } from 'element-plus'
  import { getPortDetail } from '@/api/waterway-port'
  import { RequestScope } from '@/request'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import { useUserStore } from '@/store/modules/user'
  import SupplierEx from '@/views/railway/station/components/supplierEx.vue'
  import BaseInfo from './components/baseinfo.vue'
  import Contact from './components/contact.vue'
  import SitePhoto from './components/sitePhoto.vue'
  import FeeStandards from './components/feeStandards.vue'
  import Wharf from './components/wharf.vue'
  import CarryingCapacity from './components/carryingCapacity.vue'
  import FileUpload from './components/fileUpload.vue'
  import OutRates from './components/outRates.vue'
  import VisitRecord from './components/visitRecord.vue'
  import PortLocationMap from './components/portLocationMap.vue'
  import { stationLevelNameMap, tagColorMap } from './store'

  const route = useRoute()
  const { SetTrace } = useStatisticTrace()
  const userStore = useUserStore()
  const requestScope = new RequestScope()
  let requestSequence = 0

  const stationLevelTagType: Record<string, 'danger' | 'primary' | 'success' | 'info'> = {
    Core: 'danger',
    Important: 'primary',
    Ordinary: 'success',
    Todo: 'info'
  }

  const stationId = computed(() => String(route.query.id || ''))
  const detailScopeKey = computed(
    () => `${stationId.value}-${userStore.currentUserId || 'anonymous'}`
  )
  const state = reactive({
    waterPort: {} as Record<string, any>,
    fileAttach: [] as any[],
    portImage: [] as any[],
    portSupplier: [] as any[],
    portWorkZone: [] as any[],
    portWharf: [] as any[],
    portJobFee: [] as any[],
    portStowage: [] as any[],
    portContact: [] as any[],
    portTrafficability: [] as any[],
    tags: [] as string[]
  })

  const resetDetail = () => {
    state.waterPort = {}
    state.fileAttach = []
    state.portImage = []
    state.portSupplier = []
    state.portWorkZone = []
    state.portWharf = []
    state.portJobFee = []
    state.portStowage = []
    state.portContact = []
    state.portTrafficability = []
    state.tags = []
  }

  const portLocation = computed(() => {
    console.log(state)
    const [lat = '', lng = ''] = String(state.waterPort.portCoord || '').split('/')
    return { lat, lng }
  })

  const loadData = async () => {
    if (!stationId.value) return
    const sequence = ++requestSequence
    requestScope.renew()
    const loading = ElLoading.service({ text: '数据加载中...' })
    const [error, data] = await getPortDetail(stationId.value, {
      signal: requestScope.withSignal({}).signal
    })
    if (sequence === requestSequence && !error) {
      state.waterPort = data.waterPort || {}
      state.fileAttach = data.fileAttach || []
      state.portImage = data.portImage || []
      state.portSupplier = data.portSupplier || []
      state.portWorkZone = data.portWorkZone || []
      state.portWharf = data.portWharf || []
      state.portJobFee = data.portJobFee || []
      state.portStowage = data.portStowage || []
      state.portContact = data.portContact || []
      state.portTrafficability = data.portTrafficability || []
      state.tags = data.tags || []
      SetTrace('$SELECT', '水运港口', '港口详情查询')
    }
    loading.close()
  }

  watch(stationId, () => void loadData(), { immediate: true })
  watch(
    () => userStore.currentUserId,
    (currentUserId, previousUserId) => {
      if (currentUserId === previousUserId) return
      requestSequence += 1
      requestScope.renew()
      resetDetail()
      if (currentUserId) void loadData()
    }
  )
  onBeforeUnmount(() => {
    requestSequence += 1
    requestScope.cancel('waterway port detail unmounted')
  })
</script>

<style lang="less" scoped>
  @import url('./style.less');
</style>
