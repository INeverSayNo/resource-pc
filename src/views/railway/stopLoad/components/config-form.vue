<template>
  <com-dialog
    :model-value="visible"
    :show-fullscreen="true"
    :width="1000"
    title="停限装公告提醒配置"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-suffix=":" >
      <el-form-item label="关注站点" prop="stations">
        <el-select
          v-model="form.stations"
          style="width: 100%"
          multiple
          filterable
          remote
          value-key="id"
          clearable
          placeholder="可选择多个站点"
          :remote-method="(keyword) => void loadStationOptions(keyword)"
          :loading="stationLoading"
        >
          <el-option
            v-for="item in stationOptions"
            :key="item.id"
            :label="item.label"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提醒人" prop="userId">
        <DcOrgUserSelect
          v-model="form.userId"
          :show-tree="false"
          :is-main-account="true"
          placeholder="选择提醒人"
          @change="handleUserChange"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </com-dialog>
</template>

<script setup lang="ts">
  import { nextTick, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import DcOrgUserSelect from '@/components/TableUserSelectV2/selectField.vue'
  import { queryStopLoadStations, saveStopLoadConfig } from '../api'
  import type {
    StationPageItem,
    StopLoadConfig,
    StopLoadConfigPayload,
    StopLoadStationOption
  } from '../types'

  defineOptions({ name: 'StopLoadConfigForm' })

  const props = withDefaults(
    defineProps<{
      visible: boolean
      isEdit: boolean
      rowData?: StopLoadConfig
    }>(),
    { visible: false, isEdit: false }
  )
  const emit = defineEmits<{
    'update:visible': [value: boolean]
    reload: []
  }>()

  interface FormModel {
    id: string
    userId: string
    userName: string
    userPhone: string
    stations: StopLoadStationOption[]
  }

  const formRef = ref()
  const saving = ref(false)
  const stationLoading = ref(false)
  const stationOptions = ref<StopLoadStationOption[]>([])
  const form = reactive<FormModel>({
    id: '',
    userId: '',
    userName: '',
    userPhone: '',
    stations: []
  })
  const rules = {
    stations: [{ required: true, message: '请选择关注站点', trigger: 'change' }],
    userId: [{ required: true, message: '请选择提醒人', trigger: 'change' }]
  }

  const resetForm = () => {
    form.id = ''
    form.userId = ''
    form.userName = ''
    form.userPhone = ''
    form.stations = []
    stationOptions.value = []
    formRef.value?.clearValidate?.()
  }

  const toOption = (item: StationPageItem) => ({
    id: item.id,
    label: item.railwayStationName
  })

  const loadStationOptions = async (keyword = '') => {
    stationLoading.value = true
    const [error, result] = await queryStopLoadStations({
      railwayStationName: keyword,
      isHyStation: true,
      page: 1,
      pageSize: 2000
    })
    stationLoading.value = false
    if (error) return
    const loaded = result.items.map(toOption)
    const selected = form.stations.filter(
      (station) => !loaded.some((option) => option.id === station.id)
    )
    stationOptions.value = [...selected, ...loaded]
  }

  const handleOpen = async () => {
    resetForm()
    if (props.isEdit && props.rowData) {
      form.id = props.rowData.id || ''
      form.userId = props.rowData.userId || ''
      form.userName = props.rowData.userName || ''
      form.userPhone = props.rowData.userPhone || ''
      form.stations = (props.rowData.stations || []).map((station) => ({
        id: station.code,
        label: station.name
      }))
    }
    await loadStationOptions()
  }

  const handleClose = () => {
    if (saving.value) return
    emit('update:visible', false)
    nextTick(resetForm)
  }

  const handleUserChange = (_value: string, data?: { id?: string; userName?: string; phone?: string }) => {
    form.userId = data?.id || form.userId
    form.userName = data?.userName || ''
    form.userPhone = data?.phone || ''
  }

  const handleSave = async () => {
    if (saving.value) return
    const valid = await formRef.value?.validate?.().catch(() => false)
    if (!valid) return
    const payload: StopLoadConfigPayload = {
      id: form.id,
      userId: form.userId,
      userName: form.userName,
      userPhone: form.userPhone,
      stations: form.stations.map((station) => ({ code: station.id, name: station.label }))
    }
    saving.value = true
    const [error, success] = await saveStopLoadConfig(payload)
    saving.value = false
    if (error || !success) {
      ElMessage.error(error?.message || '保存失败')
      return
    }
    ElMessage.success('保存成功')
    emit('update:visible', false)
    emit('reload')
    nextTick(resetForm)
  }

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) resetForm()
    }
  )
</script>
