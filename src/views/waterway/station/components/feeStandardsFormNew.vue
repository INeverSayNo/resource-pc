<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="作业包干费标准信息编辑"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="showDetails = false"
  >
    <template v-if="edit">
      <el-form
        ref="formRef"
        :model="edit"
        size="small"
        label-width="100px"
        label-suffix=":"
        :rules="rules"
        class="form-container"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="费用项" prop="chargeCode">
              <el-select
                v-model="edit.chargeCode"
                filterable
                clearable
                default-first-option
                placeholder="请选择费用项"
              >
                <el-option
                  v-for="item in chargeCodeOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计费单位" prop="unit">
              <el-select v-model="edit.unit" clearable placeholder="请选择计费单位">
                <el-option label="元/箱" value="元/箱"></el-option>
                <el-option label="元/吨" value="元/吨"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="计费方式" prop="chargeBasis">
              <el-select v-model="edit.chargeBasis" clearable placeholder="请选择计费方式">
                <el-option
                  v-for="item in chargeBasisOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="集装箱尺寸" prop="containerSize">
              <el-select v-model="edit.containerSize" clearable placeholder="请选择集装箱尺寸">
                <el-option label="20" :value="20"></el-option>
                <el-option label="40" :value="40"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="外贸/内贸" prop="tradeType">
              <el-select v-model="edit.tradeType" clearable placeholder="请选择外贸/内贸">
                <el-option
                  v-for="item in tradeTypeOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出口/进口" prop="direction">
              <el-select v-model="edit.direction" clearable placeholder="请选择出口/进口">
                <el-option
                  v-for="item in directionOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="集装箱类型" prop="containerType">
              <el-select
                v-model="edit.containerType"
                filterable
                clearable
                placeholder="请选择集装箱类型"
              >
                <el-option
                  v-for="item in containerTypeOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基础单价" prop="basePrice">
              <el-input v-model="edit.basePrice" placeholder="请输入基础单价"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否空箱" prop="isEmpty">
              <el-select
                v-model="edit.isEmpty"
                placeholder="请选择是否空箱"
                clearable
                @change="handleEmptyChange"
              >
                <el-option label="是" :value="true"></el-option>
                <el-option label="否" :value="false"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="edit.remark"
            placeholder="请输入备注"
            type="textarea"
            :rows="3"
            :maxlength="250"
            show-word-limit
          ></el-input>
        </el-form-item>
        <!-- 贡献人 -->
        <contribution-input
          style="width: 100%"
          v-model:contributor="edit.contributor"
          v-model:contributionaTime="edit.contributionaTime"
        ></contribution-input>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="showDetails = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave"> 保存 </el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts">
  import { useAnalyticsTrack } from '@/plugins/monitor'
  import { formatTime } from '@/utils'
  import { DcDeep } from '@dczy/tie-tools'
  import { computed, reactive, toRefs, defineComponent, ref } from 'vue'
  import { Message } from '@/components/Message'
  import { createWorkFee, listWharfs, updateWorkFee } from '@/api/waterway-port'
  import { useUserStore } from '@/store/modules/user'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import ContributionInput from '@/views/railway/contribution/index.vue'
  export default defineComponent({
    name: '',
    components: {
      ContributionInput
    },
    props: {
      modelValue: {
        type: Boolean,
        default: () => false
      },
      station: {
        type: Object as any,
        default: () => {}
      },
      stationId: {
        type: String as any,
        default: () => ''
      },
      wharfData: {
        type: Array as any,
        default: () => [] as any
      },
      workZoneData: {
        type: Array as any,
        default: () => [] as any
      }
    },
    emits: ['update:modelValue', 'success'],
    setup(props, { emit }) {
      const userStore = useUserStore()
      const { SetTrace } = useStatisticTrace()
      const isEdit = ref<any>(false)
      const { businessOperationStart, businessOperationEnd } = useAnalyticsTrack()
      const showDetails = computed({
        get: () => props.modelValue,
        set: (val) => {
          emit('update:modelValue', val)
        }
      })
      const state = reactive({
        edit: ref<any>({}),
        loading: false,
        chargeCodeOption: [
          { label: '港杂包干费', value: 'PORT_PACKAGE' },
          { label: '码头操作费', value: 'THC' },
          { label: '订舱费', value: 'BOOKING' },
          { label: '文件费', value: 'DOC' },
          { label: '设备交接单费', value: 'EIR' },
          { label: '封条费', value: 'SEAL' },
          { label: '港口安保费', value: 'ISPS' },
          { label: '舱单费', value: 'MANIFEST' },
          { label: '集装箱总重验证费', value: 'VGM' },
          { label: '堆场超期费', value: 'DEMURRAGE' },
          { label: '滞箱费', value: 'DETENTION' },
          { label: '查验费', value: 'INSPECTION' },
          { label: '集装箱吊装费', value: 'LIFTING' }
        ],
        chargeBasisOption: [
          { label: '按箱', value: 0 },
          { label: '按重量吨', value: 1 },
          { label: '按体积吨', value: 2 },
          { label: '择大', value: 3 }
        ],
        tradeTypeOption: [
          { label: '内贸', value: 0 },
          { label: '外贸', value: 1 }
        ],
        directionOption: [
          { label: '出口', value: 0 },
          { label: '进口', value: 1 }
        ],
        containerTypeOption: [
          { label: '通用集装箱', value: 0 },
          { label: '高柜集装箱', value: 1 },
          { label: '冷藏集装箱', value: 2 },
          { label: '开顶集装箱', value: 3 },
          { label: '框架集装箱', value: 4 },
          { label: '罐式集装箱', value: 5 },
          { label: '挂衣集装箱', value: 6 },
          { label: '通风集装箱', value: 7 },
          { label: '保温/隔热集装箱', value: 8 },
          { label: '散货集装箱', value: 9 },
          { label: '平台集装箱', value: 10 },
          { label: '侧开集装箱', value: 11 },
          { label: '牲畜集装箱', value: 12 },
          { label: '水运散货', value: 999 }
        ]
      })
      const checkNumber = (rule: any, value: any, callback: any) => {
        const reg = /^[1-9]\d*$/ // 整数
        const reg2 = /^(?!0$)\d+(\.\d)?$/ // 小数
        if (value === '' || value === null || value === undefined) {
          callback(new Error('请输入基础单价'))
          return
        }
        if (!reg.test(String(value)) && !reg2.test(String(value))) {
          callback(new Error('请输入数字'))
          return
        }
        callback()
      }
      const rules = {
        chargeCode: [{ required: true, message: '请选择费用代码', trigger: 'change' }],
        unit: [{ required: true, message: '请选择计费单位', trigger: 'change' }],
        chargeBasis: [{ required: true, message: '请选择计费基础', trigger: 'change' }],
        basePrice: [{ required: true, validator: checkNumber, trigger: 'blur' }],
        contributor: [{ required: true, message: '请选择贡献人', trigger: 'blur' }],
        contributionaTime: [{ required: true, message: '请选择贡献时间', trigger: 'blur' }]
      }
      const stationaryUserRef = ref<any>()
      /** 是否空箱清空时置为 null */
      function handleEmptyChange(val: any) {
        if (val === '' || val === undefined) {
          state.edit.isEmpty = null
        }
      }
      /** 窗口打开时，加载历史数据 */
      function handleOpen() {
        businessOperationStart()
        // 主键字段：jobfee-queryById-new 返回的是 id（camelCase）
        const editId = props.station?.id || props.station?._id
        if (editId) {
          isEdit.value = true
          state.edit = {
            id: editId,
            waterPortInfoId: props?.stationId,
            chargeCode: props.station?.chargeCode,
            unit: props.station?.unit,
            chargeBasis: props.station?.chargeBasis,
            containerSize: props.station?.containerSize,
            basePrice: props.station?.basePrice,
            tradeType: props.station?.tradeType,
            direction: props.station?.direction,
            containerType: props.station?.containerType,
            isEmpty: props.station?.isEmpty ?? null,
            remark: props.station?.remark,
            contributor: props.station?.contributor || props.station?.Contributor || '',
            contributionaTime:
              props.station?.contributionaTime || props.station?.ContributionTime || ''
          }
        } else {
          isEdit.value = false
          state.edit = { unit: '元/吨' }
        }
        // 港口ID（不展示，提交时一并传后台）
        state.edit.portId = props.stationId || ''
        // 已有贡献信息则保留，新增时使用默认值
        if (!state.edit.contributionaTime) {
          state.edit.contributionaTime = formatTime(new Date(), 'yyyy-MM-dd')
        }
        if (!state.edit.contributor) {
          state.edit.contributor = userStore.userInfo?.given_name || ''
        }
      }
      const formRef = ref()
      /** 保存数据 */
      function handleSave() {
        const editId = props.station?.id || props.station?._id
        businessOperationEnd({
          dataId: editId,
          module: '水运港口',
          page_title: editId ? '作业包干费标准编辑' : '作业包干费标准新增'
        })
        formRef.value?.validate(async (valid) => {
          if (valid) {
            state.loading = true
            const param = DcDeep.clone(state.edit)
            param.waterPortInfoId = props?.stationId
            param.portId = props?.stationId
            // 是否空箱：未选择时提交 null
            if (param.isEmpty === '' || param.isEmpty === undefined) {
              param.isEmpty = null
            }
            if (editId) {
              param.id = editId
              const [error, success] = await updateWorkFee(param)
              state.loading = false
              if (!error && success) {
                Message.success('保存成功')
                showDetails.value = false
                emit('success')
                SetTrace('$UPDATE', '水运港口', '作业包干费标准')
              }
            } else {
              const [error, success] = await createWorkFee(param)
              state.loading = false
              if (!error && success) {
                Message.success('保存成功')
                showDetails.value = false
                emit('success')
                SetTrace('$INSERT', '水运港口', '作业包干费标准')
              }
            }
          } else {
            Message.warning('请完整的填写表单信息')
          }
        })
      }
      const wharf = ref()
      async function getWharf() {
        const [error, data] = await listWharfs(props.stationId)
        wharf.value = error ? [] : data
      }
      function handlePlChange(val) {
        const item = wharf.value.find((x) => x.id === val)
        state.edit.wharfName = item?.wharfName
        state.edit.wharfId = item?.id
      }

      return {
        ...toRefs(state),
        showDetails,
        handleOpen,
        handleSave,
        stationaryUserRef,
        isEdit,
        rules,
        formRef,
        getWharf,
        wharf,
        handlePlChange,
        handleEmptyChange
      }
    }
  })
</script>

<style></style>
