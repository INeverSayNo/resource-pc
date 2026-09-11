<template>
  <DcLayout
    :columns="tableColumns"
    :query-data="query"
    :table-data="list"
    :total="total"
    :loading="loading"
    :query-default-show="true"
    :show-quick-query="true"
    :show-bar="true"
    :operate="{ show: false, width: 120 }"
    @page-change="handlePageChange"
    @query="handleSearch"
    @search="handleSearch"
    @query-reset="handleReset"
  >
    <template #queryform>
      <el-form-item label="站点">
        <el-input v-model="query.station" placeholder="请输入站点名称" clearable />
      </el-form-item>
      <el-form-item label="受限收货单位">
        <el-input v-model="query.restrictedConsignees" placeholder="请输入受限收货单位" clearable />
      </el-form-item>
    </template>
    <template #buttonGroup>
      <el-button type="danger" @click="showHtmlImport = true">
        <DAliIcon name="upload" color="white" class="mr-4px"/>
        数据导入
      </el-button>
      <el-button type="danger" @click="showExcelImport = true">
        <DAliIcon name="upload" color="white" class="mr-4px"/>
        Excel导入
      </el-button>
      <el-button type="warning" @click="goConfig">
        <DAliIcon name="setting" color="white" class="mr-4px"/>
        提醒配置
      </el-button>
    </template>
  </DcLayout>

  <ImportExcel
    v-model:visable="showHtmlImport"
    title="昆铁停限装导入"
    accept="text/html"
    accept-str="html"
    action-method="railwayload"
    :loadding="importLoading"
    @submit="handleHtmlImport"
  />
  <ImportExcel
    v-model:visable="showExcelImport"
    title="停限装导入"
    action-method="railwayload"
    :loadding="importLoading"
    @submit="handleExcelImport"
  />
  <ImportPreview v-model="showPreview" :data-list="previewData" @success="loadList" />
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import DcLayout from '@/components/DCLayout/indexExtented.vue'
  import ImportExcel from '@/components/UploadImg/importExcel.vue'
  import { queryStopLoads, parseExcelStopLoads, parseKuntieStopLoads } from './api'
  import type { StopLoadImportItem, StopLoadNotice, StopLoadQuery } from './types'
  import ImportPreview from './components/import-preview.vue'
import { DcDate } from '@dczy/tie-tools'

  defineOptions({ name: 'StopLoading' })

  const route = useRoute()
  const router = useRouter()
  const query = reactive<StopLoadQuery>({
    page: 1,
    pageSize: 20,
    station: typeof route.query.stationName === 'string' ? route.query.stationName : ''
  })
  const list = ref<StopLoadNotice[]>([])
  const total = ref(0)
  const loading = ref(false)
  const importLoading = ref(false)
  const showHtmlImport = ref(false)
  const showExcelImport = ref(false)
  const showPreview = ref(false)
  const previewData = ref<StopLoadImportItem[]>([])

  const tableColumns = [
    { name: 'Station', label: '站点', width: 130, align: 'center', fixed: 'left' },
    { name: 'RoadBureau', label: '路局', width: 100, align: 'center' },
    { name: 'StopStartDate', label: '停限开始时间', align: 'center' },
    { name: 'StopEndDate', label: '停限结束时间', align: 'center' },
    { name: 'RestrictedDepartureBureau', label: '受限发局', align: 'center' },
    { name: 'RestrictedDepartureStation', label: '受限发站', align: 'center' },
    { name: 'RestrictedConsignees', label: '受限收货单位', align: 'center' },
    { name: 'RestrictionContent', label: '限制内容', align: 'center' },
    { name: 'StopReason', label: '停限装原因', align: 'center' },
    {
      name: 'PublishTime',
      label: '发布时间',
      align: 'center',
      formatter: (_row: unknown, _column: unknown, value: string) =>
        value ? DcDate.format(value, 'yyyy-MM-dd') : ''
    },
    { name: 'CommandNum', label: '命令号', align: 'center' },
    {
      name: 'UpdateTime',
      label: '更新时间',
      align: 'center',
      formatter: (_row: unknown, _column: unknown, value: string) =>
        value ? DcDate.format(value, 'yyyy-MM-dd HH:mm') : ''
    }
  ]

  const loadList = async () => {
    loading.value = true
    const [error, result] = await queryStopLoads({ ...query })
    loading.value = false;
    if (error) {
      ElMessage.error(error.message || '停限装公告加载失败')
      return
    }
    list.value = result.items || []
    total.value = result.totalCount || 0
  }

  const handleSearch = () => {
    query.page = 1
    void loadList()
  }

  const handleReset = () => {
    query.page = 1
    query.pageSize = 20
    query.station = ''
    query.restrictedConsignees = ''
    void loadList()
  }

  const handlePageChange = (page: number, pageSize: number) => {
    query.page = page
    query.pageSize = pageSize
    void loadList()
  }

  const importStopLoads = async (fileInfo: { FilePath?: string }, parser: typeof parseExcelStopLoads) => {
    if (!fileInfo.FilePath) return
    importLoading.value = true
    const [error, data] = await parser(fileInfo.FilePath)
    importLoading.value = false
    if (error) {
      ElMessage.error(error.message || '文件解析失败，请检查文件是否正确')
      return
    }
    showHtmlImport.value = false
    showExcelImport.value = false
    previewData.value = data
    showPreview.value = true
  }

  const handleHtmlImport = (fileInfo: { FilePath?: string }) =>
    void importStopLoads(fileInfo, parseKuntieStopLoads)

  const handleExcelImport = (fileInfo: { FilePath?: string }) =>
    void importStopLoads(fileInfo, parseExcelStopLoads)

  const goConfig = () => {
    void router.push('/resource-app/stop-loading-config')
  }

  onMounted(() => {
    void loadList()
  })
</script>
