<template>
  <com-dialog
    :model-value="visible"
    :width="420"
    :title="mode === 'query' ? 'Excel批量查询' : '优价导入'"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      drag
      :limit="1"
      :auto-upload="false"
      accept=".xls,.xlsx"
      :on-change="handleChange"
      :on-remove="handleRemove"
    >
      <DAliIcon name="upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">只能上传 xls、xlsx 文件，且不超过 10MB</div>
      </template>
    </el-upload>
    <el-alert
      v-if="resultPath"
      class="result-alert"
      title="批量查询已完成"
      type="success"
      :closable="false"
    >
      <el-button link type="primary" @click="downloadResult">下载查询结果</el-button>
    </el-alert>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="warning" @click="downloadTemplate">下载模板</el-button>
      <el-button type="primary" :loading="loading" :disabled="!selectedFile" @click="submit">
        {{ mode === 'query' ? '查询' : '导入' }}
      </el-button>
    </template>
  </com-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { UploadFile, UploadFiles, UploadInstance, UploadUserFile } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { Download } from '@/request'
  import { PATH_URL } from '@/request/config'
  import { batchQueryPolicies, importPolicies } from '../api'
  import { resolvePolicyDownloadUrl, validatePolicyExcelFile } from '../logic'

  const props = withDefaults(defineProps<{ show?: boolean; mode?: 'query' | 'import' }>(), {
    show: false,
    mode: 'query'
  })
  const emit = defineEmits<{
    'update:show': [value: boolean]
    success: []
  }>()
  const visible = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value)
  })
  const uploadRef = ref<UploadInstance>()
  const fileList = ref<UploadUserFile[]>([])
  const selectedFile = ref<File>()
  const resultPath = ref('')
  const loading = ref(false)

  const reset = () => {
    uploadRef.value?.clearFiles()
    fileList.value = []
    selectedFile.value = undefined
    resultPath.value = ''
  }
  const close = () => {
    visible.value = false
    reset()
  }

  const handleChange = (file: UploadFile, files: UploadFiles) => {
    if (!file.raw) return
    const message = validatePolicyExcelFile(file.raw)
    if (message) {
      ElMessage.warning(message)
      uploadRef.value?.clearFiles()
      fileList.value = []
      selectedFile.value = undefined
      return
    }
    fileList.value = files.slice(-1)
    selectedFile.value = file.raw
    resultPath.value = ''
  }
  const handleRemove = () => {
    selectedFile.value = undefined
    resultPath.value = ''
  }

  const download = async (path: string, fileName: string) => {
    try {
      await Download(resolvePolicyDownloadUrl(PATH_URL, path), fileName)
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '文件下载失败')
    }
  }
  const downloadTemplate = () => {
    const path =
      props.mode === 'query'
        ? '/UploadFile/批量优价线路查询模板.xlsx'
        : '/UploadFile/优价导入模板.xlsx'
    void download(path, path.split('/').pop() || '优价模板.xlsx')
  }
  const downloadResult = () => {
    if (!resultPath.value) return
    void download(resultPath.value, resultPath.value.split('/').pop() || '优价批量查询结果.xlsx')
  }

  const submit = async () => {
    if (!selectedFile.value) return
    loading.value = true
    if (props.mode === 'query') {
      const [error, path] = await batchQueryPolicies(selectedFile.value)
      loading.value = false
      if (error || !path) {
        ElMessage.error(error?.message || '批量查询失败')
        return
      }
      resultPath.value = path
      ElMessage.success('批量查询完成')
      emit('success')
      return
    }
    const [error, success] = await importPolicies(selectedFile.value)
    loading.value = false
    if (error || !success) {
      ElMessage.error(error?.message || '导入失败')
      return
    }
    ElMessage.success('导入完成')
    emit('success')
    close()
  }

  watch(
    () => props.show,
    (show) => {
      if (!show) reset()
    }
  )
</script>

<style scoped lang="less">
  :deep(.el-upload),
  :deep(.el-upload-dragger) {
    width: 100%;
  }

  .result-alert {
    margin-top: 12px;
  }
</style>
