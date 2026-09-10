<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="港口通过能力"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :rules="rules"
    @opened="handleOpen"
    @close="showDetails = false"
  >
    <template v-if="edit">
      <el-form
        ref="formRef"
        :model="edit"
        label-width="100px"
        label-suffix=":"
        class="form-container"
        :rules="rules"
      >
        <el-form-item label="数值" prop="numerical">
          <el-input v-model="edit.numerical" type="number" placeholder="请输入数值"></el-input>
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="edit.type">
            <el-option label="货物（万吨）" value="货物（万吨）" />
            <el-option label="集装箱（万箱）" value="集装箱（万箱）" />
            <el-option label="汽车（万辆）" value="汽车（万辆）" />
          </el-select>
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
  import { computed, reactive, toRefs, defineComponent, ref } from 'vue'
  import { Message } from '@/components/Message'
  import { createTrafficability, updateTrafficability } from '@/api/waterway-port'
  import { useUserStore } from '@/store/modules/user'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import ContributionInput from '@/views/railway/contribution/index.vue'
  import { DcDeep } from '@dczy/tie-tools'

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
        loading: false
      })
      const checkNumber = (rule: any, value: any, callback: any) => {
        const pattern = /^(?!0$)\d+(\.\d)?$/
        if (value === undefined || value === null || value === '') return callback()
        if (!pattern.test(String(value))) {
          return callback(new Error(rule.message || '请输入正确数值'))
        }
        callback()
      }
      const rules = {
        type: [
          {
            required: true,
            message: '请选择类型',
            trigger: 'blur'
          }
        ],
        numerical: [
          {
            required: true,
            message: '请输入数值',
            trigger: 'blur'
          },
          {
            validator: checkNumber,
            message: '请输入大于 0 且最多一位小数的数值',
            trigger: 'blur'
          }
        ],
        contributor: [{ required: true, message: '请选择贡献人', trigger: 'blur' }],
        contributionaTime: [{ required: true, message: '请选择贡献时间', trigger: 'blur' }]
      }
      const stationaryUserRef = ref<any>()
      /** 窗口打开时，加载历史数据 */
      function handleOpen() {
        businessOperationStart()
        if (props.station?._id) {
          isEdit.value = true
          state.edit = {
            id: props?.station?._id,
            type: props?.station?.Type,
            numerical: props.station?.Numerical
          }
        } else {
          isEdit.value = false
          state.edit = {}
        }
        state.edit.contributionaTime = formatTime(new Date(), 'yyyy-MM-dd')
        state.edit.contributor = userStore.userInfo?.given_name || ''
      }
      const formRef = ref()
      /** 保存数据 */
      function handleSave() {
        businessOperationEnd({
          dataId: props?.station?._id,
          module: '水运港口',
          page_title: props?.station?._id ? '港口通过能力编辑' : '港口通过能力新增'
        })
        formRef.value?.validate(async (valid) => {
          if (valid) {
            state.loading = true
            const param = DcDeep.clone(state.edit)
            param.waterPortInfoId = props?.stationId
            if (props?.station?._id) {
              const [error, success] = await updateTrafficability(props.station._id, param)
              state.loading = false
              if (!error && success) {
                showDetails.value = false
                emit('success')
                Message.success('保存成功')
                SetTrace('$UPDATE', '水运港口', '港口通过能力')
              }
            } else {
              const [error, success] = await createTrafficability(param)
              state.loading = false
              if (!error && success) {
                Message.success('保存成功')
                showDetails.value = false
                emit('success')
                SetTrace('$INSERT', '水运港口', '港口通过能力')
              }
            }
          } else {
            Message.warning('请完整的填写表单信息')
          }
        })
      }
      return {
        ...toRefs(state),
        showDetails,
        handleOpen,
        handleSave,
        stationaryUserRef,
        isEdit,
        rules,
        formRef
      }
    }
  })
</script>

<style></style>
