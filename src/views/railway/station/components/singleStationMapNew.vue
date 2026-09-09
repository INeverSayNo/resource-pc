<script lang="ts" setup>
import { nextTick, PropType, ref, watch } from "vue";
import DcPureMap from "@/components/DcPureMap/index.vue";
import DcGap from "@/components/Gap/index.vue";
import DcIcon from "@/components/icon/index.vue";

const props = defineProps({
  stationName: {
    type: String,
    default: ""
  },
  centerLatlng: {
    type: Object as PropType<Record<"lat" | "lng", number | string>>,
    default: () => ({})
  }
});

const isMax = ref(false);

const toggleMax = async () => {
  isMax.value = !isMax.value;
  await nextTick();
  mapContainerRef.value?.MapInstance?.invalidateSize();
};

const mapContainerRef = ref<InstanceType<typeof DcPureMap> | null>(null);

const isInit = ref(false);

watch([() => props.centerLatlng, isInit], ([latlng, inited]) => {
  if (Object.keys(latlng).length && inited) {
    mapContainerRef.value?.setMapCenter(+latlng.lat, +latlng.lng, 13);
  }
});

const resetCenter = () => {
  mapContainerRef.value?.setMapCenter(
    +props.centerLatlng.lat,
    +props.centerLatlng.lng,
    13
  );
};
</script>
<template>
  <div :class="{ isMax }">
    <DcGap class="bar">
      站点地图
      <span
        class="fr cu-pointer"
        :class="{ 'theme-color': !isMax }"
        @click="toggleMax"
      >
        <DLegacyIcon :name="isMax ? 'top-right' : 'bottom-left'" />
      </span>
    </DcGap>
    <div class="single-station">
      <DcPureMap
        ref="mapContainerRef"
        :width="isMax ? '101%' : '100%'"
        :height="isMax ? '100%' : '340px'"
        :show-railway-bureau="false"
        :show-railway-line="false"
        @init="isInit = true"
      ></DcPureMap>
    </div>
    <div v-if="!isMax" class="fixed-location" @click="resetCenter">
      <DcIcon name="location"></DcIcon>
    </div>
  </div>
</template>

<style lang="less">
@import "../style.less";
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
