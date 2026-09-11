<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { UploadFile, UploadFiles, UploadInstance } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { downloadTemplate, importContacts, importOrganizations } from '../api'

  const props = defineProps<{
    modelValue: boolean
    mode: 'organization' | 'contact'
    targetId: string
  }>()
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    success: []
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const uploadRef = ref<UploadInstance>()
  const selectedFile = ref<File | null>(null)
  const loading = ref(false)

  const title = computed(() => (props.mode === 'organization' ? '批量导入机构' : '批量导入联系人'))
  const template = computed(() =>
    props.mode === 'organization'
      ? { path: '/UploadFile/铁路物流中心机构导入模板.xlsx', name: '铁路物流中心机构导入模板.xlsx' }
      : {
          path: '/UploadFile/铁路物流中心机构联系人导入模板.xlsx',
          name: '铁路物流中心机构联系人导入模板.xlsx'
        }
  )

  const validate = (file: Pick<File, 'name' | 'size'>): string => {
    if (!/\.xlsx?$/i.test(file.name)) return '仅支持 xls、xlsx 文件'
    if (file.size > 10 * 1024 * 1024) return '文件不能超过 10MB'
    return ''
  }

  const handleChange = (file: UploadFile, files: UploadFiles) => {
    const raw = file.raw
    if (!raw) return
    const message = validate(raw)
    if (message) {
      ElMessage.warning(message)
      uploadRef.value?.clearFiles()
      selectedFile.value = null
      return
    }
    selectedFile.value = raw
    if (files.length > 1) files.splice(0, files.length - 1)
  }

  const submit = async () => {
    if (!selectedFile.value || !props.targetId) return
    loading.value = true
    const request = props.mode === 'organization' ? importOrganizations : importContacts
    const [error, success] = await request(props.targetId, selectedFile.value)
    loading.value = false
    if (error || !success) return
    ElMessage.success('导入成功')
    emit('success')
    visible.value = false
  }

  const handleDownload = async () => {
    const [error] = await downloadTemplate(template.value.path, template.value.name)
    if (!error) ElMessage.success('模板下载成功')
  }

  watch(visible, (value) => {
    if (!value) {
      selectedFile.value = null
      uploadRef.value?.clearFiles()
    }
  })

  defineExpose({ validate })
</script>

<template>
  <ComDialog v-model="visible" width="440px" :title="title" :show-fullscreen="false">
    <el-upload
      ref="uploadRef"
      drag
      :auto-upload="false"
      :limit="1"
      accept=".xls,.xlsx"
      :on-change="handleChange"
    >
      <DAliIcon name="upload" class="upload-icon" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击选择</em></div>
      <template #tip>
        <div class="el-upload__tip">只能上传 xls、xlsx 文件，且不超过 10MB</div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="warning" @click="handleDownload">下载模板</el-button>
      <el-button type="primary" :loading="loading" :disabled="!selectedFile" @click="submit">
        导入
      </el-button>
    </template>
  </ComDialog>
</template>

<style scoped lang="less">
  :deep(.el-upload),
  :deep(.el-upload-dragger) {
    width: 100%;
  }

  .upload-icon {
    margin-bottom: 10px;
    font-size: 42px;
    color: var(--el-color-primary);
  }
</style>
