<template>
  <DcLayout
    ref="layoutRef"
    :body-padding="false"
    :columns="TableColumn"
    :query-data="param"
    :table-data="list"
    :total="total"
    :loading="loading"
    :query-default-show="true"
    :show-quick-query="false"
    :show-bar="false"
    :operate="{ show: true, width: permission.singleUpdate ? 240 : 260 }"
    @pageChange="handlePageChange"
    @query="handleSearch"
    @search="handleSearch"
    @queryReset="param = { page: 1, pageSize: 20, stationProp: 'IsHyStation' }"
  >
    <template #queryBarCenter>
      <DcNotifyBar
        class="my-notify"
        :options="cmsShowList"
        @click="handleShowCms"
      ></DcNotifyBar>
    </template>
    <template #queryform>
      <el-form-item label="车站名称">
        <el-input
          v-model="param.railwayStationName"
          placeholder="请输入车站名称"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="false" label="车站编码">
        <el-input
          v-model="param.railwayStationCode"
          placeholder="请输入车站编码,tmism"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="false" label="车站代码">
        <el-input
          v-model="param.railwayStationDbm"
          placeholder="请输入车站代码，如:(SUH)"
        ></el-input>
      </el-form-item>
      <el-form-item label="路局">
        <el-select
          v-model="param.railwayBureauCode"
          placeholder="请选择路局信息"
          filterable
          clearable
          @change="handleChangeBureau"
        >
          <el-option
            v-for="(item, index) in bureauOptions"
            :key="index"
            :label="item.text"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车务段">
        <el-select
          v-model="param.railwayTrainCode"
          placeholder="请选择车务段"
          filterable
          clearable
        >
          <el-option
            v-for="(item, index) in trainDeptOptions"
            :key="index"
            :label="item.text"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="车站属性">
        <el-select
          v-model="param.stationProp"
          clearable
          placeholder="请选择车站属性"
        >
          <el-option label="全部" value=""></el-option>
          <el-option label="货运" value="IsHyStation"></el-option>
          <el-option label="高铁快运" value="IsCrhExpress"></el-option>
          <el-option label="行包快运" value="IsHbExpress"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="办理类型">
        <el-select
          v-model="param.transactType"
          clearable
          placeholder="请选择办理类型"
        >
          <el-option label="全部" :value="undefined"></el-option>
          <el-option label="集装箱办理站" value="isContainer"></el-option>
          <el-option label="危险品办理站" value="isDanger"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="区域公司">
        <DcAreaCompanySelect
          v-model="param.areaCompanyId"
          :clearable="true"
          :includeGroup="false"
          :isCommonlyUsed="true"
          placeholder="请选择区域公司"
        ></DcAreaCompanySelect>
      </el-form-item>
      <el-form-item label="省份">
        <el-select
          v-model="param.provinceName"
          placeholder="请选择省份"
          filterable
          clearable
          @change="handleChangeProvince"
        >
          <el-option
            v-for="(item, index) in provinceOptions"
            :key="index"
            :label="item.text"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="城市">
        <el-select
          v-model="param.cityName"
          placeholder="请选择省份"
          filterable
          clearable
        >
          <el-option
            v-for="(item, index) in cityOptions"
            :key="index"
            :label="item.text"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="站点分级">
        <el-select
          v-model="param.railwayStationGrade"
          clearable
          placeholder="请选择是否优势站点"
        >
          <el-option label="全部" :value="undefined"></el-option>
          <el-option
            v-for="item in stationScaleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="专用线名称">
        <!-- <el-select
          v-model="param.isImportant"
          clearable
          placeholder="请选择是否重要站点"
        >
          <el-option label="全部" :value="undefined"></el-option>
          <el-option label="是" :value="true"></el-option>
          <el-option label="否" :value="false"></el-option>
        </el-select> -->
        <el-input
          v-model="param.privatelineName"
          placeholder="请输入专用线名称"
        ></el-input>
      </el-form-item>
      <el-form-item label="驻站人员">
        <el-select
          v-model="param.isStationary"
          clearable
          placeholder="请选择是否有驻站人员"
        >
          <el-option label="全部" :value="undefined"></el-option>
          <el-option label="有" :value="true"></el-option>
          <el-option label="无" :value="false"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="协议签订">
        <el-select
          v-model="param.isAgreement"
          clearable
          placeholder="请选择是否协议签订"
        >
          <el-option label="全部" :value="undefined"></el-option>
          <el-option label="已签订" :value="true"></el-option>
          <el-option label="未签订" :value="false"></el-option>
        </el-select>
      </el-form-item>
    </template>
    <template #operate="scoped">
      <el-button
        type="primary"
        size="small"
        @click="gotoPage('map', scoped.row)"
      >
        地图
      </el-button>
      <!-- <el-button
        type="success"
        size="small"
        @click="gotoPage('details', scoped.row)"
      >
        详情
      </el-button> -->
      <el-dropdown
        v-if="permission.singleUpdate"
        @command="(c) => handleCommend(c, scoped.row)"
      >
        <el-button
          type="warning"
          size="small"
          class="ml-10"

        ></el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="Details">详情</el-dropdown-item>
            <el-dropdown-item command="Visit">新增拜访</el-dropdown-item>
            <el-dropdown-item command="AsyncUpdate">同步更新</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button
        v-else
        type="warning"
        size="small"
        @click="handleShowVisit(scoped.row)"
      >
        新增拜访
      </el-button>
      <!-- 
      <el-button
        type="danger"
        size="small"
        :disabled="!permission.singleUpdate"
        @click="handleAsyncUpdate(scoped.row)"
      >
        同步更新
      </el-button> -->
    </template>
    <template #railwayStationName="scoped">
      <el-link
        type="primary"
        href="javascript:void(0);"
        @click="gotoPage('details', scoped.row)"
      >
        {{ scoped.row.railwayStationName }}
      </el-link>
      <span class="theme-danger">
        <el-tooltip content="站点可用度" effect="light" placement="bottom">
          <span class="theme-danger cu-pointer">
            ({{ (scoped.row.rate || 0).toFixed(2) }}%)
          </span>
        </el-tooltip>
      </span>
      <span v-if="scoped.row.stationLevelMark" class="fr">
        <el-tooltip
          :content="scoped.row.stationLevelName"
          effect="light"
          placement="bottom"
        >
          <span
            class="cu-pointer"
            :style="{
              color: stationLevelColorMap.get(scoped.row.stationLevelMark)
            }"
          >
            {{ stationLevelTextMap.get(scoped.row.stationLevelMark) }}
          </span>
        </el-tooltip>
      </span>
      <div v-if="scoped.row.cmsNum || scoped.row.pictureNum">
        <el-tooltip
          content="重要通知，未读/总数；点击查看明细"
          effect="light"
          placement="bottom"
          v-if="scoped.row.cmsNum"
        >
          <span
            class="theme-color cu-pointer"
            @click="handleShowCms(scoped.row)"
          >
            通知({{ scoped.row.cmsNoReadNum }}/{{ scoped.row.cmsNum }})
          </span>
        </el-tooltip>
        <span class="theme-color" v-if="scoped.row.pictureNum">
          图片:{{ scoped.row.pictureNum }}张
        </span>
      </div>
    </template>
    <template #tags="scoped">
      <div class="station-tags">
        <el-tag
          v-for="tag in scoped.row.tags"
          :key="tag"
          :type="tagColorMap.get(tag)||'danger'"
          class="station-tag define"
        >
          {{ tag }}
        </el-tag>
      </div>
    </template>
    <!-- <template #buttonGroup>
      <el-button
        type="primary"

        @click="showEdit=true"
      >新增</el-button>
    </template> -->
    <template #hasPricePolicy="scoped">
      <div class="station-tags">
        <el-tag
          :type="scoped.row.hasPricePolicy ? 'success' : 'info'"
          class="station-tag define"
        >
          {{ scoped.row.hasPricePolicy ? "有优价" : "无" }}
        </el-tag>
      </div>
    </template>
    <template #hasPrivateLine="scoped">
      <div class="station-tags">
        <el-tag
          :type="scoped.row.hasPrivateLine ? 'success' : 'info'"
          class="station-tag define"
        >
          {{ scoped.row.hasPrivateLine ? "有专用线" : "无" }}
        </el-tag>
      </div>
    </template>
    <template #querybutton2>
      <el-dropdown @command="handleCommendAll" v-if="permission.allUpdate">
        <el-button type="danger" size="small">
          站点更新
          <DLegacyIcon name="arrow-down" class=" ml-5" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="all">全量更新</el-dropdown-item>
            <el-dropdown-item command="single">单站点更新</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button
        v-if="permissionadd"
        class="ml-10"
        type="primary"
        size="small"

        @click="showEdit=true"
      >新增</el-button>
      <el-button type="warning" size="small" class="ml-10" @click="addBusiness(true)">
            等级更新
      </el-button>
      <div
        class="fr"
        style="margin-right: 50px; line-height: 33px; cursor: pointer"
      >
        <span class="theme-warning fs-14 visited" @click="showVisitCount(true)">
          拜访统计
        </span>
      </div>
    </template>
    <template #querybutton>
      <!-- <el-dropdown @command="handleCommendAll">
        <el-button type="danger" style="visibility: hidden" class="mr-10">
          站点更新
          <DLegacyIcon name="arrow-down" class=" ml-5" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="all">全量更新</el-dropdown-item>
            <el-dropdown-item command="single">单站点更新</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown> -->
    </template>
    <VisitRecordForm
      v-model:show="showVisit"
      :station-id="currentStation.id"
      :station-name="currentStation.railwayStationName"
    ></VisitRecordForm>
    <CmsDialog
      v-model="showCms"
      :show-query="true"
      :business-id="cmsId"
    ></CmsDialog>
    <CmsDtDialog></CmsDtDialog>
    <VisitedCount
      v-model:show-dialog="showVisiteds"
      @close="showVisitCount(false)"
    />
    <EditForm
     v-model="showEdit"
     @success="handleSuccess"
  ></EditForm>
  <import-excel
    v-model:visable="showExcelImportDialog"
    title="站点等级导入"
    :loadding="importLoading"
    action-method="station-level"
    @submit="handleExcelImportData"
  >
    <template #otherButton>
      <el-button type="warning" @click="uploadTemplate">
        <span>模板文件</span>
        <span>下载</span>
      </el-button>
    </template>
  </import-excel>
  </DcLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import ImportExcel from "@/components/UploadImg/importExcel.vue";
import DcLayout from "@/components/DCLayout/indexExtented.vue";
import EditForm from "./components/baseInfoCreateForm.vue";
import { useList } from "./useListNew";
import {
  tagColorMap,
  stationLevelColorMap,
  stationLevelTextMap
} from "./store";
import DcAreaCompanySelect from "@/components/OrgAreaSelect/index.vue";
import DcNotifyBar from "@/components/NotifyBar/index.vue";
import VisitRecordForm from "./components/visitRecordForm2.vue";
import CmsDialog from "@/views/resource/resource-cms/table-dialog.vue";
import CmsDtDialog from "@/views/resource/resource-cms/dt-dialog.vue";
import VisitedCount from "@/views/resource-visit/visitedCount.vue";
import resourceCmsApi from "@/views/resource/resource-cms/api";
import { CmsHeadDto } from "@/views/resource/resource-cms/types";
import { checkFunPermissionAsync } from "@/utils/funPermissionChecked";
import { useRoute } from "vue-router";
import { uploadExcel } from "./api";
import {
  Download,
  PATH_URL
} from "@/request";
import router from "@/router";
import { ElMessage } from "element-plus";
const route = useRoute();
const cmsList = ref<CmsHeadDto[]>([]);
const cmsShowList = computed(() => {
  if (!cmsList.value?.length) {
    return ["暂无通知"];
  }
  return cmsList.value.map((x, index) => {
    return x.businessName
      ? `${index + 1}、${x.title}(${x.businessName}站)`
      : `${index + 1}、${x.title}`;
  });
});
function loadCmsList() {
  resourceCmsApi.Query({ page: 1, pageSize: 5 }).then((res) => {
    cmsList.value = res.items || [];
  });
}
const showVisiteds = ref(false);
function showVisitCount(val: boolean) {
  showVisiteds.value = val;
}

function handleCommend(commend, row) {
  if (commend == "Visit") handleShowVisit(row);
  if (commend == "AsyncUpdate") handleAsyncUpdate(row);
  if (commend == "Details") gotoPage("details", row);
}
function handleCommendAll(commend) {
  handleAsyncUpdate(undefined, commend !== "all");
}
const stationScaleOptions = [
  { label: "核心站点", value: "Core" },
  { label: "重要站点", value: "Important" },
  { label: "普通站点", value: "Ordinary" },
  { label: "待开发站点", value: "Todo" }
];
const showEdit = ref(false);
function handleSuccess() {
  handleSearch('');
}
  const importLoading = ref(false)
  const showExcelImportDialog = ref(false);
  function handleExcelImportData(payload: any, fileList: Array<any>) {
    importLoading.value = true
    const  raw = fileList[0].response.path;
    uploadExcel(raw).then((res: any) => {
      handleSearch('');
      //businessList.value.push(...res);
      showExcelImportDialog.value = false;
      ElMessage.success("导入完成");
    }).finally(() => {
    importLoading.value = false
    });
  }
  function uploadTemplate() {
    const fileUrl = `${PATH_URL}/uploadFile/站点等级导入模版.xlsx`;
    Download(fileUrl, "站点等级导入模版.xlsx");
  }
  function addBusiness(useExcel = false) {
      if (useExcel) {
        showExcelImportDialog.value = true;
      }
    }
  //   function handleImportData(fileInfo:any) {
  //   return api
  //     .OpionDefine(`line-import?path=` + fileInfo.FilePath, null, "GET")
  //     .then((res) => {
  //         if (res && res.isSuccessful) {
  //           showImportDialog.value = false;
  //           ElMessageBox({ message: '操作成功', type: 'success' });
  //           loadData();
  //         } else {
  //           ElMessageBox({ message: res.message, type: 'error' });
  //         }
  //     });
  // }
const permissionadd = ref(false);
const {
  layoutRef,
  list,
  loading,
  total,
  bureauOptions,
  trainDeptOptions,
  provinceOptions,
  cityOptions,
  param,
  TableColumn,
  showVisit,
  showCms,
  cmsId,
  currentStation,
  permission,
  handleChangeBureau,
  handleChangeProvince,
  gotoPage,
  handleSearch,
  handlePageChange,
  handleShowVisit,
  handleShowCms,
  handleAsyncUpdate
} = useList();

onMounted(() => {
  checkFunPermissionAsync(route.path, "newRailwayStation").then(
      (res) => {
        permissionadd.value = !!res;
      });
  loadCmsList();
});
</script>

<style lang="less" scoped>
@import url("./style.less");
.visited:before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}
</style>
