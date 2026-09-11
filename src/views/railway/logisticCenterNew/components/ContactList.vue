<script setup lang="ts">
  import { onBeforeUnmount, reactive, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { createPrivatePhone } from '@/components/PrivatePhone/createPrivatePhone'
  import { deleteContact, queryContacts } from '../api'
  import { formatContactName, organizationDisplayName } from '../logic'
  import type { ContactItem } from '../types'
  import ContactEditorDialog from './ContactEditorDialog.vue'
  import ExcelImportDialog from './ExcelImportDialog.vue'

  const props = defineProps<{ organizationId: string }>()
  const loading = ref(false)
  const keywords = ref('')
  const contacts = ref<ContactItem[]>([])
  const pagination = reactive({ page: 1, limit: 20, total: 0 })
  const editorVisible = ref(false)
  const importVisible = ref(false)
  const editingContact = ref<Partial<ContactItem>>({})
  let controller: AbortController | null = null
  let requestVersion = 0

  const loadContacts = async (reset = false) => {
    const version = ++requestVersion
    if (reset) pagination.page = 1
    controller?.abort()
    if (!props.organizationId) {
      contacts.value = []
      pagination.total = 0
      loading.value = false
      return
    }
    controller = new AbortController()
    loading.value = true
    const [error, result] = await queryContacts(
      {
        page: pagination.page,
        limit: pagination.limit,
        organizationId: props.organizationId,
        keyName: keywords.value.trim()
      },
      { signal: controller.signal }
    )
    if (version !== requestVersion) return
    if (!error) {
      contacts.value = result.items || []
      pagination.total = result.totalCount || 0
    }
    loading.value = false
  }

  const add = () => {
    editingContact.value = {}
    editorVisible.value = true
  }

  const edit = (contact: ContactItem) => {
    if (!contact.showAndCallingPhone) {
      ElMessage.error('抱歉，暂无权限编辑该联系人')
      return
    }
    editingContact.value = contact
    editorVisible.value = true
  }

  const remove = async (contact: ContactItem) => {
    try {
      await ElMessageBox.confirm(`确定删除${contact.contactName || '该联系人'}吗？`, '提示', {
        type: 'warning'
      })
    } catch {
      return
    }
    const [error, success] = await deleteContact(contact.id)
    if (error || !success) return
    ElMessage.success('删除成功')
    void loadContacts()
  }

  const showNoPermission = async (contact: ContactItem) => {
    await ElMessageBox.alert(
      `抱歉，暂无权限查看该联系人的号码。请联系我方负责人：${contact.creatorName || '未知'}`,
      '温馨提示',
      { confirmButtonText: contact.CreatorPhone ? '复制我方负责人电话' : '确定' }
    )
    if (contact.CreatorPhone) {
      await navigator.clipboard.writeText(contact.CreatorPhone)
      ElMessage.success('复制成功')
    }
  }

  const privatePhone = (phone?: string) => window.getPrivatePhone(phone || '')

  watch(
    () => props.organizationId,
    () => void loadContacts(true),
    { immediate: true }
  )
  onBeforeUnmount(() => {
    requestVersion += 1
    controller?.abort()
  })

  defineExpose({ refresh: loadContacts })
</script>

<template>
  <section class="contact-list">
    <div class="toolbar">
      <el-input
        v-model="keywords"
        clearable
        placeholder="请输入查询关键字"
        @keyup.enter="loadContacts(true)"
      >
        <template #append>
          <el-button @click="loadContacts(true)"><DAliIcon name="search" /></el-button>
        </template>
      </el-input>
      <div>
        <el-button type="primary" @click="add">新增联系人</el-button>
        <el-button type="success" @click="importVisible = true">批量导入</el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="contacts" border stripe height="400">
      <el-table-column type="index" label="序号" align="center" width="70" />
      <el-table-column label="姓名" align="center" min-width="150">
        <template #default="{ row }">
          {{ formatContactName(row.contactName, row.contactDuty, row.gender) }}
        </template>
      </el-table-column>
      <el-table-column label="所属机构" align="center" min-width="190">
        <template #default="{ row }">{{
          organizationDisplayName(row.organizationRelationName)
        }}</template>
      </el-table-column>
      <el-table-column prop="contactDutyDesc" label="职责" align="center" min-width="120" />
      <el-table-column label="手机号" align="center" min-width="160">
        <template #default="{ row }">
          <span
            v-if="row.showAndCallingPhone && row.contactMobilePhone"
            v-clipboard="row.contactMobilePhone"
            class="phone"
            v-html="createPrivatePhone(row.contactMobilePhone).outerHTML"
          />
          <button
            v-else-if="row.contactMobilePhone"
            class="masked-phone"
            type="button"
            @click="showNoPermission(row)"
          >
            {{ privatePhone(row.contactMobilePhone) }}
          </button>
        </template>
      </el-table-column>
      <el-table-column label="固定电话" align="center" min-width="160">
        <template #default="{ row }">
          <span
            v-if="row.showAndCallingPhone && row.contactTelephone"
            v-clipboard="row.contactTelephone"
            class="phone"
            v-html="createPrivatePhone(row.contactTelephone).outerHTML"
          />
          <button
            v-else-if="row.contactTelephone"
            class="masked-phone"
            type="button"
            @click="showNoPermission(row)"
          >
            {{ privatePhone(row.contactTelephone) }}
          </button>
        </template>
      </el-table-column>
      <el-table-column prop="roomNum" label="房间号" align="center" width="100" />
      <el-table-column label="操作" align="center" fixed="right" width="150">
        <template #default="{ row }">
          <el-button link type="warning" @click="edit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.limit"
      background
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      @size-change="loadContacts()"
      @current-change="loadContacts()"
    />
    <ContactEditorDialog
      v-model="editorVisible"
      :organization-id="organizationId"
      :contact="editingContact"
      @success="loadContacts()"
    />
    <ExcelImportDialog
      v-model="importVisible"
      mode="contact"
      :target-id="organizationId"
      @success="loadContacts(true)"
    />
  </section>
</template>

<style scoped lang="less">
  .contact-list {
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

  .phone,
  .masked-phone {
    color: var(--el-color-primary);
    cursor: pointer;
  }

  .masked-phone {
    border: 0;
    background: transparent;
  }

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
</style>
