<template>
  <el-table size="small" border stripe :data="exList">
    <el-table-column label="考核类型" prop="quantityRequire" width="120" align="center" />
    <el-table-column label="考核值" align="center" width="180">
      <template #default="{ row }">{{ row.quantity }} {{ row.quantityUnit }}</template>
    </el-table-column>
    <el-table-column label="价差系数%" align="center" width="150">
      <template #default="{ row }">{{ ((row.diffCoefficient || 0) * 100).toFixed(2) }}</template>
    </el-table-column>
    <el-table-column label="发货人" prop="sender" align="center" />
    <el-table-column label="优惠价格" align="center" width="200">
      <template #default="{ row }">{{ row.discountsPrice }} {{ row.discountsUnit }}</template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
  import type { RailwayGoodPricePolicyEx } from '../../station/types'
  withDefaults(defineProps<{ exList?: RailwayGoodPricePolicyEx[] }>(), { exList: () => [] })
</script>
