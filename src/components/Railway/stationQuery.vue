<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="站点查询"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpened"
    @close="showDetails = false"
  >
    <el-form :model="edit" label-suffix=":" inline size="small">
      <el-form-item label="地址">
        <el-input
          v-model="edit.address"
          placeholder="请输入地址信息"
        ></el-input>
      </el-form-item>
      <el-form-item label="" label-width="0">
        <el-button type="primary" @click="handleQuery">
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="nearList"
      border
      stripe
      size="small"
      highlight-current-row
      @current-change="handleCurrentChange"
    >
      <el-table-column
        label="距离"
        prop="distance"
        width="120"
        header-align="center"
      >
        <template #default="scope">{{ scope.row.distance }}公里</template>
      </el-table-column>
      <el-table-column
        width="120"
        header-align="center"
        label="站点编码"
        prop="RailwayStationCode"
      ></el-table-column>
      <el-table-column
        width="120"
        header-align="center"
        label="站点名称"
        prop="RailwayStationName"
      ></el-table-column>
      <el-table-column
        width="120"
        header-align="center"
        label="站点代码"
        prop="RailwayStationDbm"
      ></el-table-column>
      <el-table-column
        width="80"
        label="省"
        header-align="center"
        prop="ProvinceName"
      ></el-table-column>
      <el-table-column label="办理限制" prop="BusinessLimit"></el-table-column>
    </el-table>
    <template #footer>
      <el-button size="small" @click="showDetails = false">取消</el-button>
      <el-button type="primary" size="small" @click="handleOk">确定</el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts">
import { getRailwayStationTable, getRegionDataByAddress } from '@/api/railway/common'
import { getDistance } from "@/utils";
import { computed, reactive, toRefs, defineComponent } from "vue";
import { Message } from "../Message";

type LocationAttr = {
  address: string;
  province: string;
  city: string;
  district: string;
  regionCode: string;
  regionFullCode: string;
  regionFullName: string;
  lat: number;
  lng: number;
};

export default defineComponent({
  name: "",
  props: {
    modelValue: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ["update:modelValue", "change"],
  setup(props, { emit }) {
    const showDetails = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      }
    });
    const state = reactive({
      edit: {} as any,
      stationList: [] as any,
      nearList: [] as any,
      currentRow: {} as any
    });

    async function handleQuery() {
      if (!state.edit.address) {
        Message.warning("请输入地址信息");
        return;
      }
      const location = await getLocation(state.edit.address);
      if (location.lat && location.lng) {
        caclDistance(location);
      }
    }

    // 根据数据地址计算就近站到
    const caclDistance = (address: any) => {
      const start = { lat: address.lat, lng: address.lng };
      const stationData = [...state.stationList];
      const nearList: any = [];
      stationData.forEach((it: any) => {
        const sa = it.Address ? JSON.parse(it.Address) : {};
        if (sa.lat && sa.lng) {
          const end = { lat: sa.lat, lng: sa.lng };
          const distance = getDistance(start, end);
          if (distance <= 50 * 1000) {
            it.distance = Math.round((distance / 1000) * 100) / 100;
            nearList.push(it);
          }
        }
      });

      nearList.sort((a: any, b: any) => {
        return a.distance - b.distance;
      });
      state.nearList = nearList;
    };

    // 加载站到数据
    const loadData = async () => {
      const cacheData = localStorage.getItem("railway_station_data");
      if (cacheData) {
        state.stationList = JSON.parse(cacheData);
        return;
      }
      const [error, response] = await getRailwayStationTable()
      if (error || !response) return
      const items = response.data?.items || response.items
      state.stationList = Array.isArray(items) ? items : []
      localStorage.setItem("railway_station_data", JSON.stringify(state.stationList))
    };

    // 根据地址获取坐标
    async function getLocation(address: string) {
      const [error, response] = await getRegionDataByAddress(address)
      return error || !response ? ({} as LocationAttr) : (response as LocationAttr)
    }

    function handleOpened() {
      loadData();
    }

    function handleCurrentChange(row: any) {
      state.currentRow = row;
    }

    function handleOk() {
      if (!state.currentRow?.RailwayStationName) {
        Message.warning("请选中一条的站点数据！");
        return;
      }
      emit("change", state.currentRow.RailwayStationName, state.currentRow);
    }

    return {
      ...toRefs(state),
      showDetails,
      handleQuery,
      handleOpened,
      handleOk,
      handleCurrentChange
    };
  }
});
</script>

<style></style>
