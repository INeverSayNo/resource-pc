<script lang="ts" setup>
  import { computed, nextTick, PropType, ref, watch } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import { DMap } from '@dczy/tie-pc'
  import { DcCommon } from '@dczy/tie-tools'

  const props = defineProps({
    stationName: {
      type: String,
      default: ''
    },
    centerLatlng: {
      type: Object as PropType<Record<'lat' | 'lng', number | string>>,
      default: () => ({})
    }
  })

  const isMax = ref(false)

  const toggleMax = async () => {
    isMax.value = !isMax.value
    await nextTick()
    // mapContainerRef.value?.MapInstance?.invalidateSize();
  }

  const mapContainerRef = ref<InstanceType<typeof DMap> | null>(null)
  const MapInstance = computed(() => mapContainerRef.value?.MapInstance)

  const isInit = ref(false)

  watch([() => props.centerLatlng, isInit], async ([latlng, inited]) => {
    if (Object.keys(latlng).length && inited) {
      await DcCommon.nextFrame()
      mapContainerRef.value?.setMapCenter(+latlng.lat, +latlng.lng, 13)
    }
  })

  const resetCenter = () => {
    mapContainerRef.value?.setMapCenter(+props.centerLatlng.lat, +props.centerLatlng.lng, 13)
  }
</script>
<template>
  <div :class="{ isMax }">
    <DcGap class="bar">
      站点地图
      <span class="fr cu-pointer" :class="{ 'theme-color': !isMax }" @click="toggleMax">
        <DAliIcon :name="isMax ? 'top-right' : 'bottom-left'" />
      </span>
    </DcGap>
    <div class="single-station">
      <DMap
        ref="mapContainerRef"
        :width="isMax ? '101%' : '100%'"
        :height="isMax ? '100%' : '340px'"
        :show-railway-bureau="false"
        :show-railway-line="false"
        :show-location-icon="false"
        @init="isInit = true"
      ></DMap>
    </div>
    <div v-if="!isMax" class="fixed-location" @click="resetCenter">
      <DAliIcon name="sync"></DAliIcon>
    </div>
  </div>
</template>

<style lang="less">
  @import '../style.less';
  .fixed-location {
    position: relative;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    margin-top: -2rem;
    z-index: 1000;
    float: right;
    right: 0.6rem;
    bottom: 1.4rem;
    border-radius: 4px;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    cursor: pointer;
  }
</style>
