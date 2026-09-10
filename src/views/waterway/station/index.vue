<template>
  <DcLayout
    ref="layoutRef"
    :body-padding="false"
    :columns="tableColumns"
    :query-data="param"
    :table-data="list"
    :total="total"
    :loading="loading"
    :query-default-show="true"
    :show-quick-query="true"
    :show-bar="true"
    :operate="{ show: true, width: 120 }"
    @pageChange="handlePageChange"
    @query="handleSearch"
    @search="handleSearch"
    @queryReset="resetQuery"
  >
    <template #queryform>
      <el-form-item label="港口全称">
        <el-input v-model="param.portName" placeholder="请输入港口全称/简称" />
      </el-form-item>
      <el-form-item label="港口分类">
        <el-select v-model="param.portType" placeholder="请选择港口分类信息" filterable clearable>
          <el-option v-for="item in stationGradeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="港口分级">
        <el-select v-model="param.portScale" placeholder="请选择港口分级信息" filterable clearable>
          <el-option
            v-for="item in stationScaleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="区域公司">
        <DcAreaCompanySelect v-model="param.areaName" clearable placeholder="请选择区域公司" />
      </el-form-item>
      <el-form-item label="省份">
        <el-select
          v-model="param.deptName"
          placeholder="请选择省份"
          filterable
          clearable
          @change="handleChangeProvince"
        >
          <el-option
            v-for="item in provinceOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="城市">
        <el-select v-model="param.cityName" placeholder="请选择城市" filterable clearable>
          <el-option
            v-for="item in cityOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </template>

    <template #operate="scoped">
      <el-button type="success" size="small" @click="gotoDetails(scoped.row)">详情</el-button>
    </template>

    <template #buttonGroup>
      <el-button type="primary" @click="showAdd = true">
        <DAliIcon name="plus" />
        新增
      </el-button>
    </template>

    <template #PortAreaName="scoped">
      <el-link type="primary" @click="gotoDetails(scoped.row)">
        {{ scoped.row.PortAreaName }}
      </el-link>
      <span v-if="scoped.row.PortScale" class="fr">
        <el-tooltip
          :content="stationLevelNameMap.get(scoped.row.PortScale)"
          effect="light"
          placement="bottom"
        >
          <span
            class="cu-pointer"
            :style="{ color: stationLevelColorMap.get(scoped.row.PortScale) }"
          >
            {{ stationLevelTextMap.get(scoped.row.PortScale) }}
          </span>
        </el-tooltip>
      </span>
    </template>
  </DcLayout>

  <BaseInfoForm v-model="showAdd" @success="loadData" />
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import DcLayout from '@/components/DCLayout/indexExtented.vue'
  import DcAreaCompanySelect from '@/components/OrgAreaSelect/index.vue'
  import BaseInfoForm from './components/baseInfoForm.vue'
  import { useWaterwayPortList } from './useListNew'
  import { stationLevelColorMap, stationLevelNameMap, stationLevelTextMap } from './store'

  const showAdd = ref(false)
  const {
    layoutRef,
    list,
    loading,
    total,
    provinceOptions,
    cityOptions,
    param,
    tableColumns,
    handleChangeProvince,
    gotoDetails,
    handleSearch,
    handlePageChange,
    resetQuery,
    stationGradeOptions,
    stationScaleOptions,
    loadData
  } = useWaterwayPortList()
</script>

<style lang="less" scoped>
  @import url('./style.less');
</style>
