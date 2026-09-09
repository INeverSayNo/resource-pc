<template>
  <DcGap class="bar">
    接取送达记录
    <!-- <span class="theme-color">(昨日共{{ yestodayList?.length || 0 }}车次)</span> -->
  </DcGap>
  <el-table
    :data="statisticData"
    :max-height="360"
    size="small"
    border
    stripe
    highlight-current-row
  >
    <el-table-column
      label="本月接取送达情况"
      align="center"
      show-overflow-tooltip
      prop="monthData"
    >
      <template #default="scoped">
        <span class="bar-btn theme-danger cu-pointer">
          {{ scoped.row.monthData }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      label="本周接取送达情况"
      align="center"
      show-overflow-tooltip
      prop="weekData"
    >
      <template #default="scoped">
        <span class="bar-btn theme-danger cu-pointer">
          {{ scoped.row.weekData }}
        </span>
      </template>
    </el-table-column>
  </el-table>
  <el-table
    :data="yestodayList"
    :max-height="200"
    size="small"
    border
    stripe
    highlight-current-row
  >
    <el-table-column type="index" label="序号" align="center"></el-table-column>
    <el-table-column
      label="供应商名称"
      align="center"
      show-overflow-tooltip
      prop="supplierErpName"
    >
      <template #default="scoped">
        <el-link
          type="primary"
          size="small"
          @click.prevent="handleShowSupplierDt(scoped.row.supplierErpId)"
        >
          {{ scoped.row.supplierErpName }}
        </el-link>
      </template>
    </el-table-column>
    <el-table-column
      label="接取/送达地址"
      align="center"
      show-overflow-tooltip
      prop="arrivalAddress"
    ></el-table-column>
    <el-table-column
      label="承运重量：吨"
      align="center"
      show-overflow-tooltip
      prop="weight"
    ></el-table-column>
    <el-table-column
      label="成本"
      align="center"
      show-overflow-tooltip
      prop="costPrice"
    ></el-table-column>
    <el-table-column
      label="运输货物"
      align="center"
      show-overflow-tooltip
      prop="goodsName"
    ></el-table-column>
    <el-table-column
      label="车牌"
      align="center"
      show-overflow-tooltip
      prop="carNum"
    ></el-table-column>
    <el-table-column
      label="调度日期"
      align="center"
      show-overflow-tooltip
      prop="dispatchDate"
    >
      <template #default="scoped">
        {{ formatTime(scoped.row.dispatchDate, "yyyy-MM-dd") }}
      </template>
    </el-table-column>
    <el-table-column
      label="接取/送达"
      align="center"
      show-overflow-tooltip
      prop="getOrSend"
    ></el-table-column>
  </el-table>
  <SupplierDtDailog
    v-model:visable="showSupplierDt"
    :supplier-id="dtSupplierId"
  ></SupplierDtDailog>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, toRefs } from "vue";
import {
  RailwayStationHighwayDispatch,
  RailWayStationHighwayDispatchItem
} from "../types";
import { formatTime } from "@/utils";
import DcGap from "@/components/Gap/index.vue";
import { GetStationHighwayDispatch } from "../api";
import SupplierDtDailog from "@/views/supplierV2/dtDialog.vue";

export default defineComponent({
  components: {
    DcGap,
    SupplierDtDailog
  },
  props: {
    stationName: {
      type: String,
      default: () => ""
    }
  },
  emits: ["reload"],
  setup(props, { emit }) {
    const showSupplierDt = ref(false);
    const dtSupplierId = ref("");
    const state = reactive({
      loading: false,
      yestodayList: [] as RailWayStationHighwayDispatchItem[],
      statisticData: [] as RailwayStationHighwayDispatch[],
      weekData: "",
      monthData: ""
    });

    function handleSuccess() {
      emit("reload");
    }
    function loadStationHighwayDispatch() {
      state.loading = true;
      GetStationHighwayDispatch(props.stationName)
        .then((res) => {
          state.statisticData.push(res);
          state.yestodayList = res.yestodayDispatchList;
          state.weekData = res.weekData;
          state.monthData = res.monthData;
        })
        .finally(() => {
          state.loading = false;
        });
    }
    function handleShowSupplierDt(supplierErpId: string) {
      dtSupplierId.value = supplierErpId;
      showSupplierDt.value = true;
    }
    onMounted(() => {
      loadStationHighwayDispatch();
    });
    return {
      ...toRefs(state),
      formatTime,
      handleSuccess,
      handleShowSupplierDt,
      showSupplierDt,
      dtSupplierId
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
