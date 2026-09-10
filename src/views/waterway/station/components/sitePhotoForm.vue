<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    :title="title"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="showDetails = false"
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
        <el-col :span="24">
          <el-form-item label="照片类型" prop="visitBusinessType">
            <el-radio-group v-model="edit.visitBusinessType" @change="typeChange">
              <el-radio label="码头" />
              <!-- <el-radio label="作业区" /> -->
              <el-radio label="装卸设备" />
              <el-radio label="其他" />
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col v-if="edit.visitBusinessType === '码头'" :span="12">
          <el-form-item label="码头" prop="businessObjId">
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
            <el-link
              type="primary"
              style="float: right"
              href="javascript:0"
              @click="showEdit = !showEdit"
              >添加码头...</el-link
            >
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item>
        <el-upload
          class="upload-file"
          :action="fileurl"
          :headers="uploadHeaders"
          name="File"
          :data="{ data: 'WatenwayStationImg' }"
          :on-preview="handlePreview"
          :on-success="handAttachmentUploadSuccess"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          :before-upload="beforeUpload"
          :on-error="uploaderror"
          :limit="1"
          multiple
          accept=".jpg,.png,.jpeg"
          :on-exceed="handleExceed"
          :file-list="operationAreaFileList"
          list-type="picture-card"
        >
          <DAliIcon name="plus" />
          {{ edit.visitBusinessType }}
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showDetails = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave"> 保存 </el-button>
    </template>
  </com-dialog>
  <WharfEditForm v-model="showEdit" :station-id="stationId" @success="getWharf" />
</template>

<script lang="ts">
  import { Message } from '@/components/Message'
  import { DcCommon } from '@dczy/tie-tools'
  import { computed, ref, defineComponent } from 'vue'
  import { useStatisticTrace } from '@/hooks/useStatisticTrace'
  import { ElMessageBox } from 'element-plus'
  import { useAnalyticsTrack } from '@/plugins/monitor'
  import { GETFILE_URL, FILE_URL } from '@/request'
  import { createImages, listWharfs } from '@/api/waterway-port'
  import { getAccessToken } from '@/auth/bridge'
  import WharfEditForm from './wharfForm.vue'

  export default defineComponent({
    components: {
      WharfEditForm
    },

    props: {
      modelValue: {
        type: Boolean as any,
        default: () => false
      },
      title: {
        type: String,
        default: () => '新增港口照片'
      },
      stationId: {
        type: String,
        default: () => ''
      },
      wharfData: {
        type: Array as any,
        default: () => [] as any
      }
    },
    emits: ['update:modelValue', 'success'],
    setup(props, { emit }) {
      const showEdit = ref(false)
      const { businessOperationStart, businessOperationEnd } = useAnalyticsTrack()
      const { SetTrace } = useStatisticTrace()
      const edit = ref<any>({
        visitBusinessType: '',
        businessObjId: '',
        typeMark: '',
        typeName: ''
      })
      const showDetails = computed({
        get: () => props.modelValue,
        set: (val) => {
          emit('update:modelValue', val)
        }
      })
      const wharf = ref(props.wharfData)
      const fileurl = FILE_URL + '/WatenwayStationImg'
      const uploadHeaders = computed(() => ({ Authorization: `bearer ${getAccessToken()}` }))
      const formRef = ref()
      const loading = ref(false)
      const stationId = computed(() => props.stationId)

      const fileAllList = ref<any>([]) // 全部上传的图片
      const operationAreaFileList = ref<any>([]) // 图片
      const railwayFreightYardFileData = ref<any>([]) // 图片

      function handlePlChange(val) {
        if (edit.value.visitBusinessType === '码头') {
          const item = wharf.value.find((x) => x.id === val)
          edit.value.typeName = item?.wharfName
          edit.value.typeMark = item?.id
        }
      }
      async function getWharf() {
        const [error, data] = await listWharfs(props.stationId)
        if (!error) wharf.value = data
      }
      function typeChange() {
        edit.value.businessObjId = ''
        if (edit.value.visitBusinessType === '码头') {
          if (wharf.value.length > 0) {
            edit.value.businessObjId = wharf.value[0].id
            edit.value.typeMark = wharf.value[0].id
            edit.value.typeName = wharf.value[0].wharfName
          }
        } else if (edit.value.visitBusinessType === '装卸设备') {
          edit.value.typeMark = 'handlingEquipment'
          edit.value.typeName = '装卸设备'
        } else {
          edit.value.typeMark = 'other'
          edit.value.typeName = '其他'
        }
      }

      // #region 上传图片
      // 文件列表移除文件时的钩子
      const handleRemove = (file: any, fileList: any) => {
        operationAreaFileList.value = fileList
        const index = fileAllList.value?.findIndex((item) => item.fileRealName === file.name)
        if (index !== -1) {
          fileAllList.value?.splice(index, 1)
        }
      }
      // 点击文件列表中已上传的文件时的钩子
      const handlePreview = (file: any) => {
        if ('jpg,png,jpeg'.includes(file.fileType)) {
          const url = GETFILE_URL + '/resource/' + file.fileUrl
          window.open(url)
        } else {
          Message.warning('文件不支持预览')
        }
      }
      // 文件上传成功
      const handAttachmentUploadSuccess = async (response: any, file: any) => {
        railwayFreightYardFileData.value.push({
          name: file.name,
          fileName: file.name,
          fileDir: GETFILE_URL + response.path,
          fileUrl: response.name,
          fileSize: response.size,
          fileType: file.name.substring(file.name.lastIndexOf('.') + 1),
          url: GETFILE_URL + response.path
        })
        const ImageFile = {
          id: DcCommon.guid(),
          fileGroupMark: 'WatenwayStationImg',
          fileGroupName: '港口图片',
          fileRealName: file.name,
          fileName: response.name,
          filePath: response.path,
          fileSize: response.size,
          fileType: file.name.substring(file.name.lastIndexOf('.') + 1),
          businessId: props.stationId,
          creationDate: new Date().toISOString()
        }
        fileAllList.value.push(ImageFile)
        loading.value = false
      }
      const uploaderror = () => {
        loading.value = false
        Message.error('上传到文件系统失败，请联系管理员！')
      }
      // 文件超出个数限制时的钩子
      const handleExceed = (files: any, fileList: any) => {
        const filecount = files.length + fileList.length
        if (filecount > 1) {
          Message.warning(`超过限制约束，最多上传 1 个文件`)
        }
      }
      // 删除文件之前的钩子
      const beforeRemove = async (file: any) => {
        try {
          await ElMessageBox.confirm(`确定移除${file.name}？`, '提示信息')
          return true
        } catch {
          return false
        }
      }
      // 上传文件之前的钩子
      const beforeUpload = async (file: any) => {
        const fileSuffix = file.name.substring(file.name.lastIndexOf('.') + 1)
        const whiteList = ['jpg', 'png', 'jpeg']
        if (whiteList.indexOf(fileSuffix) === -1) {
          Message.error('上传文件只能是 jpg、png、jpeg 格式')
          return false
        }
        const isLt10M = file.size / 1024 / 1024 < 10
        if (!isLt10M) {
          Message.error('上传文件大小不能超过 10MB')
          return false
        }
        loading.value = true
      }
      // #endregion

      function handleSave() {
        if (!fileAllList.value.length) {
          Message.warning('请先上传港口照片')
          return
        }
        businessOperationEnd({
          dataId: props.stationId,
          module: '水运港口',
          page_title: '新增港口照片'
        })
        formRef.value?.validate(async (valid: boolean) => {
          if (valid) {
            loading.value = true
            const par = {
              stationId: stationId.value,
              typeMark: edit.value.typeMark,
              typeName: edit.value.typeName,
              listImageFile: fileAllList.value,
              id: DcCommon.guid()
            }
            const [error, success] = await createImages(par)
            loading.value = false
            if (!error && success) {
              Message.success('上传成功!')
              SetTrace('$INSERT', '水运港口', '港口照片')
              SetTrace('$UPDATE', '水运港口', '港口照片', stationId.value)
              emit('success')
              showDetails.value = false
            }
          } else {
            Message.warning('请完整的填写表单信息')
          }
        })
      }
      function handleOpen() {
        edit.value = {
          visitBusinessType: '',
          businessObjId: '',
          typeMark: '',
          typeName: ''
        }
        operationAreaFileList.value = []
        fileAllList.value = []
        railwayFreightYardFileData.value = []
        wharf.value = props.wharfData
        businessOperationStart()
      }
      const rules = {
        visitBusinessType: [{ required: true, message: '请选择照片类型', trigger: 'blur' }],
        businessObjId: [{ required: true, message: '请选择码头', trigger: 'blur' }]
      }
      return {
        //...toRefs(state),
        showDetails,
        handleOpen,
        handleSave,
        edit,
        typeChange,
        rules,
        getWharf,
        handlePlChange,
        formRef,
        wharf,
        showEdit,
        fileurl,
        uploadHeaders,
        handlePreview,
        handAttachmentUploadSuccess,
        handleRemove,
        beforeRemove,
        beforeUpload,
        uploaderror,
        handleExceed,
        operationAreaFileList,
        loading
      }
    }
  })
</script>

<style lang="less" scoped></style>
