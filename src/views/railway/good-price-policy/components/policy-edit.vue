<template>
  <com-dialog
    :model-value="visible"
    :width="500"
    title="优价信息修改"
    :destroy-on-close="true"
    @open="handleOpen"
    @close="visible = false"
  >
    <el-form label-width="110px" label-suffix="：">
      <el-form-item label="集装箱类型">
        <el-select v-model="form.containerTypes" multiple clearable>
          <el-option v-for="name in containerTypes" :key="name" :value="name" :label="name" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" show-word-limit maxlength="500" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
    </template>
  </com-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { updatePolicyContainerAndRemark } from '../api'
  import type { PolicyAllSimpleRecordDto, PolicyAllSimpleUpdateDto } from '../types'

  const props = withDefaults(defineProps<{ show?: boolean; policy?: PolicyAllSimpleRecordDto }>(), {
    show: false,
    policy: () => ({})
  })
  const emit = defineEmits<{
    'update:show': [value: boolean]
    success: []
  }>()
  const visible = computed({
    get: () => props.show,
    set: (value: boolean) => emit('update:show', value)
  })
  const loading = ref(false)
  const form = reactive<PolicyAllSimpleUpdateDto>({ containerTypes: [], remark: '' })
  const containerTypes = ['T20', 'Z20', 'T40', 'Z40', 'K20', 'K40', 'C35']

  const handleOpen = () => {
    if (!props.policy.id) {
      ElMessage.warning('请选择正确的优价信息')
      visible.value = false
      return
    }
    form.id = props.policy.id
    form.containerTypes = (props.policy.containerType || '').split(',').filter(Boolean)
    form.remark = props.policy.remark || ''
  }

  const handleSave = async () => {
    loading.value = true
    const [error, success] = await updatePolicyContainerAndRemark(form)
    loading.value = false
    if (error || !success) {
      ElMessage.error(error?.message || '保存失败')
      return
    }
    ElMessage.success('保存成功')
    visible.value = false
    emit('success')
  }
</script>
