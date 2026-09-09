<template>
  <DcGap class="bar">
    拜访记录
    <span class="theme-color">(共{{ listOptions.total }}个)</span>
    <span class="bar-btn fr" @click="visitAdd">
      <DLegacyIcon name="plus" class="" />
      新增
    </span>
  </DcGap>
  <el-table
    v-loading="listOptions.loading"
    :data="list"
    :max-height="tableHeight"
    size="small"
    border
    stripe
    highlight-current-row
  >
    <el-table-column type="index" label="序号" align="center"></el-table-column>
    <el-table-column
      label="拜访方式"
      align="center"
      width="70"
      prop="visitExtendJson.visitType"
    ></el-table-column>
    <el-table-column
      align="center"
      width="70"
      label="拜访业务"
      prop="visitExtendJson.visitBusinessType"
    >
      <template #default="scoped">
        {{
          renderVisitBusinessTypeLabel(
            scoped.row.visitExtendJson.visitBusinessType
          )
        }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      width="130"
      label="专用线"
      show-overflow-tooltip
      prop="visitExtendJson.businessObjName"
    ></el-table-column>
    <el-table-column
      label="站点联系人"
      align="center"
      width="180"
      show-overflow-tooltip
    >
      <template #default="scoped">
        {{ scoped.row.visitExtendJson.contact }}
        <span
          v-if="scoped.row.visitExtendJson.contactPhone"
          v-clipboard:value="scoped.row.visitExtendJson.contactPhone"
          class="theme-color cu-pointer"
          v-html="
            createPrivatePhone(scoped.row.visitExtendJson.contactPhone)
              .outerHTML
          "
        ></span>
      </template>
    </el-table-column>
    <el-table-column label="拜访内容" prop="visitContent"></el-table-column>
    <el-table-column
      align="center"
      width="80"
      label="拜访人员"
      prop="visitUserName"
    ></el-table-column>
    <el-table-column
      align="center"
      width="90"
      label="拜访日期"
      prop="visitDate"
    >
      <template #default="scoped">
        {{ formatTime(scoped.row.visitDate, "yyyy-MM-dd") }}
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    class="table-pagination"
    :current-page="listOptions.page"
    :page-size="listOptions.pageSize"
    layout="total, sizes, prev, pager, next, jumper"
    :total="listOptions.total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
  <VisitRecordForm
    v-model:show="showEdit"
    :station-id="stationId"
    :station-name="stationName"
    @success="loadData"
  ></VisitRecordForm>
</template>
<script lang="ts" setup>
import { deepClone } from "@/utils";
import { ref, reactive, onMounted } from "vue";
import {
  StationVisitRecord,
  api,
  VisitBusinessTypeEnum
} from "@/views/railway/station-visit/types";
import { VisitRecordParam } from "@/views/resource-visit/types";
import { formatTime } from "@/utils";
import DcGap from "@/components/Gap/index.vue";
import VisitRecordForm from "./visitRecordForm2.vue";

const props = defineProps({
  stationId: {
    type: String,
    default: () => ""
  },
  stationName: {
    type: String,
    default: () => ""
  },
  tableHeight: {
    type: Number,
    default: 360
  }
});
const listOptions = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  loading: false
});
const list = ref<StationVisitRecord[]>([]);
function loadData() {
  const param: VisitRecordParam = {
    page: listOptions.page,
    pageSize: listOptions.pageSize,
    businessId: props.stationId
  };
  listOptions.loading = true;
  api
    .Query(param)
    .then((res) => {
      listOptions.total = res.totalCount;
      const data = res.items || [];
      if (listOptions.page === 1) {
        list.value = data;
      } else {
        const temp = deepClone<StationVisitRecord[]>(list.value);
        temp.push(...data);
        list.value = temp;
      }
    })
    .finally(() => {
      listOptions.loading = false;
    });
}
function handleSizeChange(size: number) {
  listOptions.pageSize = size;
  loadData();
}
function handleCurrentChange(page: number) {
  listOptions.page = page;
  loadData();
}
function renderVisitBusinessTypeLabel(val?: number) {
  return typeof val !== "undefined"
    ? VisitBusinessTypeEnum.getSelf(val).label
    : "";
}
const showEdit = ref(false);
function visitAdd() {
  showEdit.value = true;
}
onMounted(() => {
  loadData();
});
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
