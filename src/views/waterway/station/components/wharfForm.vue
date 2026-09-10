<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="码头列表信息编辑"
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
        class="form-container"
        :rules="rules"
      >
        <el-form-item label="码头名称" prop="wharfName">
          <el-input v-model="edit.wharfName" placeholder="请输入码头名称"></el-input>
        </el-form-item>
        <el-form-item label="码头类型" prop="wharfType">
          <el-select
            v-model="edit.wharfType"
            filterable
            default-first-option
            placeholder="请选择或者输入码头类型"
          >
            <el-option
              v-for="item in wharfTypeOption"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="地理位置">
          <dc-map-select v-model:value="formAddress" @change="addressClick"></dc-map-select>
        </el-form-item>
        <el-form-item label="业务说明" prop="specification">
          <el-input
            v-model="edit.specification"
            placeholder="请输入业务说明"
            type="textarea"
            :rows="3"
            :maxlength="250"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="泊位类型" prop="berthType">
          <el-select v-model="edit.berthType" multiple placeholder="请选择泊位类型">
            <el-option key="散货泊位" label="散货泊位" value="散货泊位" />
            <el-option key="集装箱泊位" label="集装箱泊位" value="集装箱泊位" />
            <el-option key="杂货泊位" label="杂货泊位" value="杂货泊位" />
            <el-option key="罐船泊位" label="罐船泊位" value="罐船泊位" />
          </el-select>
        </el-form-item>

        <el-form-item label="免堆天数">
          <el-input v-model="edit.freeDays" type="number" placeholder="请输入免堆天数"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="泊位个数">
              <el-input v-model="edit.berths" type="number" placeholder="请输入泊位个数"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大船舶停靠吨位">
              <el-input
                v-model="edit.maxBerthT"
                type="number"
                placeholder="请输入最大船舶停靠吨位"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="泊位等级" prop="berthLeave">
              <el-input v-model="edit.berthLeave" type="number" placeholder="请输入泊位等级">
                <template #append>万吨</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="吃水深度" prop="draft">
              <el-input v-model="edit.draft" type="number" placeholder="请输入吃水深度">
                <template #append>米</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="吊机" prop="craneNum">
              <el-input v-model="edit.craneNum" type="number" placeholder="请输入吊机数量">
                <template #append>台</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作业效率" prop="workEfficiency">
              <el-input v-model="edit.workEfficiency" type="number" placeholder="请输入作业效率">
                <template #append>吨/小时</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="" prop="isCountyWharf">
              <el-switch v-model="edit.isCountyWharf" active-text="是否国有码头"></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="" prop="isHaveRawilway">
              <el-switch v-model="edit.isHaveRawilway" active-text="有无进港铁路"></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
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
  import { Message } from '@/components/Message'
  import { formatTime } from '@/utils'
  import { DcDeep } from '@dczy/tie-tools'
  import DcMapSelect from '@/components/BmapSelect/index.vue'
  import { computed, reactive, toRefs, defineComponent, ref } from 'vue'
  import { createWharf, updateWharf } from '@/api/waterway-port'
  import { useUserStore } from '@/store/modules/user'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import ContributionInput from '@/views/railway/contribution/index.vue'

  export default defineComponent({
    name: '',
    components: {
      DcMapSelect,
      ContributionInput
    },
    props: {
      modelValue: {
        type: Boolean,
        default: () => false
      },
      data: {
        type: Object as any,
        default: () => {}
      },
      stationId: {
        type: String as any,
        default: () => ''
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
        formAddress: {
          address: '',
          lat: '',
          lng: ''
        },
        wharfTypeOption: [
          {
            value: '散货',
            label: '散货'
          },
          {
            value: '集装箱',
            label: '集装箱'
          },
          {
            value: '危险品',
            label: '危险品'
          }
        ]
      })

      const rules = {
        wharfName: [{ required: true, message: '请输入码头名称', trigger: 'blur' }],
        wharfType: [{ required: true, message: '请选择码头类型', trigger: 'change' }],
        contributor: [{ required: true, message: '请选择贡献人', trigger: 'blur' }],
        contributionaTime: [{ required: true, message: '请选择贡献时间', trigger: 'blur' }]
      }
      const stationaryUserRef = ref<any>()
      /** 窗口打开时，加载历史数据 */
      function handleOpen() {
        businessOperationStart()
        if (props.data?.id) {
          isEdit.value = true
          state.edit = {
            id: props?.data?.id,
            waterPortInfoId: props?.stationId,
            wharfName: props.data?.wharfName,
            wharfType: props.data?.wharfType,
            address: props.data?.address,
            specification: props.data?.specification,
            freeDays: props.data?.freeDays,
            berths: props.data?.berths,
            maxBerthT: props.data?.maxBerthT,
            berthType: props.data?.berthType,
            berthLeave: props.data?.berthLeave,
            draft: props.data?.draft,
            craneNum: props.data?.craneNum,
            workEfficiency: props.data?.workEfficiency,
            isCountyWharf: props.data?.isCountyWharf,
            isHaveRawilway: props.data?.isHaveRawilway
          }
          state.formAddress.address = props.data?.address
          state.formAddress.lat = props.data?.coord?.split('/')[0]
          state.formAddress.lng = props.data?.coord?.split('/')[1]
        } else {
          isEdit.value = false
          state.edit = {}
          state.formAddress = {
            address: '',
            lat: '',
            lng: ''
          }
        }
        state.edit.contributionaTime = formatTime(new Date(), 'yyyy-MM-dd')
        state.edit.contributor = userStore.userInfo?.given_name || ''
      }
      function addressClick(address: any, lat: any, lng: any, regionName: any, adt: any) {
        state.edit.coord = lat + '/' + lng
        state.edit.address = address
      }
      const formRef = ref()
      /** 保存数据 */
      function handleSave() {
        businessOperationEnd({
          dataId: props?.data?.id,
          module: '水运港口',
          page_title: props.data?.id ? '码头编辑' : '码头新增'
        })
        formRef.value?.validate(async (valid) => {
          if (valid) {
            const param = DcDeep.clone(state.edit)
            param.waterPortInfoId = props?.stationId

            state.loading = true
            if (props.data?.id) {
              const [error, success] = await updateWharf(props.data.id, param)
              state.loading = false
              if (!error && success) {
                Message.success('保存成功')
                showDetails.value = false
                emit('success')
                SetTrace('$UPDATE', '水运港口', '码头信息')
              }
              SetTrace('$UPDATE', '水运港口', '码头信息', props?.data?.id)
            } else {
              const [error, success] = await createWharf(param)
              state.loading = false
              if (!error && success) {
                Message.success('保存成功')
                showDetails.value = false
                emit('success')
                SetTrace('$INSERT', '水运港口', '码头信息')
              }
              SetTrace('$INSERT', '水运港口', '码头信息', props.data?.id)
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
        addressClick,
        rules,
        formRef
      }
    }
  })
</script>

<style></style>
