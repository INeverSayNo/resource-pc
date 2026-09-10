<template>
  <com-dialog
    :show-fullscreen="false"
    :model-value="visible"
    width="400px"
    :title="title"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="close"
  >
    <el-upload
      drag
      :limit="1"
      :accept="accept"
      :headers="headers"
      :action="uploadAction"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-remove="reset"
      :on-error="handleError"
    >
      <DAliIcon name="upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">只能上传 xls、xlsx 文件，且不超过 20MB</div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :disabled="!fileInfo.FilePath" @click="submit">
        确定导入
      </el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts" setup>
  import { computed, reactive, watch } from 'vue'
  import { getAccessToken } from '@/auth/bridge'
  import { Message } from '@/components/Message'
  import { FILE_URL } from '@/request'

  interface ImportFileInfo {
    FileRealName?: string
    FileName?: string
    FilePath?: string
    FileSize?: number
    FileType?: string
  }

  const props = withDefaults(
    defineProps<{ visible: boolean; title?: string; actionMethod?: string }>(),
    {
      title: '数据导入',
      actionMethod: 'waterPort'
    }
  )
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: [file: ImportFileInfo]
  }>()

  const accept =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
  const fileInfo = reactive<ImportFileInfo>({})
  const headers = computed(() => ({ Authorization: `bearer ${getAccessToken()}` }))
  const uploadAction = computed(() => `${FILE_URL}/${encodeURIComponent(props.actionMethod)}`)

  const reset = () => {
    for (const key of Object.keys(fileInfo) as Array<keyof ImportFileInfo>) delete fileInfo[key]
  }
  const close = () => emit('update:visible', false)
  const submit = () => emit('submit', { ...fileInfo })

  const beforeUpload = (file: File) => {
    if (!accept.split(',').includes(file.type)) {
      Message.error('只能上传 xls、xlsx 文件')
      return false
    }
    if (file.size / 1024 / 1024 >= 20) {
      Message.error('文件不能超过 20MB')
      return false
    }
    return true
  }

  const handleSuccess = (response: { name?: string; path?: string; size?: number }) => {
    fileInfo.FileRealName = response.name
    fileInfo.FileName = response.name
    fileInfo.FilePath = response.path
    fileInfo.FileSize = response.size
    fileInfo.FileType = response.name?.slice(response.name.lastIndexOf('.'))
  }
  const handleError = () => Message.error('上传文件失败')

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) reset()
    }
  )
</script>

<style lang="less" scoped>
  :deep(.el-upload),
  :deep(.el-upload-dragger) {
    width: 100%;
  }
</style>
