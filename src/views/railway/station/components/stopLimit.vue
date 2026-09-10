<template>
  <DcGap class="bar">
    停限装公告
    <span class="theme-color">(共{{ list?.length || 0 }}条)</span>
    <span class="bar-btn fr" @click="handleAdd">
      <DAliIcon name="plus" class="" />
      新增
    </span>
  </DcGap>
  <el-table
    :data="list"
    :max-height="360"
    border
    stripe
    highlight-current-row
  >
    <el-table-column
      label="发布单位"
      align="center"
      show-overflow-tooltip
      prop="railwayBureau"
    ></el-table-column>
    <el-table-column
      label="停限地点"
      align="center"
      show-overflow-tooltip
      prop="stopAddr"
    ></el-table-column>
    <el-table-column
      label="起始日期"
      align="center"
      show-overflow-tooltip
      prop="startDt"
    >
      <template #default="scoped">
        {{ formatTime(scoped.row.startDt, "yyyy-MM-dd HH:mm") }}
      </template>
    </el-table-column>
    <el-table-column
      label="终止日期"
      align="center"
      show-overflow-tooltip
      prop="endDt"
    >
      <template #default="scoped">
        {{ formatTime(scoped.row.endDt, "yyyy-MM-dd HH:mm") }}
      </template>
    </el-table-column>
    <el-table-column
      label="受限发局"
      align="center"
      show-overflow-tooltip
      prop="restrictedDepartureBureau"
    ></el-table-column>
    <el-table-column
      label="受限发站"
      align="center"
      show-overflow-tooltip
      prop="restrictedDepartureStation"
    ></el-table-column>
    <el-table-column
      label="停限内容"
      align="center"
      show-overflow-tooltip
      prop="content"
    ></el-table-column>
    <el-table-column
      label="限停原因"
      align="center"
      show-overflow-tooltip
      prop="reason"
    ></el-table-column>
    <el-table-column
      label="发布时间"
      align="center"
      show-overflow-tooltip
      prop="releaseDt"
    >
      <template #default="scoped">
        {{ formatTime(scoped.row.releaseDt, "yyyy-MM-dd HH:mm") }}
      </template>
    </el-table-column>
  </el-table>
  <EditForm
    v-model="showEdit"
    :station-id="stationId"
    @success="handleSuccess"
  ></EditForm>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { RailWayStopNotice } from "../types";
import { formatTime } from "@/utils";
import DcGap from "@/components/Gap/index.vue";
import EditForm from "./stopLimitForm.vue";
import { Message } from "@/components/Message";

export default defineComponent({
  components: {
    DcGap,
    EditForm
  },
  props: {
    list: {
      type: Array as PropType<Array<RailWayStopNotice>>,
      default: () => []
    },
    stationId: {
      type: String,
      default: () => ""
    }
  },
  emits: ["reload"],
  setup(props, { emit }) {
    const showEdit = ref(false);
    function handleAdd() {
      if (props.stationId) {
        showEdit.value = true;
      } else {
        Message.warning("车站Id有误，请刷新重试");
      }
    }
    function handleSuccess() {
      emit("reload");
    }
    return {
      showEdit,
      formatTime,
      handleAdd,
      handleSuccess
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
