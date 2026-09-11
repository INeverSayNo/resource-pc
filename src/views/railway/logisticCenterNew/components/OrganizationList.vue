<script setup lang="ts">
  import { onBeforeUnmount, reactive, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { createPrivatePhone } from '@/components/PrivatePhone/createPrivatePhone'
  import { deleteOrganization, queryOrganizations } from '../api'
  import { normalizeOrganizationItem } from '../logic'
  import type { AddressInfo, OrganizationListItem } from '../types'
  import ExcelImportDialog from './ExcelImportDialog.vue'

  const props = withDefaults(
    defineProps<{
      orgId: string
      orgName?: string
      tableHeight?: string | number
    }>(),
    { orgName: '', tableHeight: undefined }
  )
  const emit = defineEmits<{
    edit: [node: OrganizationListItem, tab?: 'base' | 'children' | 'contacts']
    create: [parentId: string, parentName: string]
    location: [address: AddressInfo]
    select: [id: string, name: string]
  }>()

  const router = useRouter()
  const loading = ref(false)
  const keywords = ref('')
  const organizations = ref<OrganizationListItem[]>([])
  const pagination = reactive({ page: 1, limit: 20, total: 0 })
  const importVisible = ref(false)
  let controller: AbortController | null = null
  let requestVersion = 0

  const load = async (reset = false) => {
    const version = ++requestVersion
    if (reset) pagination.page = 1
    controller?.abort()
    if (!props.orgId) {
      organizations.value = []
      pagination.total = 0
      loading.value = false
      return
    }
    controller = new AbortController()
    loading.value = true
    const [error, result] = await queryOrganizations(
      {
        page: pagination.page,
        limit: pagination.limit,
        parentId: props.orgId,
        keyName: keywords.value.trim()
      },
      { signal: controller.signal }
    )
    if (version !== requestVersion) return
    if (!error) {
      organizations.value = (result.items || []).map(normalizeOrganizationItem)
      pagination.total = result.totalCount || 0
    }
    loading.value = false
  }

  const remove = async (item: OrganizationListItem) => {
    try {
      await ElMessageBox.confirm(`确定删除${item.name || '该机构'}吗？`, '提示', {
        type: 'warning'
      })
    } catch {
      return
    }
    const [error, success] = await deleteOrganization(item.id)
    if (error || !success) return
    ElMessage.success('删除成功')
    void load()
  }

  const locate = (address?: AddressInfo) => {
    if (!address?.lat || !address?.lng) return
    emit('location', address)
  }

  const openStation = (item: { id: string; name: string; stationId?: string }) => {
    void router.push({
      path: '/resource-app/station-dt',
      query: { id: item.stationId || item.id, name: item.name }
    })
  }

  const openChild = (item: { id: string; name: string }) => {
    emit('edit', {
      id: item.id,
      name: item.name,
      contactPersonCount: 0,
      childInstitutionList: [],
      childStationList: []
    })
  }

  watch(
    () => props.orgId,
    () => void load(true),
    { immediate: true }
  )
  onBeforeUnmount(() => {
    requestVersion += 1
    controller?.abort()
  })

  defineExpose({ refresh: load })
</script>

<template>
  <section class="organization-list">
    <div class="toolbar">
      <el-input
        v-model="keywords"
        clearable
        placeholder="请输入查询关键字"
        @keyup.enter="load(true)"
      >
        <template #append>
          <el-button @click="load(true)"><DAliIcon name="search" /></el-button>
        </template>
      </el-input>
      <div>
        <el-button type="primary" @click="emit('create', orgId, orgName)">新增机构</el-button>
        <el-button type="success" @click="importVisible = true">批量导入</el-button>
      </div>
    </div>
    <el-table
      v-loading="loading"
      :data="organizations"
      :height="tableHeight"
      border
      stripe
      highlight-current-row
      @current-change="(row) => row && emit('select', row.id, row.name)"
    >
      <el-table-column type="index" label="序号" align="center" width="70" />
      <el-table-column prop="name" label="机构名称" align="center" min-width="130" />
      <el-table-column label="机构地址" align="center" min-width="220">
        <template #default="{ row }">
          <el-button
            v-if="row.formatAddress?.address"
            link
            type="primary"
            class="address-button"
            @click.stop="locate(row.formatAddress)"
          >
            <DAliIcon name="location" />
            {{ row.formatAddress.address }}
          </el-button>
          <span v-else>暂无</span>
        </template>
      </el-table-column>
      <el-table-column label="联系人" align="center" width="100">
        <template #default="{ row }">
          <el-button link type="primary" @click.stop="emit('edit', row, 'contacts')">
            {{ row.contactPersonCount || 0 }}个
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="下辖机构" align="center" min-width="220">
        <template #default="{ row }">
          <div class="inline-items">
            <el-button
              v-for="item in row.childInstitutionList"
              :key="item.id"
              link
              type="primary"
              @click.stop="openChild(item)"
            >
              {{ item.name }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="下辖站点" align="center" min-width="220">
        <template #default="{ row }">
          <div class="inline-items">
            <el-button
              v-for="item in row.childStationList"
              :key="item.id"
              link
              type="primary"
              @click.stop="openStation(item)"
            >
              {{ item.name }}
            </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="我方负责人" align="center" min-width="160">
        <template #default="{ row }">
          <span>{{ row.ourResponsibleUserName || '暂无' }}</span>
          <span
            v-if="row.ourResponsibleUserPhone"
            v-clipboard="row.ourResponsibleUserPhone"
            class="phone"
            v-html="createPrivatePhone(row.ourResponsibleUserPhone).outerHTML"
          />
        </template>
      </el-table-column>
      <el-table-column prop="modifyTimeStr" label="更新时间" align="center" width="150" />
      <el-table-column label="操作" align="center" fixed="right" width="150">
        <template #default="{ row }">
          <el-button link type="warning" @click.stop="emit('edit', row, 'base')">编辑</el-button>
          <el-button link type="danger" @click.stop="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.limit"
      background
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      @size-change="load()"
      @current-change="load()"
    />
    <ExcelImportDialog
      v-model="importVisible"
      mode="organization"
      :target-id="orgId"
      @success="load(true)"
    />
  </section>
</template>

<style scoped lang="less">
  .organization-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .toolbar :deep(.el-input) {
    width: 260px;
  }

  .address-button {
    display: inline-flex;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .inline-items {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .phone {
    margin-left: 6px;
    color: var(--el-color-primary);
    cursor: pointer;
  }

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
</style>
