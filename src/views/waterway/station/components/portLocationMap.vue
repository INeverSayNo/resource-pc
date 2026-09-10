<script lang="ts" setup>
  import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
  import type { PropType } from 'vue'
  import { DcCommon } from '@dczy/tie-tools'
  import DcGap from '@/components/Gap/index.vue'
  import useCreateCustomLayer from '@/utils/map/useCreateLayer'

  const props = defineProps({
    centerLatlng: {
      type: Object as PropType<Partial<Record<'lat' | 'lng', number | string>>>,
      default: () => ({})
    },
    portName: {
      type: String
    }
  })

  const isReady = ref(false)
  const mapRef = useTemplateRef('mapRef')
  const MapInstance = computed(() => mapRef.value?.MapInstance)
  const hasValidCenter = computed(() => {
    const lat = Number(props.centerLatlng.lat)
    const lng = Number(props.centerLatlng.lng)
    return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0
  })

  const centerMap = async () => {
    if (!hasValidCenter.value || !isReady.value) return
    await DcCommon.nextFrame()
    mapRef.value?.setMapCenter(Number(props.centerLatlng.lat), Number(props.centerLatlng.lng), 13.8)
    addPortLayer()
  }

  const { createLayerUrl } = useCreateCustomLayer()
  const addPortLayer = () => {
    if (!props.portName) return
    const CqlFilterStr = `name_zh like '${props.portName}'`
    const options = createLayerUrl(
      {
        layerName: 'dc_railway_point',
        paneName: 'railwayBureauSPane',
        maxZoom: 18,
        minZoom: 3
      },
      {
        cql_filter: CqlFilterStr,
        styles: 'osm:baidu_railway_point_pc_new'
      }
    )

    console.log(CqlFilterStr)
    const layer = new BMapGL.XYZLayer({
      tileUrlTemplate: options + '&BBOX=[b]'
    })
    MapInstance?.value?.addTileLayer(layer)
  }

  watch([() => props.centerLatlng, isReady], centerMap, { deep: true })
</script>

<template>
  <div>
    <DcGap class="bar"> 港口地图 </DcGap>
    <div v-if="hasValidCenter" class="port-map-container">
      <DMap
        ref="mapRef"
        :width="'100%'"
        :height="'340px'"
        :show-railway-bureau="false"
        :show-railway-line="false"
        :show-railway-station="false"
        :show-location-icon="false"
        @init="isReady = true"
      />
      <button class="reset-location" type="button" @click="centerMap">
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
    z-index: 999;
  }
</style>
