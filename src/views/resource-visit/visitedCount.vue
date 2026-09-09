<template>
  <com-dialog
    title="拜访统计"
    :model-value="showDialog"
    width="60%"
    :show-fullscreen="true"
    :close-on-click-modal="false"
  >
    <dc-layout
      ref="layoutRef"
      class="visted-count-layout"
      :show-bar="false"
      :show-more-query="true"
      :query-default-show="true"
      :show-quick-query="false"
      :table-data="tableData"
      :columns="columns"
      :title="state.title"
      :operate="{ show: false }"
      size="default"
      :show-pagination="false"
      :loading="isLoading"
      :fix-table-height="{ height: 100, isFixed: false }"
      @query-reset="handleReset"
      @query="handleQuery"
    >
      <template #queryform>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="AreaId" label="区域公司" style="width: 100%">
              <org-area-select
                v-model="state.query.AreaId"
                @change="areaChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="User" label="公司人员" style="width: 100%">
              <UserSelectV2
                v-model:visable="state.showUser"
                v-model:label="state.query.UserName"
                v-model="state.query.UserId"
                clearable
                is-reduce
                :show-tree="false"
                title="人员选择"
                @change="changeSelect"
                @close="state.showUser = false"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="VisitType" label="拜访方式" style="width: 100%">
              <el-select
                v-model="state.query.VisitType"
                clearable
                placeholder="请选择拜访方式"
                @change="visitTypeChange"
              >
                <el-option
                  v-for="item in state.visitWayOptions"
                  :key="item.value"
                  :label="item.value"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item prop="visitDate" label="拜访时段" style="width: 60%">
          <el-date-picker
            v-model="state.datetime"
            type="daterange"
            start-placeholder="起始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
      </template>
    </dc-layout>
  </com-dialog>
</template>
<script lang="ts">
import DcLayout from "@/components/DCLayout/indexExtented.vue";
import { DCTableColumn } from "@/components/DCLayout/store";
import UserSelectV2 from "@/components/TableUserSelectV2/selectField.vue";
import OrgAreaSelect from "@/components/OrgAreaSelect/index.vue";
import { defineComponent, reactive, ref, onMounted } from "vue";
import { VisitStatisticsParam, VisitStatisticsResultDto } from "./types";
import ResourceVisitApi from "./api";
import { formatTime } from "@/utils";

const api = new ResourceVisitApi();

const columns: DCTableColumn[] = [
  { name: "areaName", label: "区域公司", align: "center" },
  { name: "userName", label: "公司人员", align: "center" },
  { name: "visitType", label: "拜访方式", align: "center" },
  { name: "visitCount", label: "总数", align: "center" }
];

const visitWays = [
  {
    value: "到访"
  },
  {
    value: "电话"
  },
  {
    value: "微信"
  }
];
const defaultVisit = {
  VisitBusinessType: 1,
  AreaId: null,
  VisitType: null,
  StartDate: null,
  EndDate: null,
  UserId: null,
  UserName: null
} as VisitStatisticsParam;
export default defineComponent({
  name: "VisitedCount",
  components: {
    DcLayout,
    UserSelectV2,
    OrgAreaSelect
  },
  props: {
    showDialog: {
      type: Boolean,
      default: () => {
        return false;
      }
    }
  },
  setup() {
    const state = reactive({
      title: "供应商拜访统计",
      query: ref<any>({
        ...defaultVisit
      }),
      showUser: false,
      datetime: ref([] as string[]),
      visitWayOptions: visitWays
    });

    const isLoading = ref(false);
    const tableData = ref([] as VisitStatisticsResultDto[]);
    const handleReset = () => {
      state.query = { ...defaultVisit };
      state.datetime = [];
    };
	
    const handleQuery = () => {
      const params = { ...state.query } as VisitStatisticsParam;

      if (state.datetime.length > 0) {
        params.StartDate = formatTime(state.datetime[0], "yyyy-MM-dd");
        params.EndDate = formatTime(state.datetime[1], "yyyy-MM-dd");
      } else {
        params.StartDate = null;
        params.EndDate = null;
      }
      submit(params);
    };
    const visitTypeChange = (val) => {
      if (!val || val.length === 0) {
        state.query.VisitType = null;
      }
    };
    const areaChange = (id: string) => {
      if (!id || id.length === 0) {
        state.query.AreaId = null;
      }
    };
    const changeSelect = (val, data) => {
      if (val && data) {
        state.query.UserId = val;
        state.query.UserName = data.userName;
      } else {
        state.query.UserId = null
        state.query.UserName = null
      }
    };
    const submit = async(val) => {
      isLoading.value = true;
      api.Statistics(val).then((res) => {
        if (res.isSuccessful) {
          let count = 0
          tableData.value = res.data

          for (const item of res.data) {
            count += item.visitCount
          }

          tableData.value.push({
            areaName: '合计',
            userName: '',
            visitType: '',
            visitCount: count
          })
        }
      });
      isLoading.value = false;
    };
    onMounted(async () => {
      submit(defaultVisit);
    });
    return {
      isLoading,
      columns,
      state,
      tableData,
      visitTypeChange,
      areaChange,
      handleReset,
      handleQuery,
      changeSelect
    };
  }
});
</script>
<style lang="less">
.visted-count-layout .el-table {
  height: 360px !important;
  overflow: auto;
}

</style>
