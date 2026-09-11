<template>
  <div v-loading="loading">
    <el-descriptions :column="4" border>
      <el-descriptions-item label="批准号" :span="2">
        {{ policy.xfkey || '-' }}
        <span v-if="nature" class="theme-success">【{{ nature }}】</span>
        <span v-if="policy.isUsed === false" class="theme-danger">（不可用）</span>
      </el-descriptions-item>
      <el-descriptions-item label="项目类型" :span="2">{{
        policy.policyType || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="运费价差系数" :span="2">
        <span class="theme-danger">{{ arrow }} {{ Math.abs(policy.coefficient || 0) }}%</span>
      </el-descriptions-item>
      <el-descriptions-item label="发货人" :span="2">
        <template v-for="sender in splitSenders(policy.sender)" :key="sender">
          <el-link
            :type="sender.includes('公司') ? 'primary' : 'info'"
            :underline="false"
            @click="sender.includes('公司') && emit('sender', sender)"
            >{{ sender }}</el-link
          >
          <span> </span>
        </template>
        <span v-if="!splitSenders(policy.sender).length">-</span>
      </el-descriptions-item>
      <el-descriptions-item label="箱型">{{ policy.containerType || '-' }}</el-descriptions-item>
      <el-descriptions-item label="特殊箱型">{{
        policy.containerTypesName || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="车型">{{ policy.trainType || '-' }}</el-descriptions-item>
      <el-descriptions-item label="票种">{{ policy.ticketType || '-' }}</el-descriptions-item>
      <el-descriptions-item label="发局" :span="2">{{
        withExclude(policy.bureauName, policy.excludeBureauName)
      }}</el-descriptions-item>
      <el-descriptions-item label="发货省" :span="2">{{
        withExclude(policy.provinceName, policy.excludeProvinceName)
      }}</el-descriptions-item>
      <el-descriptions-item label="发站" :span="2">{{
        withExclude(policy.stationName, policy.excludeStationName)
      }}</el-descriptions-item>
      <el-descriptions-item label="到局" :span="2">{{
        withExclude(policy.arrivalBureauName, policy.arrivalExcludeBureauName)
      }}</el-descriptions-item>
      <el-descriptions-item label="到货省" :span="2">{{
        withExclude(policy.arrivalProvinceName, policy.arrivalExcludeProvinceName)
      }}</el-descriptions-item>
      <el-descriptions-item label="到站" :span="2">{{
        withExclude(policy.arrivalStationName, policy.arrivalExcludeStationName)
      }}</el-descriptions-item>
      <el-descriptions-item label="品类/品名" :span="2">{{
        policy.goodsName || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="品类/品名（不含）" :span="2">{{
        policy.excludeGoodsName || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="有效期" :span="2">{{ dateRange }}</el-descriptions-item>
      <el-descriptions-item label="运输范围" :span="2">{{
        policy.scope || '-'
      }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="4">{{ policy.remark || '-' }}</el-descriptions-item>
    </el-descriptions>

    <template v-if="policy.policyExs?.length">
      <DcGap class="detail-gap">保量信息</DcGap>
      <PolicyExTable :ex-list="policy.policyExs" />
    </template>
    <DcGap class="detail-gap">其他费用下浮明细</DcGap>
    <el-table :data="policy.details || []" border size="small" stripe>
      <el-table-column label="序号" align="center" width="70" type="index" />
      <el-table-column label="下浮档次" prop="lowerGrade" width="100" align="center" />
      <el-table-column label="费用项目" prop="chargeTypeName" align="center" />
      <el-table-column label="价差系数%" width="130" align="center">
        <template #default="{ row }">
          <span class="theme-danger"
            >{{ (row.coefficient || 0) > 0 ? '↑' : '↓' }}
            {{ Math.abs(row.coefficient || 0) }}%</span
          >
        </template>
      </el-table-column>
      <template #empty><el-empty :image-size="48" description="暂无费用明细" /></template>
    </el-table>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import DcGap from '@/components/Gap/index.vue'
  import PolicyExTable from './policy-ex-table.vue'
  import { RailwayNatureEnum } from '../types'
  import type { PolicyAllSimpleRecordDto } from '../types'
  import { splitSenders } from '../logic'

  const props = withDefaults(
    defineProps<{ policy?: PolicyAllSimpleRecordDto; loading?: boolean }>(),
    {
      policy: () => ({}),
      loading: false
    }
  )
  const emit = defineEmits<{ sender: [name: string] }>()
  const nature = computed(
    () => RailwayNatureEnum.getSelf(props.policy.railwayNatureType || 0)?.label || ''
  )
  const arrow = computed(() => ((props.policy.coefficient || 0) > 0 ? '↑' : '↓'))
  const dateRange = computed(
    () =>
      [props.policy.startDate?.slice(0, 10), props.policy.endDate?.slice(0, 10)]
        .filter(Boolean)
        .join(' 至 ') || '-'
  )
  const withExclude = (value?: string, exclude?: string) =>
    [value || '-', exclude ? `不含：${exclude}` : ''].filter(Boolean).join('；')
</script>

<style scoped lang="less">
  .detail-gap {
    margin-top: 12px;
  }
</style>
