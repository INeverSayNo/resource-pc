<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue'
  import { DMap } from '@dczy/tie-pc'
  import { DcCommon } from '@dczy/tie-tools'
  import type { AddressInfo } from '../types'

  const props = defineProps<{
    address?: Partial<AddressInfo>
    name?: string
  }>()

  const mapRef = ref<InstanceType<typeof DMap> | null>(null)
  const ready = ref(false)
  const marker = ref<BMapGL.Marker | null>(null)
  const map = computed(() => mapRef.value?.MapInstance)
  const hasLocation = computed(() => {
    const lat = Number(props.address?.lat)
    const lng = Number(props.address?.lng)
    return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0
  })

  const clearMarker = () => {
    if (marker.value && map.value) map.value.removeOverlay(marker.value)
    marker.value = null
  }

  const locate = async () => {
    if (!hasLocation.value) {
      clearMarker()
      ready.value = false
      return
    }
    if (!ready.value) return
    await DcCommon.nextFrame()
    const point = new BMapGL.Point(Number(props.address?.lng), Number(props.address?.lat))
    mapRef.value?.setMapCenter(point.lat, point.lng, 13)
    clearMarker()
    marker.value = new BMapGL.Marker(point)
    map.value?.addOverlay(marker.value)
    if (props.name) {
      const label = new BMapGL.Label(props.name, { offset: new BMapGL.Size(18, -10) })
      label.setStyle({ border: '0', borderRadius: '3px', padding: '4px 8px' })
      marker.value.setLabel(label)
    }
  }

  watch([() => props.address, ready], locate, { deep: true })
  onBeforeUnmount(clearMarker)

  defineExpose({ locate })
</script>

<template>
  <div class="center-map">
    <template v-if="hasLocation">
      <DMap
        ref="mapRef"
        width="100%"
        height="220px"
        :show-railway-bureau="false"
        :show-railway-line="false"
        :show-railway-station="false"
        :show-location-icon="false"
        @init="ready = true"
      />
      <button class="map-reset" type="button" title="重新定位" @click="locate">
        <DAliIcon name="sync" />
      </button>
    </template>
    <el-empty v-else description="暂无坐标" :image-size="56" />
  </div>
</template>

<style scoped lang="less">
  .center-map {
    position: relative;
    min-height: 150px;
    overflow: hidden;
    border-radius: 6px;
    background: #f5f7fa;
  }

  .map-reset {
    position: absolute;
    right: 10px;
    bottom: 10px;
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 4px;
    background: #fff;
    box-shadow: 0 4px 16px rgb(0 0 0 / 14%);
    cursor: pointer;
  }
</style>
