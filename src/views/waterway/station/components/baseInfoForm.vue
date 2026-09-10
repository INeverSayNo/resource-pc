<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    :title="isEdit ? '港口信息编辑' : '新增港口信息'"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="showDetails = false"
  >
    <template v-if="edit">
      <el-form
        ref="formRef"
        :model="edit"
        label-width="100px"
        label-suffix=":"
        :rules="rules"
        class="form-container"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="港口全称" prop="portName">
              <el-input v-model="edit.portName" placeholder="请输入港口全称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="港口名称" prop="portAreaName">
              <el-input v-model="edit.portAreaName" placeholder="请输入港口名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="港口国籍" prop="portNationality">
          <el-select v-model="edit.portNationality" filterable placeholder="请选择港口国籍">
            <el-option
              v-for="item in nationalityOptions"
              :key="item.field"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="港口地址" prop="address">
          <dc-map-select v-model:value="formAddress" @change="addressClick"></dc-map-select>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="港口分类" prop="portType">
              <el-select v-model="edit.portType" placeholder="请选择港口分类">
                <el-option
                  v-for="item in stationGradeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="港口分级" prop="portScale">
              <el-select v-model="edit.portScale" placeholder="请选择港口分级">
                <el-option
                  v-for="item in stationScaleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="港口简介" prop="portSynopsis">
          <el-input
            v-model="edit.portSynopsis"
            placeholder="请输入港口简介"
            type="textarea"
            :rows="3"
            :maxlength="1000"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item label="所属区域" prop="areaId">
          <DcAreaCompany
            v-model="edit.areaId"
            :is-access-control="false"
            v-model:label="edit.areaName"
            placeholder="请选择所属区域公司"
          ></DcAreaCompany>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="区域负责人" prop="areaUserId">
              <DcOrgUserSelect
                v-model="edit.areaUserId"
                :show-tree="false"
                :multiple="false"
                placeholder="请选择道臣公司负责该港口的人员"
                @change="handleChangePrincipalId"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" prop="areaUserTel">
            <el-form-item label="负责人电话">
              <el-input v-model="edit.areaUserTel" placeholder="请输入负责人电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="portSpecification">
          <el-input
            v-model="edit.portSpecification"
            placeholder="请输入备注"
            type="textarea"
            :rows="3"
            :maxlength="1000"
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
  import { Message } from '@/components/Message'
  import { formatTime } from '@/utils'
  import { computed, reactive, toRefs, defineComponent, ref } from 'vue'
  import DcMapSelect from '@/components/BmapSelect/index.vue'
  import DcAreaCompany from '@/components/OrgAreaSelect/index.vue'
  import DcOrgUserSelect from '@/components/TableUserSelectV2/selectField.vue'
  import { WaterwayStationDto } from '../types'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import { createPort, updatePort } from '@/api/waterway-port'
  import { useUserStore } from '@/store/modules/user'
  import { useWaterwayStationStore } from '../store/index'
  import { useRouter } from 'vue-router'
  import ContributionInput from '@/views/railway/contribution/index.vue'
  import { NationalityOptions } from '../store'
  import { DcDeep } from '@dczy/tie-tools'
  export default defineComponent({
    name: '',
    components: {
      DcMapSelect,
      DcAreaCompany,
      DcOrgUserSelect,
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
      fileAttach: {
        type: Array as any,
        default: () => []
      },
      carryingCapacityList: {
        type: Array as any,
        default: () => []
      }
    },
    emits: ['update:modelValue', 'success'],
    setup(props, { emit }) {
      const waterwayStationStore = useWaterwayStationStore()
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
      const router = useRouter()
      const state = reactive({
        edit: ref<any>({}),
        loading: false,
        formAddress: {
          address: '',
          lat: '',
          lng: ''
        }
      })
      const rules = {
        address: [{ required: true, message: '请选择地址', trigger: 'change' }],
        portType: [{ required: true, message: '请选择港口分类', trigger: 'change' }],
        portScale: [{ required: true, message: '请选择港口分级', trigger: 'change' }],
        portName: [{ required: true, message: '请输入港口全称', trigger: 'blur' }],
        portAreaName: [{ required: true, message: '请输入港口名称', trigger: 'blur' }],
        contributor: [{ required: true, message: '请选择贡献人', trigger: 'blur' }],
        contributionaTime: [{ required: true, message: '请选择贡献时间', trigger: 'change' }],
        portNationality: [{ required: true, message: '请选择港口国籍', trigger: 'change' }]
      }
      /** 窗口打开时，加载历史数据 */
      function handleOpen() {
        businessOperationStart()
        if (props.station?.id) {
          isEdit.value = true
          state.edit = {
            portType: props.station?.portType,
            portScale: props.station?.portScale,
            portName: props.station?.portName,
            portAreaName: props.station?.portAreaName,
            portAddress: props.station?.portAddress,
            portCoord: props.station?.portCoord,
            address: props.station?.address,
            portSpecification: props.station?.portSpecification,
            portSynopsis: props.station?.portSynopsis,
            areaId: props.station?.areaId,
            areaName: props.station?.areaName,
            areaUserId: props.station?.areaUserId,
            areaUserName: props.station?.areaUserName,
            areaUserTel: props.station?.areaUserTel,
            viewCount: props.station?.viewCount,
            remark: props.station?.remark,
            portNationality: props.station?.portNationality,
            carryingCapacityList: DcDeep.clone(props.carryingCapacityList),
            fileAttach: props.fileAttach
          }
          state.formAddress.address = props.station?.address
          state.formAddress.lat = props.station?.portCoord?.split('/')[0]
          state.formAddress.lng = props.station?.portCoord?.split('/')[1]
        } else {
          isEdit.value = false
          state.edit = {}
          state.formAddress = { address: '', lat: '', lng: '' }
        }
        state.edit.contributionaTime = formatTime(new Date(), 'yyyy-MM-dd')
        state.edit.contributor = userStore.userInfo?.given_name || ''
      }
      function addressClick(address: any, lat: any, lng: any, regionName: any) {
        state.edit.portAddress = regionName
        state.edit.portCoord = lat + '/' + lng
        state.edit.address = address

        state.formAddress.address = address
        state.formAddress.lat = lat
        state.formAddress.lng = lng
      }
      const formRef = ref()
      /** 保存数据 */
      function handleSave() {
        businessOperationEnd({
          dataId: props?.station?.id,
          module: '水运港口',
          page_title: props.station?.id ? '港口信息编辑' : '港口信息新增'
        })
        formRef.value?.validate(async (valid) => {
          if (valid) {
            const param = DcDeep.clone(state.edit)
            // 通过能力由详情中的独立表单维护；编辑港口基础信息时原样回传，避免误删。
            const portTrafficability = DcDeep.clone(props.carryingCapacityList || [])
            state.loading = true

            const par = {
              waterPort: param,
              contributor: param.contributor,
              contributionaTime: param.contributionaTime,
              portTrafficability: portTrafficability,
              fileAttach: state.edit.fileAttach
            }
            const editpar = {
              ...param,
              trafficability: portTrafficability,
              fileAttach: state.edit.fileAttach
            }
            if (props.station?.id) {
              const [error, success] = await updatePort(props.station.id, editpar)
              state.loading = false
              if (error || !success) return
              Message.success('保存成功')
              emit('success')
              showDetails.value = false
              SetTrace('$UPDATE', '水运港口', '港口基础信息')
              SetTrace('$UPDATE', '水运港口', '港口基础信息', props?.station?.id)
            } else {
              const [error, id] = await createPort(par)
              state.loading = false
              if (error || !id) return
              Message.success('保存成功')
              emit('success')
              showDetails.value = false
              gotoDetails({
                _id: id,
                Id: id,
                PortScale: '',
                PortType: '',
                PortName: '',
                PortAreaName: '',
                PortAddress: '',
                PortCoord: '',
                Address: '',
                PortSpecification: '',
                AreaId: '',
                AreaName: '',
                AreaUserId: '',
                AreaUserName: '',
                AreaUserTel: '',
                UpdateOrganizationName: '',
                ViewCount: 0,
                Remark: ''
              })
              SetTrace('$INSERT', '水运港口', '港口基础信息')
              SetTrace('$INSERT', '水运港口', '港口基础信息', '')
            }
          } else {
            Message.warning('请完整的填写表单信息')
          }
        })
      }
      /** 港口分类 */
      const stationGradeOptions = [
        '长江港口',
        '沿海港口',
        '京杭港口',
        '珠江港口',
        '四川水域港口',
        '赣江港口',
        '松花江港口',
        '汉江港口'
      ]
      /** 港口分级 */
      const stationScaleOptions = [
        { label: '核心港口', value: 'Core' },
        { label: '重要港口', value: 'Important' },
        { label: '普通港口', value: 'Ordinary' },
        { label: '待开发港口', value: 'Todo' }
      ]
      const nationalityOptions = ref(NationalityOptions)
      function handleChangePrincipalId(_, data: any) {
        state.edit.areaUserId = data?.id || ''
        state.edit.areaUserName = data?.userName || ''
        state.edit.areaUserTel = data?.phone || ''
      }
      function gotoDetails(item: WaterwayStationDto) {
        const query = { id: item._id || item.Id, name: item.PortName }
        waterwayStationStore.push(DcDeep.clone<WaterwayStationDto>(item))
        waterwayStationStore.setCurrent(DcDeep.clone<WaterwayStationDto>(item))
        void router.push({ path: '/resource-app/waterway-port-dt', query })
      }
      return {
        ...toRefs(state),
        showDetails,
        stationGradeOptions,
        stationScaleOptions,
        handleOpen,
        handleSave,
        handleChangePrincipalId,
        isEdit,
        rules,
        addressClick,
        router,
        formRef,
        nationalityOptions
      }
    }
  })
</script>

<style></style>
