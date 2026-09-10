<template>
  <DcGap class="bar with-input">
    <span class="pt-5">
      优价政策
      <span class="theme-color">(共{{ queryArr.length || 0 }}条)</span>
    </span>
    <el-input
      v-model="query"
      
      class="fr"
      style="width: 150px"
      placeholder="请输入关键字查询"
    ></el-input>
  </DcGap>
  <el-table
    v-loading="tableLoading"
    :data="filterArr"
    
    border
    stripe
    :max-height="tableHeight"
    show-overflow-tooltip
    highlight-current-row
    @current-change="handleCurrentRow"
  >
    <el-table-column label="类型" align="center" width="90" fixed="left">
      <template #default="{ row }">
        <span
          class="bar-btn"
          :class="[row.direction === '发送' ? 'theme-color' : 'theme-warning']"
        >
          {{ row.direction }}
        </span>
      </template>
    </el-table-column>
    <DcTableItem :columns="tableCols">
      <template #xfkey="scoped">
        <p class="flex justify-center">
          <el-link
            type="primary"
            
            @click.prevent="handleShowDt(scoped.row)"
          >
            {{ scoped.row.xfkey }}
          </el-link>
        </p>
      </template>
      <template #agrCoefficient="{ row }">
        <p style="display: flex; align-items: center; justify-content: center">
          <i
            :style="{
              color: row.coefficient > 0 ? '#07c160' : '#ee0a24',
              fontStyle: 'normal'
            }"
          >
            {{ row.coefficient > 0 ? "⬆" : "⬇" }}
          </i>
          <span style="margin-left: 0.2rem">
            {{ Math.abs(row.agrCoefficient || 0) }}%
          </span>
        </p>
      </template>
    </DcTableItem>
  </el-table>
  <div>
    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.limit"
      :total="queryArr.length"
      :page-sizes="[10, 20, 30, 40, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      class="table-pagination"
      @size-change="(size) => changePagination(size, 'size')"
      @current-change="(page) => changePagination(page, 'page')"
    />
  </div>
  <PolicyDetailDialog
    v-model:visible="showDt"
    :policy-detail="currentItem"
    @showSenderInfo="handleShowSendInfo"
  ></PolicyDetailDialog>

  <com-dialog
    :model-value="companyDialogVisible"
    width="1000px"
    title="工商信息"
    @close="companyDialogVisible = false"
  >
    <CompanyBase :company-name="companyName"></CompanyBase>
  </com-dialog>
</template>
<script lang="ts" setup>
import { computed, ref, watch, reactive } from "vue";
import { GetPolicyListByStationName } from "../api";
import { DCTableColumn } from "@/components/DCLayout/store";
import DcTableItem from "@/components/DCLayout/TableColumn.vue";
import PolicyDetailDialog from "./policyDetailDialog.vue";
import DcGap from "@/components/Gap/index.vue";
import CompanyBase from "@/views/supplierV2/components/CompanyBase.vue";
import type { RailwayPolicyItemNew } from "../types";
import { DcDate } from "@dczy/tie-tools";

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
const tableLoading = ref(false);
const query = ref("");
const currentItem = ref<RailwayPolicyItemNew>();
const originList = ref<RailwayPolicyItemNew[]>([]);
const queryArr = computed(() => {
  const trimQuery = query.value.trim();
  return originList.value.filter((x) => {
    return (
      x.xfkey.toLowerCase().includes(trimQuery.toLowerCase()) ||
      x.goods.some((e) => e.name.includes(trimQuery)) ||
      x.station.some((e) => e.name.includes(trimQuery)) ||
      x.province.some((e) => e.name.includes(trimQuery)) ||
      x.bureau.some((e) => e.name.includes(trimQuery)) ||
      x.arrivalBureau.some((e) => e.name.includes(trimQuery)) ||
      x.arrivalProvince.some((e) => e.name.includes(trimQuery)) ||
      x.arrivalStation.some((e) => e.name.includes(trimQuery))
    );
  });
});

const filterArr = computed(() => {
  return queryArr.value.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );
});

const pagination = reactive({
  page: 1,
  limit: 10,
  totalCount: 0
});

const getPolicyList = () => {
  const payload = {
    arrivalStation: props.stationName,
    isBoth: true,
    isOnlyPrecise: true,
    isUsed: true,
    limit: 20,
    page: pagination.page,
    station: props.stationName
  };
  tableLoading.value = true;
  GetPolicyListByStationName(payload)
    .then(({ totalCount, items }) => {
      originList.value = items;
      pagination.totalCount = totalCount;
    })
    .finally(() => {
      tableLoading.value = false;
    });
};

const changePagination = (val: number, type: "size" | "page") => {
  if (type === "size") {
    pagination.limit = val;
  } else {
    pagination.page = val;
  }
};

const showDt = ref(false);
function handleShowDt(row: RailwayPolicyItemNew) {
  currentItem.value = row;
  showDt.value = true;
}
function handleCurrentRow(row: RailwayPolicyItemNew) {
  currentItem.value = row;
}

const companyDialogVisible = ref(false);
const companyName = ref("");
const handleShowSendInfo = (senderName: string) => {
  companyDialogVisible.value = !!senderName;
  companyName.value = senderName;
};

const tableCols = ref<DCTableColumn[]>([
  {
    label: "下浮批准号",
    name: "xfkey",
    headerAlign: "center",
    width: 150,
    type: "slot",
    span: 2,
    fixed: "left"
  },
  {
    label: "下浮比例",
    name: "agrCoefficient",
    headerAlign: "center",
    width: 100,
    span: 2,
    type: "slot"
  },
  {
    label: "发局(发站范围)",
    name: "SendRailwayBureau",
    align: "center",
    width: 250,
    formatter: (row: RailwayPolicyItemNew, col, cellValue) => {
      if (Array.isArray(row.bureau) && row.bureau.length) {
        return row.bureau.map((b) => b.name).join(", ");
      } else if (Array.isArray(row.station) && row.station.length) {
        return row.station.map((s) => s.name).join(", ");
      } else if (Array.isArray(row.province) && row.province.length) {
        return row.province.map((p) => p.name).join(", ");
      }
    }
  },
  {
    label: "到局(到站范围)",
    name: "ArrivalRailwayBureau",
    align: "center",
    width: 250,
    formatter: (row: RailwayPolicyItemNew, col, cellValue) => {
      if (Array.isArray(row.arrivalBureau) && row.arrivalBureau.length) {
        return row.arrivalBureau.map((b) => b.name).join(", ");
      } else if (
        Array.isArray(row.arrivalStation) &&
        row.arrivalStation.length
      ) {
        return row.arrivalStation.map((s) => s.name).join(", ");
      } else if (
        Array.isArray(row.arrivalProvince) &&
        row.arrivalProvince.length
      ) {
        return row.arrivalProvince.map((p) => p.name).join(", ");
      }
    }
  },
  {
    label: "箱型",
    name: "containerType",
    headerAlign: "center",
    width: 100,
    formatter: (row: RailwayPolicyItemNew, col, cellValue) => {
      const containerMark = `${row.containerType || ""}${
        row.containerTypeMark
          ? "(" + row.containerTypeMark === "1"
            ? "铁龙箱"
            : "非铁龙箱" + ")"
          : ""
      }`;
      const containerName = row.containerTypesName || "";
      return containerMark + containerName;
    }
  },
  {
    label: "品类品名",
    name: "goods",
    headerAlign: "center",
    width: 250,
    span: 3,
    formatter: (row: RailwayPolicyItemNew) => {
      return row.goods
        ?.map((e) => {
          return `(${e.code})${e.name}`;
        })
        .join(",");
    }
  },
  {
    label: "起始日期",
    name: "startDate",
    align: "center",
    width: 100,
    span: 2,
    formatter(row, column, cellValue, rindex?) {
      return DcDate.format(cellValue, "YYYY-MM-DD");
    }
  },
  {
    label: "终止日期",
    name: "endDate",
    align: "center",
    width: 100,
    formatter(row, column, cellValue, rindex?) {
      return DcDate.format(cellValue, "YYYY-MM-DD");
    }
  }
]);

let stop = () => {};
stop = watch(
  () => props.stationName,
  (v) => {
    v && getPolicyList();
    stop();
  }
);
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
