<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { formatTime } from '@/utils'
  import { getSystemDataShow } from '@/api/systemDataShowApi'
  import { useUserStore } from '@/store/modules/user'
  import DcMapSelect from '@/components/BmapSelect/index.vue'
  import DcAreaCompanySelect from '@/components/OrgAreaSelect/index.vue'
  import DcOrgUserSelect from '@/components/TableUserSelectV2/selectField.vue'
  import ContributionInput from '@/views/railway/contribution/index.vue'
  import CenterImageUpload from './CenterImageUpload.vue'
  import {
    createOrganization,
    getCenterLabels,
    getOrganizationDetail,
    queryStations,
    saveCenterLabels,
    saveOrganizationStations,
    updateOrganization
  } from '../api'
  import { parseAddress, resolveFileUrl } from '../logic'
  import type {
    AddressInfo,
    CenterFormPayload,
    EditorNode,
    FileInfo,
    OrganizationFormPayload,
    OrganizationListItem,
    StationOption,
    UploadedFile
  } from '../types'
  import { ORGANIZATION_TYPES } from '../types'

  const props = withDefaults(
    defineProps<{
      node?: Partial<EditorNode>
      parentId?: string
      center?: boolean
    }>(),
    { node: () => ({}), parentId: '', center: false }
  )
  const emit = defineEmits<{
    saved: [id: string]
  }>()

  const userStore = useUserStore()
  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const saving = ref(false)
  const railwayOptions = ref<Array<{ label: string; value: string }>>([])
  const stationOptions = ref<StationOption[]>([])
  const selectedStationIds = ref<string[]>([])
  const stationLoading = ref(false)
  const labels = ref<string[]>([])
  const labelInput = ref('')
  const cover = ref<FileInfo | null>(null)
  const images = ref<FileInfo[]>([])
  let stationController: AbortController | null = null
  let stationRequestVersion = 0
  let hydrateVersion = 0

  const form = reactive({
    organizationName: '',
    organizationType: 2,
    address: { address: '', lat: '', lng: '', regionName: '' } as AddressInfo,
    province: '',
    belongRailwayCompany: '',
    areaCompanyId: '',
    areaCompanyName: '',
    responsibleUserId: '',
    responsibleUserName: '',
    responsibleUserPhone: '',
    serviceTime: '',
    isContacted: false,
    remark: '',
    contributor: String(userStore.userInfo?.given_name || ''),
    contributionaTime: formatTime(new Date(), 'yyyy-MM-dd')
  })

  const rules = computed<FormRules>(() => ({
    organizationName: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
    areaCompanyId: [{ required: true, message: '请选择负责区域公司', trigger: 'change' }],
    responsibleUserId: props.center
      ? []
      : [{ required: true, message: '请选择我方负责人', trigger: 'change' }],
    belongRailwayCompany: props.center
      ? [{ required: true, message: '请选择所属路局', trigger: 'change' }]
      : [],
    contributor: [{ required: true, message: '请选择贡献人', trigger: 'change' }],
    contributionaTime: [{ required: true, message: '请选择贡献时间', trigger: 'change' }]
  }))

  const currentNode = computed(
    () => props.node as Partial<OrganizationListItem> & Record<string, any>
  )

  const reset = () => {
    Object.assign(form, {
      organizationName: '',
      organizationType: 2,
      address: { address: '', lat: '', lng: '', regionName: '' },
      province: '',
      belongRailwayCompany: '',
      areaCompanyId: '',
      areaCompanyName: '',
      responsibleUserId: '',
      responsibleUserName: '',
      responsibleUserPhone: '',
      serviceTime: '',
      isContacted: false,
      remark: '',
      contributor: String(userStore.userInfo?.given_name || ''),
      contributionaTime: formatTime(new Date(), 'yyyy-MM-dd')
    })
    selectedStationIds.value = []
    stationOptions.value = []
    labels.value = []
    cover.value = null
    images.value = []
  }

  const toFileInfo = (file: FileInfo): FileInfo => ({
    ...file,
    name: file.name || file.fileName || '图片',
    path: file.path || file.filePath,
    url: resolveFileUrl(file.path || file.filePath || file.url)
  })

  const hydrate = async () => {
    const version = ++hydrateVersion
    reset()
    const id = String(currentNode.value.id || '')
    if (!id) {
      loading.value = false
      return
    }
    loading.value = true
    const [detailResult, labelResult] = await Promise.all([
      getOrganizationDetail(id),
      props.center ? getCenterLabels(id) : Promise.resolve([null, []] as const)
    ])
    if (version !== hydrateVersion) return
    loading.value = false
    const [error, detail] = detailResult
    if (error) return
    const address = parseAddress(detail.organizationAddressDetail)
    Object.assign(form, {
      organizationName:
        detail.organizationName ||
        currentNode.value.name ||
        currentNode.value.organizationName ||
        '',
      organizationType: props.center
        ? 0
        : Number(detail.organizationType ?? currentNode.value.organizationType ?? 2),
      address,
      province: detail.province || '',
      belongRailwayCompany: detail.belongRailwayCompany || '',
      areaCompanyId: detail.ourResponsibleRegionalCompanyId || '',
      areaCompanyName: detail.ourResponsibleRegionalCompanyName || '',
      responsibleUserId: detail.ourResponsibleUserId || '',
      responsibleUserName: detail.ourResponsibleUserName || '',
      responsibleUserPhone: detail.ourResponsibleUserPhone || '',
      serviceTime: detail.serverTime || currentNode.value.serverTime || '',
      isContacted: Boolean(detail.isContacted),
      remark: detail.remark || ''
    })
    const childStations = detail.childStationList || currentNode.value.childStationList || []
    stationOptions.value = childStations.map((item: any) => ({
      id: item.stationId || item.id,
      label: item.stationName || item.name
    }))
    selectedStationIds.value = stationOptions.value.map((item) => item.id)
    if (props.center) {
      const [, centerLabels] = labelResult
      labels.value = (centerLabels || []).map((item) => item.labelName)
      images.value = (detail.otherImgInfoList || []).filter((item) => item.filePath).map(toFileInfo)
      if (detail.firstPageImgUrl) {
        cover.value = toFileInfo({ fileName: '中心封面', filePath: detail.firstPageImgUrl })
      }
    }
  }

  const handleAreaChange = (_id: string, item?: { name?: string }) => {
    form.areaCompanyName = item?.name || ''
  }

  const handleUserChange = (_id: string, item?: { userName?: string; phone?: string }) => {
    form.responsibleUserName = item?.userName || ''
    form.responsibleUserPhone = item?.phone || ''
  }

  const queryStationOptions = async (keyword: string) => {
    const version = ++stationRequestVersion
    stationController?.abort()
    if (!keyword.trim()) {
      stationLoading.value = false
      return
    }
    stationController = new AbortController()
    stationLoading.value = true
    const [error, result] = await queryStations(
      { page: 1, limit: 2000, isHyStation: true, railwayStationName: keyword.trim() },
      { signal: stationController.signal }
    )
    if (version !== stationRequestVersion) return
    stationLoading.value = false
    if (error) return
    const options = (result.items || []).map((item) => ({
      id: item.id,
      label: item.railwayStationName
    }))
    stationOptions.value = [
      ...stationOptions.value,
      ...options.filter((item) => !stationOptions.value.some((current) => current.id === item.id))
    ]
  }

  const addLabel = () => {
    const value = labelInput.value.trim()
    if (value && !labels.value.includes(value)) labels.value.push(value)
    labelInput.value = ''
  }

  const uploadedFileInfo = (file: UploadedFile): FileInfo => ({
    fileName: file.name,
    filePath: file.path,
    fileSize: file.size,
    fileType: file.type || null,
    name: file.name,
    path: file.path,
    url: resolveFileUrl(file.path),
    uid: file.uid
  })

  const handleCoverUpload = (value: UploadedFile) => {
    cover.value = uploadedFileInfo(value)
  }

  const handleImageUpload = (value: UploadedFile) => {
    if (!value.path || images.value.some((image) => (image.path || image.filePath) === value.path))
      return
    images.value.push(uploadedFileInfo(value))
  }

  const serializeAddress = () => (form.address.address ? JSON.stringify(form.address) : null)

  const save = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (valid === false) return
    saving.value = true
    let id = String(currentNode.value.id || '')
    if (props.center) {
      const payload: CenterFormPayload = {
        id,
        organizationName: form.organizationName,
        organizationAddressDetail: serializeAddress(),
        ourResponsibleRegionalCompanyId: form.areaCompanyId,
        ourResponsibleRegionalCompanyName: form.areaCompanyName,
        belongRailwayCompany: form.belongRailwayCompany,
        province: form.province,
        remark: form.remark,
        organizationType: 0,
        contributor: form.contributor,
        contributionaTime: form.contributionaTime,
        firstPageImgUrl: cover.value
          ? resolveFileUrl(cover.value.path || cover.value.filePath || cover.value.url)
          : '',
        otherImgInfoList: images.value.map((item) => ({
          fileName: item.fileName || item.name,
          filePath: item.filePath || item.path || '',
          fileSize: item.fileSize,
          fileType: item.fileType
        }))
      }
      if (form.responsibleUserId) {
        payload.ourResponsibleUserId = form.responsibleUserId
        payload.ourResponsibleUserName = form.responsibleUserName
        payload.ourResponsibleUserPhone = form.responsibleUserPhone
      }
      const [updateError, updated] = await updateOrganization(payload)
      if (updateError || !updated) {
        saving.value = false
        return
      }
      const [labelError, labelsSaved] = await saveCenterLabels(id, labels.value)
      saving.value = false
      if (labelError || !labelsSaved) return
    } else {
      const payload: OrganizationFormPayload = {
        ...(id ? { id } : {}),
        ...(!id && props.parentId ? { parentOrganizationId: props.parentId } : {}),
        organizationType: form.organizationType,
        organizationName: form.organizationName,
        organizationAddressDetail: serializeAddress(),
        ourResponsibleRegionalCompanyId: form.areaCompanyId,
        ourResponsibleRegionalCompanyName: form.areaCompanyName,
        ourResponsibleUserId: form.responsibleUserId,
        ourResponsibleUserName: form.responsibleUserName,
        ourResponsibleUserPhone: form.responsibleUserPhone,
        province: form.province,
        remark: form.remark,
        serverTime: form.serviceTime,
        contributor: form.contributor,
        contributionaTime: form.contributionaTime,
        isContacted: form.isContacted
      }
      if (id) {
        const [updateError, updated] = await updateOrganization(payload)
        if (updateError || !updated) {
          saving.value = false
          return
        }
      } else {
        const [createError, createdId] = await createOrganization(payload)
        if (createError || !createdId) {
          saving.value = false
          return
        }
        id = createdId
      }
      const selected = selectedStationIds.value.map((stationId) => {
        const station = stationOptions.value.find((item) => item.id === stationId)
        return { stationId, stationName: station?.label || '' }
      })
      const [stationError, stationsSaved] = await saveOrganizationStations({
        centerOrganizationId: id,
        stationList: selected
      })
      saving.value = false
      if (stationError || !stationsSaved) return
    }
    ElMessage.success('保存成功')
    emit('saved', id)
  }

  watch(() => props.node, hydrate, { deep: true, immediate: true })
  watch(
    () => form.address,
    (address) => {
      const region = address.regionName || ''
      form.province = region.split(/[,-]/).filter(Boolean)[0] || form.province
    },
    { deep: true }
  )
  onBeforeUnmount(() => {
    hydrateVersion += 1
    stationRequestVersion += 1
    stationController?.abort()
  })
  onMounted(async () => {
    try {
      railwayOptions.value = (await getSystemDataShow('RailwayBureauSelect', '')) || []
    } catch {
      railwayOptions.value = []
    }
  })

  defineExpose({ save })
</script>

<template>
  <div v-loading="loading">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="112px" label-suffix="：">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item :label="center ? '中心名称' : '机构名称'" prop="organizationName">
            <el-input v-model="form.organizationName" placeholder="请输入机构名称" />
          </el-form-item>
        </el-col>
        <el-col v-if="!center" :span="12">
          <el-form-item label="机构类型" prop="organizationType">
            <el-select v-model="form.organizationType" style="width: 100%">
              <el-option
                v-for="item in ORGANIZATION_TYPES.filter((item) => item.id !== 0)"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="所在地址">
            <DcMapSelect v-model:value="form.address" title="选择机构地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="我方负责人" prop="responsibleUserId">
            <DcOrgUserSelect
              v-model="form.responsibleUserId"
              :show-tree="false"
              placeholder="请选择我方负责人"
              @change="handleUserChange"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="center" :span="12">
          <el-form-item label="所属路局" prop="belongRailwayCompany">
            <el-select v-model="form.belongRailwayCompany" filterable clearable style="width: 100%">
              <el-option
                v-for="item in railwayOptions"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="区域公司" prop="areaCompanyId">
            <DcAreaCompanySelect
              v-model="form.areaCompanyId"
              v-model:label="form.areaCompanyName"
              :is-access-control="false"
              :include-group="false"
              placeholder="请选择负责区域公司"
              @change="handleAreaChange"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="!center" :span="12">
          <el-form-item label="服务时间">
            <el-input v-model="form.serviceTime" placeholder="请输入服务时间" />
          </el-form-item>
        </el-col>
        <el-col v-if="!center" :span="24">
          <el-form-item label="下辖站点">
            <el-select
              v-model="selectedStationIds"
              multiple
              filterable
              remote
              reserve-keyword
              :remote-method="queryStationOptions"
              :loading="stationLoading"
              placeholder="请输入站点关键字"
              style="width: 100%"
            >
              <el-option
                v-for="item in stationOptions"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="!center" :span="24">
          <el-form-item label="联系状态">
            <el-switch v-model="form.isContacted" active-text="已联系" inactive-text="未联系" />
          </el-form-item>
        </el-col>
        <el-col v-if="center" :span="24">
          <el-form-item label="业务标签">
            <div class="label-editor">
              <el-tag
                v-for="label in labels"
                :key="label"
                closable
                type="success"
                @close="labels = labels.filter((item) => item !== label)"
              >
                {{ label }}
              </el-tag>
              <el-input v-model="labelInput" placeholder="输入标签后回车" @keyup.enter="addLabel" />
              <el-button type="primary" plain @click="addLabel">添加</el-button>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col v-if="center" :span="24">
          <el-form-item label="中心封面">
            <div class="image-editor">
              <div v-if="cover" class="current-cover">
                <el-image :src="cover.url" fit="cover" :preview-src-list="[cover.url || '']" />
                <el-button link type="danger" @click="cover = null">删除</el-button>
              </div>
              <CenterImageUpload v-else label="上传中心封面" @success="handleCoverUpload" />
            </div>
          </el-form-item>
        </el-col>
        <el-col v-if="center" :span="24">
          <el-form-item label="中心图片">
            <div class="image-list-editor">
              <CenterImageUpload label="上传中心图片" @success="handleImageUpload" />
              <div
                v-for="(image, index) in images"
                :key="image.path || image.filePath"
                class="image-item"
              >
                <el-image
                  :src="image.url"
                  fit="cover"
                  :preview-src-list="images.map((item) => item.url || '')"
                />
                <el-button link type="danger" @click="images.splice(index, 1)">删除</el-button>
              </div>
            </div>
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
    <div class="form-actions">
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </div>
  </div>
</template>

<style scoped lang="less">
  .label-editor {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .label-editor :deep(.el-input) {
    width: 220px;
  }

  .current-cover {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .current-cover :deep(.el-image) {
    width: 110px;
    height: 110px;
    border-radius: 5px;
  }

  .image-list-editor {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 12px;
  }

  .image-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .image-item :deep(.el-image) {
    width: 100px;
    height: 100px;
    border-radius: 5px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
  }
</style>
