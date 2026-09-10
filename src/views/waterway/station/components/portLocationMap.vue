<script lang="ts" setup>
  import { computed, nextTick, ref, watch } from 'vue'
  import type { PropType } from 'vue'
  import { DcCommon } from '@dczy/tie-tools'
  import DcGap from '@/components/Gap/index.vue'

  interface DMapInstance {
    setMapCenter: (lat: number, lng: number, zoom: number) => void
  }

  const props = defineProps({
    centerLatlng: {
      type: Object as PropType<Partial<Record<'lat' | 'lng', number | string>>>,
      default: () => ({})
    }
  })

  const isMax = ref(false)
  const isReady = ref(false)
  const mapRef = ref<DMapInstance | null>(null)
  const hasValidCenter = computed(() => {
    const lat = Number(props.centerLatlng.lat)
    const lng = Number(props.centerLatlng.lng)
    return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0
  })

  const centerMap = async () => {
    if (!hasValidCenter.value || !isReady.value) return
    await DcCommon.nextFrame()
    mapRef.value?.setMapCenter(Number(props.centerLatlng.lat), Number(props.centerLatlng.lng), 13)
  }

  watch([() => props.centerLatlng, isReady], centerMap, { deep: true })

  const toggleMax = async () => {
    isMax.value = !isMax.value
    await nextTick()
    await centerMap()
  }
</script>

<template>
  <div :class="{ 'port-map-max': isMax }">
    <DcGap class="bar">
      港口地图
      <span class="fr cu-pointer" :class="{ 'theme-color': !isMax }" @click="toggleMax">
        <DAliIcon :name="isMax ? 'top-right' : 'bottom-left'" />
      </span>
    </DcGap>
    <div v-if="hasValidCenter" class="port-map-container">
      <DMap
        ref="mapRef"
        :width="isMax ? '101%' : '100%'"
        :height="isMax ? '100%' : '340px'"
        :show-railway-bureau="false"
        :show-railway-line="false"
        :show-railway-station="false"
        :show-location-icon="false"
        @init="isReady = true"
      />
      <button v-if="!isMax" class="reset-location" type="button" @click="centerMap">
        <DAliIcon name="sync" />
      </button>
    </div>
    <el-empty v-else description="暂无港口坐标" :image-size="72" />
  </div>
</template>

<style lang="less" scoped>
  .port-map-container {
    position: relative;
  }

  .port-map-max {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: #fff;
  }

  .reset-location {
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
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
    cursor: pointer;
  }
</style>
