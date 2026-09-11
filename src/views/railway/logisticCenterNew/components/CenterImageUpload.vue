<script setup lang="ts">
  import { computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { UploadRawFile } from 'element-plus'
  import { FILE_URL } from '@/request'
  import { useUserStore } from '@/store/modules/user'
  import type { UploadedFile } from '../types'

  withDefaults(defineProps<{ label?: string }>(), { label: '上传图片' })
  const emit = defineEmits<{ success: [file: UploadedFile] }>()
  const userStore = useUserStore()
  const action = `${FILE_URL.replace(/\/$/, '')}/LogisticCenter`
  const headers = computed(() => ({ Authorization: `bearer ${userStore.token}` }))

  const beforeUpload = (file: UploadRawFile) => {
    if (!/\.(?:jpe?g|png)$/i.test(file.name)) {
      ElMessage.error('上传文件只能是 jpg、png、jpeg 格式')
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      ElMessage.error('上传文件大小不能超过 10MB')
      return false
    }
    return true
  }

  const handleSuccess = (
    response: { name: string; path: string; size?: number; creationDate?: string },
    file: { name: string; size?: number; raw?: { type?: string }; uid?: number }
  ) => {
    emit('success', {
      name: response.name || file.name,
      path: response.path,
      size: response.size || file.size || 0,
      type: file.raw?.type || 'image/jpeg',
      uid: file.uid
    })
  }

  const handleError = () => ElMessage.error('图片上传失败，请重试')
</script>

<template>
  <el-upload
    :action="action"
    :headers="headers"
    name="File"
    accept=".jpg,.jpeg,.png"
    :show-file-list="false"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
  >
    <el-button type="primary" plain>
      <DAliIcon name="plus" />
      {{ label }}
    </el-button>
  </el-upload>
</template>
