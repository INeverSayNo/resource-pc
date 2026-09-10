<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="堆存费标准编辑"
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="码头">
              <el-select
                v-model="edit.waterPortWharfId"
                clearable
                filterable
                remote
                reserve-keyword
                placeholder="请选择码头"
                style="width: 100%"
                @change="wharfClcik"
              >
                <el-option
                  v-for="item in wharfOption"
                  :key="item.id"
                  :label="item.wharfName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货物名称" prop="goodsName">
              <el-input v-model="edit.goodsName" placeholder="请输入货物名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="装货方式" prop="loadingType">
              <el-radio-group v-model="edit.loadingType">
                <el-radio label="散货" />
                <el-radio label="集装箱" />
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="堆场类型" prop="yardType">
              <el-select
                v-model="edit.yardType"
                filterable
                default-first-option
                placeholder="请选择或者输入堆场类型"
              >
                <el-option
                  v-for="item in yardTypeOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="堆存天数" prop="stockpilingMinDay">
          <el-col :span="12">
            <el-select
              v-model="edit.stockpilingMinDay"
              allow-create
              filterable
              default-first-option
              placeholder="请选择或输入堆存天数"
            >
              <el-option
                v-for="item in minDayOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col class="text-center" :span="5" style="margin: 0 0.5rem">
            {{ '< 时间 ≤' }}
          </el-col>
          <el-col :span="12">
            <el-select
              v-model="edit.stockpilingMaxDay"
              allow-create
              filterable
              default-first-option
              placeholder="请选择或输入堆存天数"
            >
              <el-option
                v-for="item in maxDayOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-col>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收费金额" prop="stowageFee">
              <el-input
                v-model="edit.stowageFee"
                type="number"
                placeholder="请输入收费标准"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格是否含税" prop="isContaintRax">
              <el-switch v-model="edit.isContaintRax"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="单位" prop="stowageUnit">
              <el-radio-group v-model="edit.stowageUnit">
                <el-radio label="元/吨.天" />
                <el-radio label="元/箱.天" />
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 贡献人 -->
        <contribution-input
          style=""
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
  import { createStowage, updateStowage } from '@/api/waterway-port'
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
        typeShow: ref<any>(false),
        typeName: '' as any,
        wharfOption: [] as any,
        minDayOption: [
          {
            value: 0,
            label: 0
          },
          {
            value: 30,
            label: 30
          },
          {
            value: 60,
            label: 60
          },
          {
            value: 90,
            label: 90
          }
        ],
        maxDayOption: [
          {
            value: 30,
            label: 30
          },
          {
            value: 60,
            label: 60
          },
          {
            value: 90,
            label: 90
          },
          {
            value: null,
            label: null
          }
        ],
        yardTypeOption: [
          {
            value: '堆场',
            label: '堆场'
          },
          {
            value: '仓库',
            label: '仓库'
          },
          {
            value: '筒仓',
            label: '筒仓'
          },
          {
            value: '平房仓',
            label: '平房仓'
          },
          {
            value: '露天',
            label: '露天'
          },
          {
            value: '苫盖',
            label: '苫盖'
          }
        ]
      })
      const rules = {
        stockpilingMinDay: [
          {
            required: true,
            message: '请选择或输入堆存天数最小值',
            trigger: 'change'
          },
          {
            pattern: /^\d+$/,
            message: '请输入正确的堆存天数',
            trigger: 'blur'
          }
        ],
        stowageUnit: [
          {
            required: true,
            message: '请选择收费单位',
            trigger: 'change'
          }
        ],
        stowageFee: [
          {
            required: true,
            message: '请输入收费金额',
            trigger: 'change'
          },
          {
            pattern: /^\d+(\.\d{1,2})?$/,
            message: '请输入正确的金额',
            trigger: 'blur'
          }
        ],
        contributor: [{ required: true, message: '请选择贡献人', trigger: 'blur' }],
        contributionaTime: [{ required: true, message: '请选择贡献时间', trigger: 'blur' }]
      }
      /** 窗口打开时，加载历史数据 */
      function handleOpen() {
        businessOperationStart()
        state.wharfOption = props.wharfData
        if (props.station?.id) {
          isEdit.value = true
          state.edit = {
            id: props?.station?.id,
            waterPortInfoId: props?.stationId,
            waterPortWharfId: props.station?.waterPortWharfId,
            waterPortWharfName: props.station?.waterPortWharfName,
            goodsName: props.station?.goodsName,
            loadingType: props.station?.loadingType,
            stockpilingMinDay: props.station?.stockpilingMinDay,
            stockpilingMaxDay: props.station?.stockpilingMaxDay,
            yardType: props.station?.yardType,
            isContaintRax: props.station?.isContaintRax,
            stowageFee: props.station?.stowageFee,
            stowageUnit: props.station?.stowageUnit
          }
        } else {
          isEdit.value = false
          state.edit = {
            stowageUnit: '元/吨.天',
            isContaintRax: true
          }
        }
        state.edit.contributionaTime = formatTime(new Date(), 'yyyy-MM-dd')
        state.edit.contributor = userStore.userInfo?.given_name || ''
      }
      const formRef = ref()
      /** 保存数据 */
      function handleSave() {
        businessOperationEnd({
          dataId: props?.station?.id,
          module: '水运港口',
          page_title: props?.station?.id ? '堆存超期收费编辑' : '堆存超期收费新增'
        })
        formRef.value?.validate(async (valid) => {
          if (valid) {
            state.loading = true
            const param = DcDeep.clone(state.edit)
            param.waterPortInfoId = props?.stationId
            if (props?.station?.id) {
              const [error, success] = await updateStowage(props.station.id, param)
              state.loading = false
              if (!error && success) {
                Message.success('保存成功')
                showDetails.value = false
                emit('success')
                SetTrace('$UPDATE', '水运港口', '堆存费超期收费标准信息')
              }
            } else {
              const [error, success] = await createStowage(param)
              state.loading = false
              if (!error && success) {
                Message.success('保存成功')
                showDetails.value = false
                emit('success')
                SetTrace('$INSERT', '水运港口', '堆存费超期收费标准信息')
              }
            }
          } else {
            Message.warning('请完整的填写表单信息')
          }
        })
      }
      function wharfClcik(value: any) {
        const obj = state.wharfOption.find((item: any) => {
          if (item.id === value) {
            return item
          }
        })
        if (obj !== undefined) {
          state.edit.waterPortWharfName = obj?.wharfName
        }
      }

      return {
        ...toRefs(state),
        showDetails,
        handleOpen,
        handleSave,
        isEdit,
        wharfClcik,
        rules,
        formRef
      }
    }
  })
</script>

<style></style>
