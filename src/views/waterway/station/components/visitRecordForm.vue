<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="visible"
    :width="1000"
    :title="title"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="visible = false"
  >
    <el-form
      ref="formRef"
      class="form-container"
      :model="edit"
      size="small"
      label-suffix=":"
      label-width="100px"
      :rules="rules"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="拜访业务">
            <el-radio-group
              v-model="edit.visitExtendJson.visitBusinessType"
              @change="handleBusinessTypeChange"
            >
              <el-radio label="港口" />
              <el-radio label="码头" />
              <el-radio label="作业区" />
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col v-if="edit.visitExtendJson.visitBusinessType === '码头'" :span="12">
          <el-form-item label="码头" prop="visitExtendJson.businessObjId">
            <el-select
              v-model="edit.visitExtendJson.businessObjId"
              placeholder="请选择码头"
              filterable
              clearable
              @change="handlePlChange"
            >
              <el-option
                v-for="item in wharfData"
                :key="item.id"
                :label="item.wharfName"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="edit.visitExtendJson.visitBusinessType === '作业区'" :span="12">
          <el-form-item label="作业区" prop="visitExtendJson.businessObjId">
            <el-select
              v-model="edit.visitExtendJson.businessObjId"
              placeholder="请选择作业区"
              filterable
              clearable
              @change="handlePlChange"
            >
              <el-option
                v-for="item in workZoneData"
                :key="item.id || item._id"
                :label="item.workZoneName || item.WorkZoneName || item.name"
                :value="item.id || item._id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="拜访方式">
            <el-radio-group v-model="edit.visitExtendJson.visitType">
              <el-radio
                v-for="item in optionsState.visitTypeOptions"
                :key="item.value"
                :label="item.value"
              >
                {{ item.text }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="联系人">
            <el-select
              v-model="edit.visitExtendJson.contactId"
              placeholder="请输入联系人信息"
              filterable
              clearable
              default-first-option
              @change="handleContactChange"
            >
              <el-option
                v-for="item in contactData"
                :key="item?.id"
                :label="item?.contact"
                :value="item?.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="visitExtendJson.contactPhone">
            <el-input
              v-model="edit.visitExtendJson.contactPhone"
              placeholder="请输入联系电话"
              :maxlength="11"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="拜访日期" prop="visitDate">
            <el-date-picker v-model="edit.visitDate" placeholder="请选择拜访日期"></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="拜访内容" prop="visitContent">
        <el-input
          v-model="edit.visitContent"
          placeholder="请输入拜访内容"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave"> 保存 </el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts" setup>
  import { Message } from '@/components/Message'
  import { formatTime } from '@/utils'
  import { DcDeep } from '@dczy/tie-tools'
  import { computed, ref, watch, reactive } from 'vue'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import { BaseData, GetSystemBaseDataAsync } from '@/api/dictionaryApi'
  import { createVisit } from '@/api/waterway-port'
  import { useAnalyticsTrack } from '@/plugins/monitor'
  const env = (import.meta.env.VITE_ENV_TYPE as string) || 'dev'
  const props = defineProps({
    show: {
      type: Boolean,
      default: () => false
    },
    title: {
      type: String,
      default: () => '新增港口拜访记录'
    },
    data: {
      type: Object,
      default: () => {}
    },
    stationId: {
      type: String,
      default: () => ''
    },
    stationName: {
      type: String,
      default: () => ''
    },
    contactData: {
      type: Array as any,
      default: () => [] as any
    },
    wharfData: {
      type: Array as any,
      default: () => [] as any
    },
    workZoneData: {
      type: Array as any,
      default: () => [] as any
    }
  })
  const { businessOperationStart, businessOperationEnd } = useAnalyticsTrack()

  const { SetTrace } = useStatisticTrace()
  const edit = ref<any>({
    businessTbName: '',
    businessTypeId: '',
    visitExtendJson: {
      businessObjId: '' as string,
      visitBusinessType: 0 as number,
      contactId: '' as string,
      contact: '' as string,
      contactPhone: '' as string
    },
    businessId: props.stationId,
    businessName: props.stationName,
    visitDate: formatTime(new Date(), 'yyyy-MM-dd HH:mm'),
    visitContent: ''
  })
  const formRef = ref()
  const loading = ref(false)
  const stationId = computed(() => props.stationId)

  function handleContactChange(val: any) {
    const item = props.contactData?.find((x: any) => x.id === val) as any
    edit.value.visitExtendJson.contactPhone = item?.contactTel || item?.phone || ''
    edit.value.visitExtendJson.contact = item?.contact || item?.label || ''
  }
  function handleBusinessTypeChange() {
    edit.value.visitExtendJson.businessObjId = ''
    edit.value.visitExtendJson.businessObjName = ''
  }
  function handlePlChange(val: string) {
    if (edit.value.visitExtendJson.visitBusinessType === '码头') {
      const item = props.wharfData.find((x) => x.id === val)
      edit.value.visitExtendJson.businessObjName = item?.wharfName || item?.name || ''
    } else {
      const item = props.workZoneData.find((x) => (x.id || x._id) === val)
      edit.value.visitExtendJson.businessObjName =
        item?.workZoneName || item?.WorkZoneName || item?.name || ''
    }
  }
  function handleSave() {
    businessOperationEnd({
      dataId: props.stationId,
      module: '水运港口',
      page_title: '新增拜访记录'
    })
    formRef.value?.validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true
        const temp = DcDeep.clone(edit.value)
        temp.visitDate = formatTime(temp.visitDate, 'yyyy-MM-ddTHH:mm:ss')
        const [error, success] = await createVisit(temp)
        loading.value = false
        if (!error && success) {
          Message.success('保存成功')
          SetTrace('$INSERT', '水运港口', '港口拜访', props.stationId, 1, '拜访记录')
          SetTrace('$UPDATE', '水运港口', '港口拜访', props.stationId)
          emits('success')
          visible.value = false
        }
      } else {
        Message.warning('请完整的填写表单信息')
      }
    })
  }

  watch(
    () => props.contactData,
    (val: any) => {
      if (val.length === 1) {
        edit.value.visitExtendJson!.contact = val[0].contact || val[0].label
        edit.value.visitExtendJson!.contactPhone = val[0].contactTel || val[0].phone
      } else {
        edit.value.visitExtendJson!.contact = ''
        edit.value.visitExtendJson!.contactPhone = ''
      }
    }
  )
  const optionsState = reactive({
    visitTypeOptions: [] as BaseData[]
  })
  function getVisitType() {
    GetSystemBaseDataAsync('ResourceVisitType').then((res) => {
      optionsState.visitTypeOptions = ((res || []) as BaseData[]).map((x) => {
        x.value = x.text
        return x
      })
    })
  }
  const rules = {
    visitDate: [{ required: true, message: '请选择拜访日期', trigger: 'blur' }],
    visitContent: [{ required: true, message: '请输入拜访内容', trigger: 'blur' }],
    'visitExtendJson.businessObjId': [
      { required: true, message: '请选择码头或作业区信息', trigger: 'change' }
    ]
  }
  const emits = defineEmits(['update:show', 'success'])
  const visible = computed({
    get: () => props.show,
    set: (val) => {
      emits('update:show', val)
    }
  })
  const resourceObject = {
    id:
      env === 'pro'
        ? '3a00ef85-a57a-dd67-3427-5e8d7a7bdf4a'
        : '3a00ab0e-1194-c042-89ad-becd2abb452d',
    tbName: 'ResourceDiy_WaterPortInfo'
  }
  function handleOpen() {
    businessOperationStart()
    optionsState.visitTypeOptions = []
    getVisitType()
    edit.value = {
      businessTbName: resourceObject.tbName,
      businessTypeId: resourceObject.id,
      visitExtendJson: {
        visitBusinessType: '' as string,
        businessObjId: '' as string,
        contactId: '' as string,
        contact: '' as string,
        contactPhone: '' as string
      },
      businessId: props.stationId as string,
      businessName: props.stationName as string,
      visitDate: formatTime(new Date(), 'yyyy-MM-dd HH:mm'),
      visitContent: ''
    }
  }
</script>

<style lang="less" scoped></style>
