<script lang="ts" setup>
import { PropType, ref, watch, onMounted, nextTick } from "vue";
import DcGap from "@/components/Gap/index.vue";
import { useRoute } from "vue-router";
import { loadExternalScript, publicAssetUrl } from '@/utils/publicAsset'

const props = defineProps({
  stationId: {
    type: String as PropType<string>,
    default: ""
  },
  stationName: {
    type: String as PropType<string>,
    default: ""
  }
});

const route = useRoute();
const { name } = route.query as Record<"name", string>;

// #region 全景
const showVrEl = ref(false);
async function beforeLoadVr(folderName: string) {
  if (!folderName) return false;
  const response = await fetch(publicAssetUrl(`vtour/${folderName}/tour.xml`))
  return response.ok && (await response.text()).startsWith('<krpano')
}
// #endregion

onMounted(() => {
  nextTick(() => {
    beforeLoadVr(name).then(async (res) => {
      if (res) {
        await loadExternalScript('vtour/tour.js', 'DcVtourScript')
        showVrEl.value = true;
        embedpano({
          swf: publicAssetUrl(`vtour/${name}/tour.swf`),
          xml: publicAssetUrl(`vtour/${name}/tour.xml`),
          target: "stationVrEl",
          html5: "auto",
          mobilescale: 1.0,
          passQueryParameters: true
        });
      }
    });
  });
});
// #endregion
</script>
<template>
  <div v-show="showVrEl">
    <DcGap class="bar">VR全景漫游</DcGap>
    <div
      id="stationVrEl"
      style="width: 100%; height: 25rem"
    ></div>
  </div>
</template>

<style lang="less" scoped>
@import "../station/style.less";
.other-class {
  background-color: #fbfdff;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: 120px;
  height: 84px;
  cursor: pointer;
  line-height: 85px;
  vertical-align: top;
}
</style>
