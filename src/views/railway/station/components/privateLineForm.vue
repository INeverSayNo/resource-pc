<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="专用线信息维护"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="showDetails = false"
  >
    <el-form
      ref="formRef"
      :model="edit"
      class="form-container"
      label-width="100px"
      label-suffix=":"
      :rules="rules"
    >
      <el-row>
        <el-col :span="12" v-if="!privateLine?.stationId">
          <el-form-item label="关联站点" prop="stationId">
            <DcRailwayStation
              v-model="stationName"
              :show-unknown="false"
              placeholder="请输入关联站点"
              :rules="[{ required: true }]"
              @change="handleStationChange"
            ></DcRailwayStation>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="专用线名称" prop="name">
            <el-input
              v-model="edit.name"
              :disabled="!isEdit"
              placeholder="请输入专用线名称"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="代码" prop="num">
            <el-input
              v-model="edit.num"
              :disabled="!isEdit"
              placeholder="请输入专用线代码"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="取货里程" prop="transferMileage">
            <el-input
              v-model="edit.transferMileage"
              type="number"
              :disabled="!isEdit"
              placeholder="请输入取货里程"
            >
              <template #suffix>米</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="专用线地址">
        <dc-map-select v-model:value="edit.addressFormat"></dc-map-select>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系人姓名" prop="contacts">
            <el-input
              v-model="edit.contacts"
              placeholder="请输入联系人姓名"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="联系人电话"
            prop="phone"
            :rules="[
              {
                validator: validatorNoHZZM,
                message: '请输入正确的电话号码',
                trigger: 'blur'
              }
            ]"
          >
            <el-input
              v-model="edit.phone"
              placeholder="请输入联系人电话"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="收费标准" prop="chargeRemark">
            <el-input
              v-model="edit.chargeRemark"
              type="textarea"
              :rows="3"
              placeholder="请输入收费标准"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="" prop="isAgreement">
            <el-switch
              v-model="edit.isAgreement"
              active-text="是否与专用线签订共用协议"
              inline-prompt
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="属性">
            <el-input
              v-model="edit.lineProperty"
              placeholder="请输入属性，如：企业/国铁"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类别">
            <el-input
              v-model="edit.lineType"
              placeholder="请输入类别，如：A/B"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属单位">
            <el-input
              v-model="edit.ownerUnit"
              placeholder="请输入所属单位"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产权单位">
            <el-input
              v-model="edit.rightUnit"
              placeholder="请输入产权单位"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="附件信息">
            <DcFileAttach
              v-model="fileAttacies"
              :action="action"
            ></DcFileAttach>
          </el-form-item>
        </el-col>
        <!-- 贡献人 -->
      <contribution-input style="width: 100%" v-model:contributor="edit.contributor" v-model:contributionaTime="edit.contributionaTime"></contribution-input>
      </el-row>
      <!-- 普货办理范围 -->
      <el-row>
        <el-col :span="24">
          <DcGap class="mb-05">普货办理范围</DcGap>
        </el-col>
        <el-col :span="24">
          <el-form-item label="达到品类">
            <el-input
              v-model="edit.arriveCategory"
              type="textarea"
              placeholder="请输入达到品类"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="发送品类">
            <el-input
              v-model="edit.sendCategory"
              type="textarea"
              placeholder="请输入发送品类"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="">
            <el-checkbox v-model="edit.overrun" :label="true">超限</el-checkbox>
            <el-checkbox v-model="edit.overweight" :label="true">
              超重
            </el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 集装箱办理范围 -->
      <el-row>
        <el-col :span="24">
          <DcGap class="mb-05">
            集装箱办理范围
            <span
              class="c-#145ca8 fr cursor-pointer"
              @click="expand.container = !expand.container"
            >
              {{ expand.container ? "收起" : "展开" }}
            </span>
          </DcGap>
        </el-col>
        <el-col v-show="expand.container" :span="24">
          <el-row>
            <el-col :span="24">
              <el-form-item label="发送">
                <el-select
                  v-model="containerSend"
                  multiple
                  filterable
                  clearable
                  placeholder="请选择集装箱发送办理范围"
                  @change="(val) => (edit.containerSendHS = val.join(','))"
                >
                  <el-option
                    v-for="item in containerOption"
                    :key="item.field"
                    :label="item.label"
                    :value="item.field"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="到达">
                <el-select
                  v-model="containerArrive"
                  multiple
                  filterable
                  clearable
                  placeholder="请选择集装箱到达办理范围"
                  @change="(val) => (edit.containerArriveHS = val.join(','))"
                >
                  <el-option
                    v-for="item in containerOption"
                    :key="item.field"
                    :label="item.label"
                    :value="item.field"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="">
                <el-checkbox v-model="edit.containerMixedLoading" :label="true">
                  集装箱混装
                </el-checkbox>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <!-- 危险品办理范围 -->
      <el-row>
        <el-col :span="24">
          <DcGap class="mb-05">
            危险品办理范围
            <span
              class="c-#145ca8 fr cursor-pointer"
              @click="expand.danger = !expand.danger"
            >
              {{ expand.danger ? "收起" : "展开" }}
            </span>
          </DcGap>
        </el-col>
        <el-col v-show="expand.danger" :span="24">
          <el-row>
            <el-col :span="24">
              <el-form-item label="灌装发送">
                <el-input
                  v-model="edit.dangerSendFilling"
                  placeholder="请输入危险品灌装发送货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="灌装到达">
                <el-input
                  v-model="edit.dangerArriveFilling"
                  placeholder="请输入危险品灌装到达货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="非灌装发送">
                <el-input
                  v-model="edit.dangerSendNotFilling"
                  placeholder="请输入危险品非灌装发送货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="非灌装到达">
                <el-input
                  v-model="edit.dangerArriveNotFilling"
                  placeholder="请输入危险品非灌装到达货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="集装箱发送">
                <el-input
                  v-model="edit.dangerSendContainer"
                  placeholder="请输入危险品集装箱发送货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="集装箱到达">
                <el-input
                  v-model="edit.dangerArriveContainer"
                  placeholder="请输入危险品集装箱到达货物"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <!-- 起重能力 -->
      <el-row>
        <el-col :span="24">
          <DcGap class="mb-05">
            起重能力
            <span
              class="c-#145ca8 fr cursor-pointer"
              @click="expand.LiftingCapacity = !expand.LiftingCapacity"
            >
              {{ expand.LiftingCapacity ? "收起" : "展开" }}
            </span>
          </DcGap>
        </el-col>
        <el-col v-show="expand.LiftingCapacity" :span="24">
          <el-row>
            <el-col :span="12">
              <el-form-item label="最大">
                <el-input
                  v-model="edit.maxLiftingCapacity"
                  placeholder="请输入最大起重能力"
                  type="number"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="叉车">
                <el-input
                  v-model="edit.forkliftLC"
                  placeholder="请输入叉车起重能力"
                  type="number"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="20尺集装箱">
                <el-input
                  v-model="edit.container20LC"
                  placeholder="请输入20尺集装箱起重能力"
                  type="number"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="40尺集装箱">
                <el-input
                  v-model="edit.container40LC"
                  placeholder="请输入40尺集装箱起重能力"
                  type="number"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="showDetails = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { DcDeep } from '@dczy/tie-tools'
  import { Message } from '@/components/Message'
  import DcMapSelect from '@/components/BmapSelect/index.vue'
  import DcGap from '@/components/Gap/index.vue'
  import DcRailwayStation from '@/components/Railway/station.vue'
  import DcFileAttach from '@/components/UploadAttach/dcUploadAttach.vue'
  import { FILE_URL } from '@/request'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import { useAnalyticsTrack } from '@/plugins/monitor'
  import { formatTime, GetAddress, validatorNoHZZM } from '@/utils'
  import type { FileAttach } from '@/utils/base-entity'
  import ContributionInput from '@/views/railway/contribution/index.vue'
  import { createPrivateLine, getPrivateLineDetail, updatePrivateLine } from '../../privateLine/api'
  import { ContainerType } from '../store'
  import type { RailWayPrivatelLine, RailWayPrivatelLineCrudDto } from '../types'

  defineOptions({ name: 'PrivateLineForm' })

  const props = withDefaults(
    defineProps<{
      modelValue?: boolean
      privateLine?: Partial<RailWayPrivatelLine>
    }>(),
    {
      modelValue: false,
      privateLine: () => ({})
    }
  )

  const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
    (event: 'success'): void
  }>()

  const { businessOperationStart, businessOperationEnd } = useAnalyticsTrack()
  const { SetTrace } = useStatisticTrace()
  const formRef = ref<FormInstance>()
  const stationName = ref('')
  const stationIptId = ref('')
  const edit = ref<RailWayPrivatelLineCrudDto>({})
  const loading = ref(false)
  const containerSend = ref<string[]>([])
  const containerArrive = ref<string[]>([])
  const fileAttacies = ref<FileAttach[]>([])
  const expand = ref({ danger: false, LiftingCapacity: false, container: false })
  const action = `${FILE_URL}/privateline`
  const containerOption = ContainerType.filter((item) => item.label)

  const showDetails = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value)
  })

  const isEdit = computed(() => !props.privateLine.id)

  const rules: FormRules<RailWayPrivatelLineCrudDto> = {
    name: [{ required: true, message: '请输入专用线名称', trigger: 'blur' }],
    num: [{ required: true, message: '请输入专用代码', trigger: 'blur' }],
    contributor: [{ required: true, message: '请选择贡献人', trigger: 'blur' }],
    contributionaTime: [{ required: true, message: '请选择贡献时间', trigger: 'blur' }]
  }

  const createEditModel = (line: Partial<RailWayPrivatelLine>): RailWayPrivatelLineCrudDto => ({
    name: line.name,
    num: line.num,
    transferMileage: line.transferMileage,
    contacts: line.contacts,
    phone: line.phone,
    chargeRemark: line.chargeRemark,
    addressFormat: GetAddress(line.address || '', true),
    isAgreement: line.isAgreement,
    lineProperty: line.lineProperty,
    lineType: line.lineType,
    ownerUnit: line.ownerUnit,
    rightUnit: line.rightUnit,
    shareUnit: line.shareUnit,
    arriveCategory: line.arriveCategory,
    sendCategory: line.sendCategory,
    overrun: line.overrun,
    overweight: line.overweight,
    containerSendHS: line.containerSendHS,
    containerArriveHS: line.containerArriveHS,
    containerMixedLoading: line.containerMixedLoading,
    maxLiftingCapacity: line.maxLiftingCapacity,
    forkliftLC: line.forkliftLC,
    container20LC: line.container20LC,
    container40LC: line.container40LC,
    dangerSendFilling: line.dangerSendFilling,
    dangerSendNotFilling: line.dangerSendNotFilling,
    dangerSendContainer: line.dangerSendContainer,
    dangerArriveFilling: line.dangerArriveFilling,
    dangerArriveNotFilling: line.dangerArriveNotFilling,
    dangerArriveContainer: line.dangerArriveContainer
  })

  const setDefaultContribution = () => {
    const userInfo = JSON.parse(localStorage.getItem('CurUser') || '{}') as { given_name?: string }
    edit.value.contributionaTime ||= formatTime(new Date(), 'yyyy-MM-dd')
    edit.value.contributor ||= userInfo.given_name || ''
  }

  const handleOpen = async () => {
    businessOperationStart()
    stationIptId.value = ''
    stationName.value = props.privateLine.stationName || ''
    fileAttacies.value = []

    let source = props.privateLine
    if (props.privateLine.id) {
      const [error, detail] = await getPrivateLineDetail(props.privateLine.id)
      if (!error) source = { ...props.privateLine, ...detail }
    }

    edit.value = createEditModel(source)
    containerArrive.value = source.containerArriveHS?.split(',').filter(Boolean) || []
    containerSend.value = source.containerSendHS?.split(',').filter(Boolean) || []
    fileAttacies.value = DcDeep.clone<FileAttach[]>(source.fileAttach || [])
    expand.value = { danger: false, LiftingCapacity: false, container: false }
    setDefaultContribution()
  }

  const handleStationChange = (_value: unknown, station?: { Id?: string; id?: string }) => {
    stationIptId.value = station?.Id || station?.id || ''
  }

  const handleSave = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) {
      Message.warning('请完整填写表单信息')
      return
    }

    const stationId = props.privateLine.stationId || stationIptId.value
    if (!props.privateLine.id && !stationId) {
      Message.warning('请选择正确的关联站点')
      return
    }

    const payload = DcDeep.clone<RailWayPrivatelLineCrudDto>(edit.value)
    payload.address = JSON.stringify(payload.addressFormat || GetAddress('', true))
    payload.fileAttach = DcDeep.clone<FileAttach[]>(fileAttacies.value)
    delete payload.addressFormat

    loading.value = true
    const [error, success] = props.privateLine.id
      ? await updatePrivateLine(props.privateLine.id, payload)
      : await createPrivateLine(stationId, payload)
    loading.value = false

    businessOperationEnd({
      dataId: props.privateLine.id || stationId,
      module: '铁路站点',
      page_title: '站点专用线信息编辑'
    })

    if (error || !success) {
      if (error) Message.error(error.message || '保存失败')
      return
    }

    Message.success('保存成功')
    showDetails.value = false
    if (props.privateLine.id) {
      SetTrace('$UPDATE', '铁路站点', '全国铁路站点', stationId)
    } else {
      SetTrace('$INSERT', '铁路站点', '全国铁路站点', stationId, 1, '专用线')
    }
    emit('success')
  }
</script>

<style></style>

