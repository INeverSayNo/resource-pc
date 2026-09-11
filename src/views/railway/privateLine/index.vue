<template>
  <DcLayout
    ref="layoutRef"
    :columns="privateLineTableColumns"
    :query-data="query"
    :table-data="list"
    :total="total"
    :page-size="query.pageSize"
    :loading="loading"
    :query-default-show="true"
    :show-quick-query="false"
    :show-bar="false"
    :operate="{ show: true, width: 180 }"
    v-model:show-details="showDetail"
    dialog-dt-width="1000"
    dt-title="专用线详情"
    @query="handleQuery"
    @query-reset="handleReset"
    @page-change="handlePageChange"
  >
    <template #querybutton>
      <el-button v-if="canAdd" type="danger" @click="handleAdd">新增</el-button>
    </template>

    <template #queryform>
      <el-form-item label="专用线名称">
        <el-input v-model="query.name" clearable placeholder="请输入专用线名称" />
      </el-form-item>
      <el-form-item label="所属站点">
        <el-input v-model="query.stationName" clearable placeholder="请输入所属站点" />
      </el-form-item>
      <el-form-item label="站点类型">
        <el-radio-group v-model="stationType" class="radio-check">
          <el-radio value="all">全部</el-radio>
          <el-radio value="start">发站</el-radio>
          <el-radio value="arrive">到站</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="stationType !== 'all'">
        <el-form-item label="货物品类">
          <el-input v-model="category" clearable placeholder="请输入货物品类" />
        </el-form-item>
        <el-form-item label="是否集装箱">
          <el-radio-group v-model="useContainer" class="radio-check">
            <el-radio value="y">是</el-radio>
            <el-radio value="n">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否危险品">
          <el-radio-group v-model="useDanger" class="radio-check">
            <el-radio value="y">是</el-radio>
            <el-radio value="n">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>
    </template>

    <template #operate="scope">
      <el-button type="primary" @click="openDetail(scope.row)">详情</el-button>
      <el-button type="warning" @click="handleEdit(scope.row)">编辑</el-button>
    </template>

    <template #stationName="scope">
      <el-link
        v-if="canOpenStation"
        type="primary"
        :underline="false"
        @click="toStationDetail(scope.row)"
      >
        {{ scope.row.stationName || '-' }}
      </el-link>
      <span v-else>{{ scope.row.stationName || '-' }}</span>
    </template>

    <template #tags="scope">
      <el-tag v-for="tag in getTags(scope.row.tags)" :key="tag" type="success" class="tag-item">
        {{ tag }}
      </el-tag>
      <span v-if="getTags(scope.row.tags).length === 0">-</span>
    </template>

    <template #contacts="scope">
      <span v-if="scope.row.phone" v-html="getContactHtml(scope.row)" />
      <span v-else>{{ scope.row.contacts || '-' }}</span>
    </template>

    <template #customColumn>
      <el-table-column label="专用线等级" width="160" align="center" prop="lineType">
        <template #default="scope">
          <el-tag :type="getLineType(scope.row.lineType)">{{ scope.row.lineType || '-' }}</el-tag>
        </template>
        <template #header>
          <el-tooltip placement="bottom" effect="light">
            <template #content>
              <div class="type-tooltip">
                <p>A类：托运人和收货人只能是专用线名称栏所列单位。</p>
                <p>B类：还可以是与车站和专用线单位签订共用协议的其他单位。</p>
                <p>C类：开放式共用专用线，托运人、收货人不受前两类限制。</p>
              </div>
            </template>
            <span class="line-type-header">
              专用线等级
              <DAliIcon name="help-circle" />
            </span>
          </el-tooltip>
        </template>
      </el-table-column>
    </template>

    <template #detailsExtented>
      <PrivateLineDetailForm :private-line-detail="detailRow" />
    </template>
  </DcLayout>

  <PrivateLineForm v-model="showEdit" :private-line="editRow" @success="handleSaved" />
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import DcLayout from '@/components/DCLayout/indexExtented.vue'
  import { createPrivatePhone } from '@/components/PrivatePhone/createPrivatePhone'
  import { checkFunPermissionAsync } from '@/utils/funPermissionChecked'
  import PrivateLineForm from '@/views/railway/station/components/privateLineForm.vue'
  import { privateLineTableColumns } from './config'
  import { queryPrivateLines } from './api'
  import PrivateLineDetailForm from './detailForm.vue'
  import { buildPrivateLineQuery, createPrivateLineQuery, normalizePrivateLineTags } from './logic'
  import type { PrivateLineItem, PrivateLineQuery, PrivateLineStationType } from './type'

  defineOptions({ name: 'RailwayPrivateLineList' })

  const route = useRoute()
  const router = useRouter()
  const layoutRef = ref<InstanceType<typeof DcLayout>>()
  const list = ref<PrivateLineItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const canAdd = ref(false)
  const showDetail = ref(false)
  const detailRow = ref<PrivateLineItem>({} as PrivateLineItem)
  const showEdit = ref(false)
  const editRow = ref<PrivateLineItem>({} as PrivateLineItem)
  const stationType = ref<PrivateLineStationType>('all')
  const category = ref('')
  const useContainer = ref<'y' | 'n'>('y')
  const useDanger = ref<'y' | 'n'>('y')
  let requestController: AbortController | undefined

  const query = reactive<PrivateLineQuery>(createPrivateLineQuery(route.query.privateName))

  const canOpenStation = computed(() => router.hasRoute('RailwayStationDetail'))

  const toRequestQuery = () =>
    buildPrivateLineQuery(query, {
      stationType: stationType.value,
      category: category.value,
      useContainer: useContainer.value,
      useDanger: useDanger.value
    })

  const loadData = async () => {
    requestController?.abort()
    requestController = new AbortController()
    loading.value = true
    const [error, page] = await queryPrivateLines(toRequestQuery(), {
      signal: requestController.signal
    })
    if (!requestController.signal.aborted) {
      if (error) ElMessage.error(error.message || '专用线数据加载失败')
      list.value = page.items || []
      total.value = page.totalCount || 0
      loading.value = false
    }
  }

  const handleQuery = () => {
    query.page = 1
    layoutRef.value?.setCurrentPage(1)
    void loadData()
  }

  const handleReset = () => {
    query.page = 1
    query.pageSize = 20
    query.name = ''
    query.stationName = ''
    stationType.value = 'all'
    category.value = ''
    useContainer.value = 'y'
    useDanger.value = 'y'
    layoutRef.value?.setCurrentPage(1)
    void loadData()
  }

  const handlePageChange = (page: number, pageSize: number) => {
    query.page = page
    query.pageSize = pageSize
    void loadData()
  }

  const openDetail = (row: PrivateLineItem) => {
    detailRow.value = { ...row }
    showDetail.value = true
  }

  const handleEdit = (row: PrivateLineItem) => {
    editRow.value = { ...row }
    nextTick(() => {
      showEdit.value = true
    })
  }

  const handleAdd = () => {
    editRow.value = {} as PrivateLineItem
    nextTick(() => {
      showEdit.value = true
    })
  }

  const handleSaved = () => {
    query.page = 1
    layoutRef.value?.setCurrentPage(1)
    void loadData()
  }

  const toStationDetail = (row: PrivateLineItem) => {
    if (!canOpenStation.value || !row.stationId) return
    void router.push({
      path: '/resource-app/station-dt',
      query: { id: row.stationId, name: row.stationName }
    })
  }

  const getTags = normalizePrivateLineTags

  const getContactHtml = (row: PrivateLineItem) =>
    createPrivatePhone(row.phone || '', row.contacts || '').outerHTML

  const getLineType = (lineType?: string): 'success' | 'warning' | 'danger' | 'info' => {
    if (lineType === 'A') return 'success'
    if (lineType === 'B') return 'warning'
    if (lineType === 'C') return 'danger'
    return 'info'
  }

  watch(
    () => route.query.privateName,
    (value) => {
      query.name = typeof value === 'string' ? value : ''
      query.page = 1
      void loadData()
    }
  )

  onMounted(() => {
    void checkFunPermissionAsync('/resource-app/station-dt', 'newPrivateLine').then((allowed) => {
      canAdd.value = allowed === true
    })
    void loadData()
  })

  onBeforeUnmount(() => requestController?.abort())
</script>

<style scoped lang="less">
  .radio-check {
    display: inline-flex;
  }

  .tag-item {
    margin: 2px 4px 2px 0;
  }

  .type-tooltip {
    max-width: 24rem;
    line-height: 1.7;
  }

  .line-type-header {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    cursor: help;
  }
</style>
