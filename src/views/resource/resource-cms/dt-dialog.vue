<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="dialogVisible"
    :width="1000"
    :title="`${title}(${list.length})`"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="dialogVisible = false"
  >
    <div class="tr mb-10">
      <el-input
        v-model="keywords"
        style="width: 200px"
        placeholder="请输入关键字查询"
      ></el-input>
    </div>
    <el-table :data="showList" size="small" stripe highlight-current-row border>
      <el-table-column label="序号" type="index"></el-table-column>
      <el-table-column
        label="发布时间"
        prop="releaseDate"
        header-align="center"
        width="130px"
      >
        <template #default="scoped">
          {{ formatTime(scoped.row.releaseDate, "yyyy-MM-dd HH:mm") }}
        </template>
      </el-table-column>
      <el-table-column
        label="标题"
        prop="title"
        header-align="center"
      ></el-table-column>
      <el-table-column label="关键字" prop="keywords" align="center">
        <template #default="scoped">
          <el-tag
            v-for="item in renderKeywords(scoped.row.keywords)"
            :key="item.label"
            :type="item.class"
            class="mr-5"
          >
            {{ item.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="站点名称"
        prop="businessName"
        width="80px"
        align="center"
      ></el-table-column>
      <el-table-column label="预览" align="center">
        <template #default="scoped">
          <div
            v-for="item in renderPreview(scoped.row)"
            :key="item.uri"
            class="theme-color cu-pointer"
            @click="
              () =>
                item.type === 'uri'
                  ? handleRead(scoped.row)
                  : handleFilePreview(scoped.row, item.uri!)
            "
          >
            {{ item.label }}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </com-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useCmsDialog } from "./useCmsDialog";
import { formatTime } from "@/utils";
import { useCms } from "./useCms";

export default defineComponent({
  props: {
    title: {
      type: String,
      default: () => "重要通知"
    }
  },
  setup() {
    const { dialogVisible, keywords, showList, list } = useCmsDialog();
    const { renderKeywords, renderPreview, handleRead, handleFilePreview } =
      useCms(list);
    return {
      dialogVisible,
      keywords,
      showList,
      list,
      formatTime,
      handleRead,
      handleFilePreview,
      renderKeywords,
      renderPreview
    };
  }
});
</script>

<style lang="less" scoped></style>
