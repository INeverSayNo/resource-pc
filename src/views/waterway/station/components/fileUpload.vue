<template>
  <DcGap class="bar">
    附件
    <DcUploadAttach
      v-model="uploadedFiles"
      class="bar-btn fr fs-14"
      :is-span="true"
      :description="''"
      :is-show-list="false"
      button-name="上传"
      :action="uploadAction"
      :headers="uploadHeaders"
      @change="saveFile"
    />
  </DcGap>

  <el-table v-loading="loading" :data="files" size="small" border stripe>
    <el-table-column label="文件" prop="fileRealName" align="center">
      <template #default="scoped">
        <el-link type="primary" @click="previewFile(scoped.row.filePath)">
          {{ scoped.row.fileRealName }}
        </el-link>
      </template>
    </el-table-column>
    <el-table-column label="维护人员" prop="creationDate" align="center">
      <template #default="scoped">
        {{ scoped.row.updateUserName || scoped.row.creatorName }}
        {{
          scoped.row.updateUserName
            ? formatTime(scoped.row.updateTime, 'yyyy-MM-dd HH:mm')
            : formatTime(scoped.row.creationDate, 'yyyy-MM-dd HH:mm')
        }}
      </template>
    </el-table-column>
    <el-table-column fixed="right" label="操作" width="100" align="center">
      <template #default="scoped">
        <el-button type="text" size="small" @click="removeFile(scoped.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { getAccessToken } from '@/auth/bridge'
  import { bindFiles, deleteFile, listFiles } from '@/api/waterway-port'
  import { createFilePrivew } from '@/components/FilePreview'
  import { Message } from '@/components/Message'
  import DcGap from '@/components/Gap/index.vue'
  import DcUploadAttach from '@/components/UploadAttach/index.vue'
  import { FILE_URL, GETFILE_URL, VIEW_URL } from '@/request'
  import { formatTime } from '@/utils'

  interface UploadedFileChange {
    name?: string
    raw?: { type?: string }
    response?: { name?: string; path?: string; size?: number }
  }

  const props = withDefaults(defineProps<{ stationId: string; list?: any[] }>(), {
    list: () => []
  })
  const emit = defineEmits<{ reload: [] }>()

  const files = ref<any[]>([...props.list])
  const uploadedFiles = ref<any[]>([])
  const loading = ref(false)
  const uploadAction = computed(() => `${FILE_URL}/${encodeURIComponent('waterport')}`)
  const uploadHeaders = computed(() => ({ Authorization: `bearer ${getAccessToken()}` }))

  const loadFiles = async () => {
    loading.value = true
    const [error, data] = await listFiles(props.stationId)
    loading.value = false
    if (!error) files.value = data
  }

  const saveFile = async (file: UploadedFileChange) => {
    if (!file.response?.path) return
    const attachment = {
      FileGroupMark: 'WaterPort',
      FileGroupName: '水运港口',
      FileName: file.response.name,
      FilePath: file.response.path,
      FileSize: file.response.size,
      FileType: file.raw?.type,
      FileRealName: file.name
    }
    const [error, success] = await bindFiles(props.stationId, { FileAttachs: [attachment] })
    if (error || !success) return
    Message.success('上传成功')
    await loadFiles()
    emit('reload')
  }

  const previewFile = (path = '') => {
    createFilePrivew({
      fileUri: `${VIEW_URL}/?url=${encodeURIComponent(`${GETFILE_URL}${path}`)}`
    })
  }

  const removeFile = async (row: { id?: string }) => {
    if (!row.id) return
    try {
      await ElMessageBox.confirm('是否删除选中文件，删除后不能恢复？', '提示信息', {
        type: 'warning'
      })
    } catch {
      return
    }
    const [error, success] = await deleteFile(row.id)
    if (error || !success) return
    Message.success('删除成功')
    await loadFiles()
    emit('reload')
  }

  watch(
    () => props.list,
    (value) => {
      if (!loading.value) files.value = [...value]
    },
    { deep: true }
  )
  onMounted(() => void loadFiles())
</script>
