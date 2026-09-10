<script lang="ts" setup>
import { PropType, ref, watch, onMounted, nextTick } from "vue";
import DcGap from "@/components/Gap/index.vue";
import PreviewWidget from "./preview.vue";
import EditWidget from "./edit.vue";
import { GetStationImages } from "./api";
import { PreviewImgItem, UploadSuccessParams } from "./type";
import { useRoute } from 'vue-router';

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

// #region 已存在的站点图片
const previewFileList = ref<Array<PreviewImgItem>>([]);
watch(
  () => props.stationId,
  (id) => {
    id && loadPhotoList();
  },
  {
    immediate: true
  }
);

function loadPhotoList() {
  GetStationImages(props.stationId).then((res) => {
    previewFileList.value = res;
    isEdit.value = !res.length;
  });
}
// #endregion

const isEdit = ref(false);

function handleAdd() {
  isEdit.value = !isEdit.value;
}

function deletePreviewImg(id: string) {
  const index = previewFileList.value.findIndex((e) => e.id === id);
  if (index > -1) previewFileList.value.splice(index, 1);
}

function uploadSuccess(payload: UploadSuccessParams) {
  previewFileList.value.push({
    stationId: props.stationId,
    typeMark: payload.typeMark,
    typeName: payload.typeName,
    fileId: payload.imageFile.id,
    createTime: payload.imageFile.creationDate,
    ...payload.imageFile,
    id: payload.id
  });
}

// #endregion
</script>
<template>
  <div>
    <DcGap class="bar">
      站点图片
      <span class="theme-color">(共{{ previewFileList?.length || 0 }}张)</span>
      <span class="bar-btn fr" @click="handleAdd">
        <DAliIcon :name="isEdit ? 'close' : 'edit'" />
        {{ isEdit ? "取消" : "新增" }}
      </span>
    </DcGap>
    <PreviewWidget
      v-show="!isEdit"
      :file-list="previewFileList"
      @delete-success="deletePreviewImg"
    ></PreviewWidget>
    <EditWidget
      v-show="isEdit"
      :station-id="stationId"
      @upload-success="uploadSuccess"
      @delete-success="deletePreviewImg"
    ></EditWidget>
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
