<script lang="ts">
import usePureMapLogic from "./usePureMapLogic";
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "DcPureMap",
  props: {
    height: {
      type: String,
      default: "100vh"
    },
    width: {
      type: String,
      default: "100vw"
    },
    className: {
      type: String,
      default: ""
    },
    showRailwayLine: {
      type: Boolean,
      default: true
    },
    showRailwayStation: {
      type: Boolean,
      default: true
    },
    showTerrain: {
      type: Boolean,
      default: false
    },
    showRailwayBureau: {
      type: Boolean,
      default: true
    },
    minZoom: {
      type: Number,
      default: 3
    },
    maxZoom: {
      type: Number,
      default: 18
    },
    mapId: {
      type: String,
      default: "dcPureMap"
    },
    disableZoom: {
      type: Boolean,
      default: false
    },
    copyright: {
      type: String,
      default: "©道臣物流集团有限公司"
    },
    useLargeCopyright: {
      type: Boolean,
      default: false
    },
    showAttribution: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    "zoomEnd",
    "init",
    "moveEnd",
    "click",
    "programmaticMoveEnd",
    "railwayLineClick",
    "railwayBureauClick",
    "railwayPointClick"
  ],
  setup(props, { emit, expose }) {
    const {
      MapId,
      MapInstance,
      initMap,
      setMapCenter,
      addRailwayBureauLayer,
      addRailwayLineLayer,
      removeRailwayLineLayer,
      removeRailwayBureauLayer,
      reload
    } = usePureMapLogic(props, emit);

    const checkMemoryUsage = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        console.log(`已使用内存: ${usedMB.toFixed(2)} MB`);
      }
    };

    onMounted(() => {
      checkMemoryUsage();
    });

    expose({
      MapInstance,
      initMap,
      addRailwayBureauLayer,
      removeRailwayBureauLayer,
      removeRailwayLineLayer,
      addRailwayLineLayer,
      setMapCenter,
      reload
    });
    return {
      MapInstance,
      initMap,
      addRailwayBureauLayer,
      removeRailwayBureauLayer,
      removeRailwayLineLayer,
      addRailwayLineLayer,
      setMapCenter,
      reload,
      MapId
    };
  }
});
</script>
<template>
  <div
    :id="MapId"
    :style="{ height, width }"
    :class="className"
    class="dc-pure-map"
  ></div>
</template>
