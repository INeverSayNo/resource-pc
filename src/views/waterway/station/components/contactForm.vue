<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="800"
    title="联系人信息编辑"
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
        <el-form-item label="码头" prop="wharfName">
          <el-select
            v-model="edit.businessObjId"
            placeholder="请选择码头"
            filterable
            clearable
            @visible-change="getWharf"
            @change="handlePlChange"
          >
            <el-option
              v-for="item in wharf"
              :key="item.id"
              :label="item.wharfName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="edit.contact" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactTel">
          <el-input v-model="edit.contactTel" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="负责业务说明" prop="serviceBrochure">
          <el-input
            v-model="edit.serviceBrochure"
            placeholder="请输入负责业务说明"
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
  import { Message } from '@/components/Message'
  import { formatTime } from '@/utils'
  import { DcDeep } from '@dczy/tie-tools'
  import { computed, reactive, toRefs, defineComponent, ref } from 'vue'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import { createContact, listWharfs, updateContact } from '@/api/waterway-port'
  import { useUserStore } from '@/store/modules/user'
  import ContributionInput from '@/views/railway/contribution/index.vue'
  export default defineComponent({
    name: '',
    components: {
      ContributionInput
    },
    props: {
      modelValue: {
        type: Boolean as any,
        default: () => false
      },
      contact: {
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
        loading: false
      })
      const wharf = ref<any[]>([])
      async function getWharf() {
        const [error, data] = await listWharfs(props.stationId)
        if (!error) wharf.value = data
      }
      const rules = {
        contact: [{ required: true, message: '请输入联系人名称', trigger: 'blur' }],
        contactTel: [
          { required: true, message: '请输入联系人电话', trigger: 'blur' },
          {
            pattern: /^(1[3456789]\d{9}|(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14})$/,
            message: '请输入正确的电话号码',
            trigger: ['blur']
          }
        ],
        serviceBrochure: [{ required: true, message: '请输入联系人业务说明', trigger: 'blur' }],
        contributor: [{ required: true, message: '请选择贡献人', trigger: 'blur' }],
        contributionaTime: [{ required: true, message: '请选择贡献时间', trigger: 'blur' }],
        wharfName: [{ required: true, message: '请选择码头', trigger: 'blur' }]
      }

      const stationaryUserRef = ref<any>()
      /** 窗口打开时，加载历史数据 */
      function handleOpen() {
        businessOperationStart()
        if (props.contact?.id) {
          isEdit.value = true
          state.edit = {
            id: props?.contact?.id,
            waterPortInfoId: props?.stationId,
            contact: props.contact?.contact,
            contactTel: props.contact?.contactTel,
            serviceBrochure: props.contact?.serviceBrochure,
            updateUserId: props.contact?.updateUserId,
            updateUserName: props.contact?.updateUserName,
            wharfName: props.contact?.wharfName,
            wharfId: props.contact?.wharfId,
            businessObjId: props.contact?.businessObjId || props.contact?.wharfId
          }
        } else {
          state.edit = {}
          isEdit.value = false
        }
        state.edit.contributionaTime = formatTime(new Date(), 'yyyy-MM-dd')
        state.edit.contributor = userStore.userInfo?.given_name || ''
      }
      function handlePlChange(val) {
        const item = wharf.value.find((x) => x.id === val)
        state.edit.wharfName = item?.wharfName
        state.edit.wharfId = item?.id
      }
      const formRef = ref()
      /** 保存数据 */
      function handleSave() {
        businessOperationEnd({
          dataId: props?.contact?.id,
          module: '水运港口',
          page_title: props?.contact?.id ? '联系人信息编辑' : '联系人信息新增'
        })
        formRef.value?.validate(async (valid) => {
          if (valid) {
            state.loading = true
            const param = DcDeep.clone(state.edit)
            param.waterPortInfoId = props?.stationId
            if (props?.contact?.id) {
              param.updateUserId = userStore.userInfo?.erp_userid
              param.updateUserName = userStore.userInfo?.given_name
              const [error, success] = await updateContact(props.contact.id, param)
              state.loading = false
              if (!error && success) {
                Message.success('保存成功')
                showDetails.value = false
                emit('success')
                SetTrace('$UPDATE', '水运港口', '联系人信息')
              }
            } else {
              const [error, success] = await createContact(param)
              state.loading = false
              if (!error && success) {
                Message.success('保存成功')
                showDetails.value = false
                emit('success')
                SetTrace('$INSERT', '水运港口', '联系人信息')
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
        formRef,
        getWharf,
        wharf,
        handlePlChange
      }
    }
  })
</script>

<style></style>
