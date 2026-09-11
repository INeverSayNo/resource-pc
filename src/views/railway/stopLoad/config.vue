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
    :operate="{ show: true, width: 150 }"
    @page-change="handlePageChange"
    @query="handleSearch"
    @search="handleSearch"
    @query-reset="handleReset"
  >
    <template #queryform>
      <el-form-item label="站点">
        <el-select
          v-model="query.station"
          filterable
          remote
          clearable
          placeholder="请选择站点"
          :remote-method="(keyword) => void loadStationOptions(keyword)"
          :loading="stationLoading"
        >
          <el-option
            v-for="item in stationOptions"
            :key="item.id"
            :label="item.label"
            :value="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提醒人">
        <el-input v-model="query.restrictedConsignees" placeholder="请输入提醒人" clearable />
      </el-form-item>
    </template>
    <template #buttonGroup>
      <el-button type="primary" @click="openCreate">
        <DAliIcon name="plus" color="white"/>
        新增提醒
      </el-button>
    </template>
    <template #stations="{ row }">
      <div class="station-list">
        <el-link
          v-for="station in row.stations || []"
          :key="station.code"
          type="primary"
          :underline="false"
          @click="goStationDetail(station)"
        >
          {{ station.name }}
        </el-link>
      </div>
    </template>
    <template #operate="{ row }">
      <el-button type="warning" @click="openEdit(row)">编辑</el-button>
      <el-button type="danger" @click="handleDelete(row)">删除</el-button>
    </template>
  </DcLayout>

  <ConfigForm
    v-model:visible="showForm"
    :row-data="editingRow"
    :is-edit="isEdit"
    @reload="loadList"
  />
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import DcLayout from '@/components/DCLayout/indexExtented.vue'
  import { deleteStopLoadConfig, queryStopLoadConfigs, queryStopLoadStations } from './api'
  import type { StopLoadConfig, StopLoadConfigQuery, StopLoadStation, StopLoadStationOption } from './types'
  import ConfigForm from './components/config-form.vue'

  defineOptions({ name: 'StopLoadingConfig' })

  const router = useRouter()
  const query = reactive<StopLoadConfigQuery>({ page: 1, pageSize: 20 })
  const list = ref<StopLoadConfig[]>([])
  const total = ref(0)
  const loading = ref(false)
  const stationLoading = ref(false)
  const stationOptions = ref<StopLoadStationOption[]>([])
  const showForm = ref(false)
  const isEdit = ref(false)
  const editingRow = ref<StopLoadConfig | undefined>()

  const tableColumns = [
    { name: 'stations', label: '关注站点', type: 'slot', headerAlign: 'center' },
    { name: 'userName', label: '提醒人', width: 200, align: 'center' },
    { name: 'creatorName', label: '创建人', width: 300, align: 'center' }
  ]

  const loadList = async () => {
    loading.value = true
    const [error, result] = await queryStopLoadConfigs({ ...query })
    loading.value = false
    if (error) {
      ElMessage.error(error.message || '停限装提醒配置加载失败')
      return
    }
    list.value = result.items || []
    total.value = result.totalCount || 0
  }

  const loadStationOptions = async (keyword = '') => {
    stationLoading.value = true
    const [error, result] = await queryStopLoadStations({
      railwayStationName: keyword,
      isHyStation: true,
      page: 1,
      pageSize: 2000
    })
    stationLoading.value = false
    if (error) return
    stationOptions.value = result.items.map((item) => ({
      id: item.id,
      label: item.railwayStationName
    }))
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

  const openCreate = () => {
    isEdit.value = false
    editingRow.value = undefined
    showForm.value = true
  }

  const openEdit = (row: StopLoadConfig) => {
    isEdit.value = true
    editingRow.value = row
    showForm.value = true
  }

  const handleDelete = async (row: StopLoadConfig) => {
    try {
      await ElMessageBox.confirm('是否删除选中行的配置信息？', '提示', { type: 'warning' })
    } catch {
      return
    }
    const [error, success] = await deleteStopLoadConfig(row.id)
    if (error || !success) {
      ElMessage.error(error?.message || '删除失败')
      return
    }
    ElMessage.success('删除成功')
    void loadList()
  }

  const goStationDetail = (station: StopLoadStation) => {
    void router.push({
      path: '/resource-app/station-dt',
      query: { id: station.code, name: station.name }
    })
  }

  onMounted(() => {
    void loadList()
    void loadStationOptions()
  })
</script>

<style scoped lang="less">
  .station-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
