<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { EditorNode, OrganizationListItem } from '../types'
  import OrganizationForm from './OrganizationForm.vue'
  import OrganizationList from './OrganizationList.vue'
  import ContactList from './ContactList.vue'

  const props = withDefaults(
    defineProps<{
      modelValue: boolean
      node?: Partial<EditorNode>
      centerId: string
      initialTab?: 'base' | 'children' | 'contacts'
      createParentId?: string
    }>(),
    { node: () => ({}), initialTab: 'base', createParentId: '' }
  )
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    success: []
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const activeTab = ref<'base' | 'children' | 'contacts'>('base')
  const currentNode = ref<Partial<EditorNode>>({})
  const parentId = ref('')
  const creating = ref(false)

  const currentId = computed(() => String(Reflect.get(currentNode.value, 'id') || ''))
  const currentName = computed(() =>
    String(
      Reflect.get(currentNode.value, 'organizationName') ||
        Reflect.get(currentNode.value, 'name') ||
        (creating.value ? '新增机构' : '')
    )
  )
  const isCenter = computed(
    () =>
      currentId.value === props.centerId || Reflect.get(currentNode.value, 'organizationType') === 0
  )
  const tabs = computed(() =>
    creating.value
      ? [{ name: 'base' as const, label: '基础信息' }]
      : [
          { name: 'base' as const, label: isCenter.value ? '编辑中心' : '编辑机构' },
          { name: 'children' as const, label: '下设机构' },
          { name: 'contacts' as const, label: '联系人' }
        ]
  )
  const dialogTitle = computed(() => {
    if (creating.value) return '新增机构'
    const action = isCenter.value ? '编辑中心' : '编辑机构'
    return `${action}${currentName.value ? ` - ${currentName.value}` : ''}`
  })

  const openExisting = (
    node: OrganizationListItem,
    tab: 'base' | 'children' | 'contacts' = 'base'
  ) => {
    currentNode.value = { ...node }
    parentId.value = ''
    creating.value = false
    activeTab.value = tab
  }

  const openCreate = (id: string) => {
    currentNode.value = {}
    parentId.value = id
    creating.value = true
    activeTab.value = 'base'
  }

  const saved = () => {
    emit('success')
    visible.value = false
  }

  watch(
    [visible, () => props.node, () => props.initialTab, () => props.createParentId],
    ([show]) => {
      if (!show) return
      currentNode.value = { ...(props.node || {}) }
      parentId.value = props.createParentId
      creating.value = Boolean(props.createParentId)
      activeTab.value = creating.value ? 'base' : props.initialTab
    },
    { deep: true, immediate: true }
  )
</script>

<template>
  <ComDialog v-model="visible" width="1100px" show-fullscreen :title="dialogTitle">
    <el-tabs v-model="activeTab">
      <el-tab-pane v-for="tab in tabs" :key="tab.name" :label="tab.label" :name="tab.name">
        <OrganizationForm
          v-if="tab.name === 'base'"
          :node="currentNode"
          :parent-id="parentId"
          :center="isCenter"
          @saved="saved"
        />
        <OrganizationList
          v-else-if="tab.name === 'children'"
          :org-id="currentId"
          :org-name="currentName"
          table-height="400"
          @edit="openExisting"
          @create="openCreate"
        />
        <ContactList v-else-if="tab.name === 'contacts'" :organization-id="currentId" />
      </el-tab-pane>
    </el-tabs>
  </ComDialog>
</template>
