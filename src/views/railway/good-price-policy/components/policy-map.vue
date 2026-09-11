<template>
  <div class="policy-map" :style="{ height: `${height}px` }">
    <aside class="policy-panel" :class="{ collapsed: !expanded }">
      <div class="panel-title">
        <strong v-if="expanded">优价列表</strong>
        <el-button link type="primary" @click="expanded = !expanded">
          <DAliIcon :name="expanded ? 'arrow-up' : 'arrow-down'" />
          {{ expanded ? '收起' : '展开' }}
        </el-button>
      </div>
      <template v-if="expanded">
        <div v-loading="loading" class="policy-list">
          <button
            v-for="(item, index) in currentPolicies"
            :key="item.policyId"
            type="button"
            class="policy-item"
            :class="{ selected: selectedPolicyId === item.policyId }"
            @click="selectPolicy(item)"
          >
            <div class="policy-row">
              <span>{{ pageStart + index + 1 }}. {{ item.xfkey }}</span>
              <span class="theme-danger">{{ Math.abs(item.coefficient || 0) }}%</span>
              <el-link type="primary" :underline="false" @click.stop="emit('detail', item)">
                详情
              </el-link>
            </div>
            <div class="policy-description">{{ item.description || '暂无发运方向说明' }}</div>
            <div :class="{ 'theme-danger': effectiveDate(item) === '已过期' }">
              {{ effectiveDate(item) }}
            </div>
          </button>
          <el-empty
            v-if="!loading && !currentPolicies.length"
            :image-size="56"
            description="暂无优价通道数据"
          />
        </div>
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          class="policy-pagination"
          small
          :total="policies.length"
          :page-sizes="[10, 20, 50]"
          layout="sizes, prev, pager, next, total"
        />
      </template>
    </aside>

    <div class="map-wrap">
      <DMap
        ref="mapRef"
        :map-id="mapId"
        height="100%"
        width="100%"
        :show-railway-bureau="false"
        :show-railway-line="false"
        :show-railway-station="false"
        :show-location-icon="false"
        @init="handleMapInit"
      />
      <div v-if="mapError" class="map-state">
        <el-alert :title="mapError" type="error" show-icon :closable="false" />
      </div>
      <div v-if="stationMode" class="station-tools">
        <el-checkbox-group v-model="visibleRoles" @change="renderSelectedStations">
          <el-checkbox value="start">发站</el-checkbox>
          <el-checkbox value="arrival">到站</el-checkbox>
        </el-checkbox-group>
        <div class="legend"
          ><i class="start" />发站 <i class="arrival" />到站 <i class="both" />发/到站</div
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { getPointWithAddress } from '@dczy/tie-pc'
  import { queryPolicyChannels, getPolicyChannelStations } from '../api'
  import { buildPolicyChannelQuery, getPolicyStationRole, parsePolicyMapPoint } from '../logic'
  import type {
    PolicyMapItem,
    PolicySimpleResult,
    PolicySimpleResultWithMap,
    PricePolicyQueryParam,
    RailwayGppStatisticsCity
  } from '../types'

  interface DMapRef {
    MapInstance?: BMapGL.Map
  }

  const props = withDefaults(defineProps<{ query: PricePolicyQueryParam; height?: number }>(), {
    height: 620
  })
  const emit = defineEmits<{ detail: [policy: PolicySimpleResult] }>()
  const router = useRouter()
  const mapRef = ref<DMapRef>()
  const mapId = `policy-channel-map-${Date.now()}`
  const mapReady = ref(false)
  const mapError = ref('')
  const loading = ref(false)
  const expanded = ref(true)
  const policies = ref<PolicySimpleResult[]>([])
  const cities = ref<RailwayGppStatisticsCity[]>([])
  const page = ref(1)
  const pageSize = ref(20)
  const selectedPolicyId = ref('')
  const selectedMapData = ref<PolicySimpleResultWithMap>()
  const visibleRoles = ref<Array<'start' | 'arrival'>>(['start', 'arrival'])
  const overlays: BMapGL.Overlay[] = []
  const regionPointCache = new Map<string, BMapGL.Point | null>()
  let queryController: AbortController | undefined
  let stationController: AbortController | undefined
  let renderSequence = 0

  const pageStart = computed(() => (page.value - 1) * pageSize.value)
  const currentPolicies = computed(() =>
    policies.value.slice(pageStart.value, pageStart.value + pageSize.value)
  )
  const stationMode = computed(() => Boolean(selectedPolicyId.value))

  const clearOverlays = () => {
    const map = mapRef.value?.MapInstance
    if (!map) return
    while (overlays.length) {
      const overlay = overlays.pop()
      if (overlay) map.removeOverlay(overlay)
    }
  }

  const addOverlay = (overlay: BMapGL.Overlay) => {
    mapRef.value?.MapInstance?.addOverlay(overlay)
    overlays.push(overlay)
  }

  const resolveRegionPoint = async (name: string): Promise<BMapGL.Point | null> => {
    if (regionPointCache.has(name)) return regionPointCache.get(name) || null
    try {
      const results = await getPointWithAddress(name)
      const point = results[0]?.point || null
      regionPointCache.set(name, point)
      return point
    } catch {
      regionPointCache.set(name, null)
      return null
    }
  }

  const renderChannels = async () => {
    if (!mapReady.value || selectedPolicyId.value) return
    const sequence = ++renderSequence
    clearOverlays()
    const names = [
      ...new Set(
        cities.value.flatMap((item) => [item.cityName, item.arrivalCityName]).filter(Boolean)
      )
    ]
    await Promise.all(names.map(resolveRegionPoint))
    if (sequence !== renderSequence) return
    const points: BMapGL.Point[] = []
    for (const name of names) {
      const point = regionPointCache.get(name)
      if (!point) continue
      const label = new BMapGL.Label(name, {
        position: point,
        offset: new BMapGL.Size(4, -12)
      })
      label.setStyle({
        color: '#409eff',
        borderColor: '#d9ecff',
        background: 'rgb(255 255 255 / 92%)',
        borderRadius: '3px',
        padding: '2px 5px'
      })
      addOverlay(label)
    }
    for (const item of cities.value) {
      const start = regionPointCache.get(item.cityName)
      const arrival = regionPointCache.get(item.arrivalCityName)
      if (!start || !arrival) continue
      points.push(start, arrival)
      addOverlay(
        new BMapGL.Polyline([start, arrival], {
          strokeColor: '#67c23a',
          strokeWeight: Math.min(8, Math.max(2, item.num / 10)),
          strokeOpacity: 0.55
        })
      )
    }
    if (points.length) mapRef.value?.MapInstance?.setViewport(points)
    else if (cities.value.length) mapError.value = '通道区域坐标解析失败'
  }

  const markerIcon = (color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="34" viewBox="0 0 26 34"><path fill="${color}" stroke="#fff" stroke-width="2" d="M13 1C6.4 1 1 6.4 1 13c0 9 12 20 12 20s12-11 12-20C25 6.4 19.6 1 13 1z"/><circle cx="13" cy="13" r="4" fill="#fff"/></svg>`
    return new BMapGL.Icon(`data:image/svg+xml,${encodeURIComponent(svg)}`, new BMapGL.Size(26, 34))
  }

  const uniqueStations = (items: PolicyMapItem[]) => {
    const result = new Map<string, PolicyMapItem>()
    for (const item of items) if (!result.has(item.stationId)) result.set(item.stationId, item)
    return [...result.values()]
  }

  const renderSelectedStations = () => {
    if (!mapReady.value || !selectedMapData.value) return
    ++renderSequence
    clearOverlays()
    const items = selectedMapData.value.mapItems || []
    const points: BMapGL.Point[] = []
    for (const item of uniqueStations(items)) {
      const role = getPolicyStationRole(item, items)
      if (role !== 'both' && !visibleRoles.value.includes(role)) continue
      if (role === 'both' && !visibleRoles.value.length) continue
      const location = parsePolicyMapPoint(item.latLng)
      if (!location) continue
      const point = new BMapGL.Point(location.lng, location.lat)
      points.push(point)
      const color = role === 'both' ? '#e6a23c' : role === 'arrival' ? '#f56c6c' : '#67c23a'
      const marker = new BMapGL.Marker(point, { icon: markerIcon(color) })
      const label = new BMapGL.Label(item.stationName, { offset: new BMapGL.Size(28, 4) })
      label.setStyle({
        border: '0',
        background: '#fff',
        color,
        padding: '2px 5px',
        cursor: 'pointer'
      })
      marker.setLabel(label)
      marker.addEventListener('click', () => {
        if (!item.stationId) return
        void router.push({
          path: '/resource-app/station-dt',
          query: { id: item.stationId, name: item.stationName }
        })
      })
      addOverlay(marker)
    }
    if (points.length) mapRef.value?.MapInstance?.setViewport(points)
    else mapError.value = '该政策暂无有效站点坐标'
  }

  const selectPolicy = async (policy: PolicySimpleResult) => {
    mapError.value = ''
    if (selectedPolicyId.value === policy.policyId) {
      selectedPolicyId.value = ''
      selectedMapData.value = undefined
      await renderChannels()
      return
    }
    stationController?.abort()
    stationController = new AbortController()
    const [error, result] = await getPolicyChannelStations(policy.policyId, {
      signal: stationController.signal
    })
    if (stationController.signal.aborted) return
    if (error) {
      ElMessage.error(error.message || '优价站点加载失败')
      return
    }
    selectedPolicyId.value = policy.policyId
    selectedMapData.value = result
    renderSelectedStations()
  }

  const load = async () => {
    queryController?.abort()
    queryController = new AbortController()
    loading.value = true
    mapError.value = ''
    selectedPolicyId.value = ''
    selectedMapData.value = undefined
    const [error, result] = await queryPolicyChannels(buildPolicyChannelQuery(props.query), {
      signal: queryController.signal
    })
    if (queryController.signal.aborted) return
    loading.value = false
    policies.value = result.policyList || []
    cities.value = result.cities || []
    page.value = 1
    if (error) {
      mapError.value = error.message || '优价通道加载失败'
      return
    }
    await renderChannels()
  }

  const handleMapInit = () => {
    mapReady.value = true
    void renderChannels()
  }

  const effectiveDate = (item: PolicySimpleResult) => {
    const today = new Date().toISOString().slice(0, 10)
    const start = item.startDate?.slice(0, 10) || ''
    const end = item.endDate?.slice(0, 10) || ''
    if (start && today < start) return `未开始(${start})`
    if (end && today <= end) return `有效期(${end})`
    return end ? '已过期' : '长期有效'
  }

  defineExpose({ load })
  onBeforeUnmount(() => {
    queryController?.abort()
    stationController?.abort()
    ++renderSequence
    clearOverlays()
  })
</script>

<style scoped lang="less">
  .policy-map {
    position: relative;
    display: flex;
    min-height: 480px;
    overflow: hidden;
  }

  .policy-panel {
    z-index: 2;
    display: flex;
    flex: 0 0 460px;
    flex-direction: column;
    background: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color);

    &.collapsed {
      position: absolute;
      top: 8px;
      left: 8px;
      width: 76px;
      border: 0;
      border-radius: 4px;
    }
  }

  .panel-title,
  .policy-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .panel-title {
    min-height: 42px;
    padding: 0 10px;
    border-bottom: 1px solid var(--el-border-color);
  }

  .policy-list {
    flex: 1;
    overflow: auto;
  }

  .policy-item {
    display: block;
    width: 100%;
    padding: 9px 12px;
    color: inherit;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-bottom: 1px dotted var(--el-border-color);

    &.selected,
    &:hover {
      background: var(--el-color-primary-light-9);
    }
  }

  .policy-description {
    margin: 5px 0;
    color: var(--el-text-color-secondary);
  }

  .policy-pagination {
    justify-content: center;
    padding: 8px 2px;
  }

  .map-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .map-state,
  .station-tools {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 3;
  }

  .map-state {
    left: 10px;
  }

  .station-tools {
    padding: 8px 12px;
    background: rgb(255 255 255 / 94%);
    border-radius: 4px;
    box-shadow: var(--el-box-shadow-light);
  }

  .legend {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-top: 6px;
    font-size: 12px;

    i {
      width: 10px;
      height: 10px;
      margin-left: 4px;
      border-radius: 50%;
    }

    .start {
      background: #67c23a;
    }
    .arrival {
      background: #f56c6c;
    }
    .both {
      background: #e6a23c;
    }
  }
</style>
