<script lang="ts">
import {
  PropType,
  computed,
  defineComponent,
    defineProps
} from "vue";
import { GETFILE_URL } from "@/request";
import { ElMessageBox } from "element-plus";
import { Message } from "@/components/Message";
import { createImgPreview } from "@/components/Preview";
import { DeleteStationImages } from "./api";
import { PreviewImgItem } from "./type";

export default defineComponent({
  props: {
    fileList: {
      type: Array as PropType<Array<PreviewImgItem>>,
      default: () => []
    }
  },
  emits: ["deleteSuccess"],
  setup(props, { emit }) {
    const previewList = computed(() => {
      return props.fileList.map((e) => GETFILE_URL + e.filePath);
    });

    function deleteImg({ id }: PreviewImgItem) {
      ElMessageBox.confirm(
        `删除后无法撤回，是否确定删除站点图片`,
        "提示信息"
      ).then(() => {
        DeleteStationImages(id).then((res) => {
          if (res && res.isSuccessful) {
            Message.success({
              message: "操作成功",
              onClose: () => emit("deleteSuccess", id)
            });
          } else {
            Message.error("操作失败，" + res.message);
          }
        });
      });
    }

    function previewImg(item: PreviewImgItem, idx: number) {
      createImgPreview({
        imageList: previewList.value,
        show: true,
        index: idx,
        zIndex: 9999,
        style: null
      });
    }
    return {
      previewList,
      previewImg,
      deleteImg,
      GETFILE_URL
    };
  }
});
</script>
<template>
  <div>
    <div
      style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        margin: 15px;
      "
    >
      <div
        v-for="(item, index) in fileList"
        :key="index"
        style="text-align: center"
      >
        <div class="block">
          <el-image
            style="width: 100px; height: 100px"
            :src="GETFILE_URL + item.filePath"
            :initial-index="index"
            @click="previewImg(item, index)"
          ></el-image>
          <div style="text-align: center; font-size: 12px">
            <label>{{ item.typeName }}</label>
            <el-tooltip
              class="item"
              effect="dark"
              content="删除站点图片"
              placement="top-end"
            >
              <el-button
                style="margin-left: 0.5rem"
                size="small"
                circle
                @click="deleteImg(item)"
              >
            <d-ali-icon name="delete" width="12" height="12"></d-ali-icon>
            </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
