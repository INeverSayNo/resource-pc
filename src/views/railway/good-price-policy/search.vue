<template>
  <DcLayout
    :columns="mainTableCols"
    :table-data="list"
    :total="total"
    :page-size="query.pageSize"
    :loading="loading"
    :show-quick-query="false"
    :show-bar="false"
    :query-default-show="true"
    :show-pagination="false"
  >
    <template #defineQueryform>
      <SearchForm
        :model-value="query"
        :map-mode="activeTab === 'map'"
        :can-import="canImport"
        @update:model-value="replaceQuery"
        @query="handleQuery"
        @reset="handleReset"
        @batch="showBatch = true"
        @import="showImport = true"
      />
    </template>

    <template #main="{ height }">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="列表" name="list">
          <el-table
            v-loading="loading"
            :data="list"
            :height="Math.max(400, height - 96)"
            border
            stripe
            row-key="id"
            :row-class-name="rowClassName"
            @expand-change="handleExpand"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column type="expand" width="48">
              <template #default="{ row }">
                <el-table v-loading="row.dtLoading" :data="row.details || []" border size="small">
                  <el-table-column type="index" label="序号" width="60" align="center" />
                  <TableColumn :columns="detailsTableCols">
                    <template #coefficient="{ row: detail }">
                      <span class="theme-danger"
                        >{{ detail.coefficient > 0 ? '↑' : '↓' }}
                        {{ Math.abs(detail.coefficient || 0) }}%</span
                      >
                    </template>
                  </TableColumn>
                </el-table>
              </template>
            </el-table-column>
            <TableColumn :columns="mainTableCols">
              <template #xfkey="{ row }">
                <el-link type="primary" :underline="false" @click="openDetail(row)">
                  {{ row.xfkey || '-' }}
                  <span v-if="row.policyExs?.length" class="theme-success">（查看保量）</span>
                  <span v-if="row.isExpiration" class="theme-danger">（已过期）</span>
                </el-link>
              </template>
              <template #coefficient="{ row }">
                <span class="theme-danger"
                  >{{ row.coefficient > 0 ? '↑' : '↓' }} {{ Math.abs(row.coefficient || 0) }}%</span
                >
              </template>
              <template #sender="{ row }">
                <template v-for="(sender, index) in splitSenders(row.sender)" :key="sender">
                  <el-link
                    :type="sender.includes('公司') ? 'primary' : 'info'"
                    :underline="false"
                    @click="showCompany(sender)"
                    >{{ sender }}</el-link
                  >
                  <span v-if="index < splitSenders(row.sender).length - 1">，</span>
                </template>
              </template>
              <template #station="{ row }"
                ><PolicyStations
                  :items="row.station"
                  :fallback="[row.provinceName, row.bureauName].filter(Boolean).join('，')"
                  :exclude="
                    [row.excludeProvinceName, row.excludeBureauName, row.excludeStationName]
                      .filter(Boolean)
                      .join('，')
                  "
                  @open="gotoStation"
              /></template>
              <template #arrivalStation="{ row }"
                ><PolicyStations
                  :items="row.arrivalStation"
                  :fallback="
                    [row.arrivalProvinceName, row.arrivalBureauName].filter(Boolean).join('，')
                  "
                  :exclude="
                    [
                      row.arrivalExcludeProvinceName,
                      row.arrivalExcludeBureauName,
                      row.arrivalExcludeStationName
                    ]
                      .filter(Boolean)
                      .join('，')
                  "
                  @open="gotoStation"
              /></template>
              <template #goodsName="{ row }">
                <el-link type="primary" :underline="false" @click="openGoods(row)">{{
                  row.goodsName || '-'
                }}</el-link>
              </template>
            </TableColumn>
            <el-table-column v-if="canEdit" label="操作" fixed="right" width="90" align="center">
              <template #default="{ row }"
                ><el-button type="primary" @click="openEdit(row)">编辑</el-button></template
              >
            </el-table-column>
            <template #empty><el-empty description="暂无优价政策" /></template>
          </el-table>
          <el-pagination
            v-model:current-page="query.page"
            v-model:page-size="query.pageSize"
            class="table-pagination"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handlePageSizeChange"
            @current-change="loadList"
          />
        </el-tab-pane>
        <el-tab-pane label="地图" name="map" lazy>
          <PolicyMap
            ref="policyMapRef"
            :query="query"
            :height="Math.max(480, height - 44)"
            @detail="openMapDetail"
          />
        </el-tab-pane>
      </el-tabs>
    </template>
  </DcLayout>

  <com-dialog
    :model-value="showDetail"
    :width="1000"
    title="优价详情"
    :destroy-on-close="true"
    @close="showDetail = false"
  >
    <PolicyDetail :policy="currentPolicy" :loading="detailLoading" @sender="showCompany" />
  </com-dialog>
  <GoodsDialog v-model:show="showGoods" :policy="currentPolicy" />
  <PolicyEdit v-model:show="showEdit" :policy="editPolicy" @success="loadList" />
  <ExcelDialog v-model:show="showBatch" mode="query" />
  <ExcelDialog v-model:show="showImport" mode="import" @success="handleImportSuccess" />
  <com-dialog
    :model-value="companyVisible"
    :width="1000"
    title="工商信息"
    @close="companyVisible = false"
  >
    <CompanyBase :company-name="companyName" />
  </com-dialog>
</template>

<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useRoute, useRouter } from 'vue-router'
  import DcLayout from '@/components/DCLayout/indexExtented.vue'
  import TableColumn from '@/components/DCLayout/TableColumn.vue'
  import CompanyBase from '@/views/supplierV2/components/CompanyBase.vue'
  import { checkFunPermissionAsync } from '@/utils/funPermissionChecked'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import { searchPolicies, getPolicyDetails } from './api'
  import { mainTableCols, detailsTableCols } from './tableSetting'
  import {
    buildPolicyListQuery,
    createPolicyQuery,
    normalizePolicyDetails,
    normalizePolicyRecord,
    resetPolicyQuery,
    splitSenders
  } from './logic'
  import type {
    CodeName,
    PolicyAllSimpleRecordDto,
    PolicySimpleResult,
    PricePolicyQueryParam
  } from './types'
  import SearchForm from './components/search-form.vue'
  import GoodsDialog from './components/goods-dialog.vue'
  import PolicyEdit from './components/policy-edit.vue'
  import ExcelDialog from './components/excel-dialog.vue'
  import PolicyMap from './components/policy-map.vue'
  import PolicyDetail from './components/policy-detail.vue'
  import PolicyStations from './components/policy-stations.vue'

  defineOptions({ name: 'GoodPricePolicySearch' })

  interface PolicyMapRef {
    load: () => Promise<void>
  }

  const route = useRoute()
  const router = useRouter()
  const { SetTrace } = useStatisticTrace()
  const query = reactive<PricePolicyQueryParam>(createPolicyQuery(route.query))
  const list = ref<PolicyAllSimpleRecordDto[]>([])
  const total = ref(0)
  const loading = ref(false)
  const detailLoading = ref(false)
  const activeTab = ref<'list' | 'map'>('list')
  const policyMapRef = ref<PolicyMapRef>()
  const currentPolicy = ref<PolicyAllSimpleRecordDto>({})
  const editPolicy = ref<PolicyAllSimpleRecordDto>({})
  const showDetail = ref(false)
  const showGoods = ref(false)
  const showEdit = ref(false)
  const showBatch = ref(false)
  const showImport = ref(false)
  const canEdit = ref(false)
  const canImport = ref(false)
  const companyVisible = ref(false)
  const companyName = ref('')
  let listController: AbortController | undefined
  const detailControllers = new Set<AbortController>()
  let requestSequence = 0

  const replaceQuery = (next: PricePolicyQueryParam) => {
    for (const key of Object.keys(query)) Reflect.deleteProperty(query, key)
    Object.assign(query, next)
  }

  const loadList = async () => {
    listController?.abort()
    listController = new AbortController()
    const sequence = ++requestSequence
    loading.value = true
    const [error, result] = await searchPolicies(buildPolicyListQuery(query), {
      signal: listController.signal
    })
    if (sequence !== requestSequence || listController.signal.aborted) return
    loading.value = false
    if (error) ElMessage.error(error.message || '优价政策加载失败')
    list.value = (result.items || []).map(normalizePolicyRecord)
    total.value = result.totalCount || 0
    SetTrace('$SELECT', '铁路全国优价', '全国优价', undefined, list.value.length)
  }

  const handleQuery = () => {
    query.page = 1
    if (activeTab.value === 'map') void policyMapRef.value?.load()
    else void loadList()
  }
  const handleReset = () => {
    replaceQuery(resetPolicyQuery())
    handleQuery()
  }
  const handlePageSizeChange = () => {
    query.page = 1
    void loadList()
  }
  const handleTabChange = () => {
    if (activeTab.value === 'map') nextTick(() => void policyMapRef.value?.load())
  }

  const ensureDetails = async (policy: PolicyAllSimpleRecordDto) => {
    if (!policy.policyId || policy.details?.length) return
    const controller = new AbortController()
    detailControllers.add(controller)
    policy.dtLoading = true
    const [error, details] = await getPolicyDetails(policy.policyId, {
      signal: controller.signal
    })
    policy.dtLoading = false
    detailControllers.delete(controller)
    if (controller.signal.aborted) return
    if (error) {
      ElMessage.error(error.message || '优价费用明细加载失败')
      return
    }
    policy.details = normalizePolicyDetails(details)
  }
  const handleExpand = (row: PolicyAllSimpleRecordDto, expanded: PolicyAllSimpleRecordDto[]) => {
    if (expanded.some((item) => item.id === row.id)) void ensureDetails(row)
  }
  const openDetail = (row: PolicyAllSimpleRecordDto) => {
    currentPolicy.value = row
    showDetail.value = true
    void ensureDetails(row)
  }
  const openMapDetail = async (item: PolicySimpleResult) => {
    detailLoading.value = true
    showDetail.value = true
    const [error, result] = await searchPolicies({
      policyId: item.policyId,
      xfkey: item.xfkey,
      page: 1,
      pageSize: 1,
      includeExpiration: true,
      isUsed: true
    })
    if (error || !result.items?.length) {
      detailLoading.value = false
      currentPolicy.value = { ...item }
      ElMessage.error(error?.message || '优价详情加载失败')
      return
    }
    currentPolicy.value = normalizePolicyRecord(result.items[0])
    await ensureDetails(currentPolicy.value)
    detailLoading.value = false
  }
  const openGoods = (row: PolicyAllSimpleRecordDto) => {
    currentPolicy.value = row
    showGoods.value = true
  }
  const openEdit = (row: PolicyAllSimpleRecordDto) => {
    editPolicy.value = row
    showEdit.value = true
  }
  const showCompany = (name: string) => {
    if (!name.includes('公司')) return
    companyName.value = name
    companyVisible.value = true
  }
  const gotoStation = (station: CodeName) => {
    if (!station.code || !router.hasRoute('RailwayStationDetail')) return
    void router.push({
      path: '/resource-app/station-dt',
      query: { id: station.code, name: station.name }
    })
  }
  const handleImportSuccess = () => {
    query.page = 1
    void loadList()
  }
  const rowClassName = ({ row }: { row: PolicyAllSimpleRecordDto }) =>
    row.isUsed === false ? 'theme-danger' : ''

  watch(
    () => route.query,
    (value) => {
      replaceQuery(createPolicyQuery(value))
      handleQuery()
    }
  )

  onMounted(() => {
    void Promise.all([
      checkFunPermissionAsync(route.path, 'edit'),
      checkFunPermissionAsync(route.path, 'import')
    ]).then(([edit, importPermission]) => {
      canEdit.value = edit === true
      canImport.value = importPermission === true
    })
    void loadList()
  })
  onBeforeUnmount(() => {
    listController?.abort()
    for (const controller of detailControllers) controller.abort()
    detailControllers.clear()
  })
</script>

<style scoped lang="less">
  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
  .table-pagination {
    justify-content: flex-end;
    padding: 12px 0;
  }
</style>
