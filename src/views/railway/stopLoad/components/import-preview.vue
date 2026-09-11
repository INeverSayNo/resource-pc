<template>
  <com-dialog
    :model-value="modelValue"
    :show-fullscreen="true"
    :width="1300"
    title="停限装预览"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-table :data="dataList" border height="600" style="width: 100%">
      <el-table-column type="index" label="序号" width="70" />
      <el-table-column prop="station" label="站点" width="100" />
      <el-table-column prop="roadBureau" label="路局" width="100" />
      <el-table-column prop="stopStartDate" label="停限日期始" width="130" />
      <el-table-column prop="stopEndDate" label="停限日期止" width="130" />
      <el-table-column prop="restrictedDepartureBureau" label="受限发局" width="150" />
      <el-table-column prop="restrictedDepartureStation" label="受限发站" width="130" />
      <el-table-column prop="restrictedConsignees" label="受限收货单位" width="160" />
      <el-table-column prop="restrictionContent" label="限制内容" width="180" />
      <el-table-column prop="stopReason" label="停限装原因" width="220" />
      <el-table-column prop="publishTime" label="发布时间" width="140" />
    </el-table>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </com-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { saveImportedStopLoads } from '../api'
  import type { StopLoadImportItem } from '../types'

  defineOptions({ name: 'StopLoadImportPreview' })

  const props = defineProps<{
    modelValue: boolean
    dataList: StopLoadImportItem[]
  }>()
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    success: []
  }>()

  const saving = ref(false)

  const handleClose = () => {
    if (saving.value) return
    emit('update:modelValue', false)
  }

  const handleSave = async () => {
    if (saving.value) return
    saving.value = true
    const [error, success] = await saveImportedStopLoads(props.dataList)
    saving.value = false
    if (error || !success) {
      ElMessage.error(error?.message || '保存失败')
      return
    }
    ElMessage.success('保存成功')
    emit('update:modelValue', false)
    emit('success')
  }
</script>
