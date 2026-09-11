<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { formatTime } from '@/utils'
  import { useUserStore } from '@/store/modules/user'
  import ContributionInput from '@/views/railway/contribution/index.vue'
  import { createContact, updateContact } from '../api'
  import type { ContactFormPayload, ContactItem } from '../types'

  const props = defineProps<{
    modelValue: boolean
    organizationId: string
    contact?: Partial<ContactItem>
  }>()
  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    success: []
  }>()

  const userStore = useUserStore()
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const form = reactive({
    contactName: '',
    gender: null as number | null,
    contactMobilePhone: '',
    contactTelephone: '',
    contactDuty: '',
    contactDutyDesc: '',
    roomNum: '',
    contributor: String(userStore.userInfo?.given_name || ''),
    contributionaTime: formatTime(new Date(), 'yyyy-MM-dd')
  })

  const rules: FormRules = {
    contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择联系人性别', trigger: 'change' }],
    contactDuty: [{ required: true, message: '请输入联系人职务', trigger: 'blur' }],
    contributor: [{ required: true, message: '请选择贡献人', trigger: 'change' }],
    contributionaTime: [{ required: true, message: '请选择贡献时间', trigger: 'change' }]
  }

  const reset = () => {
    Object.assign(form, {
      contactName: '',
      gender: null,
      contactMobilePhone: '',
      contactTelephone: '',
      contactDuty: '',
      contactDutyDesc: '',
      roomNum: '',
      contributor: String(userStore.userInfo?.given_name || ''),
      contributionaTime: formatTime(new Date(), 'yyyy-MM-dd')
    })
  }

  const hydrate = () => {
    reset()
    if (!props.contact?.id) return
    Object.assign(form, {
      contactName: props.contact.contactName || '',
      gender: typeof props.contact.gender === 'number' ? props.contact.gender : null,
      contactMobilePhone: props.contact.contactMobilePhone || '',
      contactTelephone: props.contact.contactTelephone || '',
      contactDuty: props.contact.contactDuty || '',
      contactDutyDesc: props.contact.contactDutyDesc || '',
      roomNum: props.contact.roomNum || ''
    })
  }

  const save = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (valid === false) return
    const payload: ContactFormPayload = {
      ...form,
      gender: form.gender as number,
      centerOrganizationId: props.organizationId,
      ...(props.contact?.id ? { id: props.contact.id } : {})
    }
    loading.value = true
    const [error, success] = props.contact?.id
      ? await updateContact(payload)
      : await createContact(payload)
    loading.value = false
    if (error || !success) return
    ElMessage.success(props.contact?.id ? '编辑成功' : '新增成功')
    emit('success')
    visible.value = false
  }

  watch(
    [visible, () => props.contact],
    ([show]) => {
      if (show) hydrate()
    },
    { deep: true, immediate: true }
  )
</script>

<template>
  <ComDialog
    v-model="visible"
    width="920px"
    :title="contact?.id ? '编辑联系人' : '新增联系人'"
    show-fullscreen
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" label-suffix="：">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="contactName">
            <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="form.gender">
              <el-radio :value="0">先生</el-radio>
              <el-radio :value="1">女士</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机">
            <el-input v-model="form.contactMobilePhone" placeholder="请输入联系人手机" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="座机">
            <el-input v-model="form.contactTelephone" placeholder="请输入联系人座机" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职务" prop="contactDuty">
            <el-input v-model="form.contactDuty" placeholder="请输入联系人职务" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="房间号">
            <el-input v-model="form.roomNum" placeholder="请输入房间号" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="职责">
            <el-input
              v-model="form.contactDutyDesc"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="请输入联系人职责"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <ContributionInput
            v-model:contributor="form.contributor"
            v-model:contributiona-time="form.contributionaTime"
          />
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">保存</el-button>
    </template>
  </ComDialog>
</template>
