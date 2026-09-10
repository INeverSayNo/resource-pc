<template>
  <com-dialog
    :show-fullscreen="false"
    :model-value="visable"
    :width="width"
    :title="title"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    custom-class="upload-dialog"
    @close="handleClose"
  >
    <el-upload
      class="upload-demo"
      drag
      :limit="1"
      multiple="false"
      :accept="accept"
      :headers="headers"
      :before-upload="beforeUpload"
      :before-remove="beforeRemove"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :action="`${FILE_URL}/${encodeURIComponent(actionMethod)}`"
    >
      <DAliIcon name="upload" class="" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip">
          <p> 只能上传 {{ acceptStr }} 文件，且不超过 20Mb</p>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <slot name="otherButton"></slot>
        <el-button
          type="primary"
          :loading="loadding || innerLoading"
          :disabled="!uploadFileData?.FilePath"
          @click="handleImprot"
          >确定导入</el-button
        >
      </span>
    </template>
  </com-dialog>
</template>

<script lang="ts">
  import { reactive, toRefs, unref, ref, watch, defineComponent } from 'vue'
  import { Message } from '@/components/Message'
  import { ElMessageBox } from 'element-plus'
  import { FILE_URL } from '@/request'
import { DcDeep } from '@dczy/tie-tools';
  export default defineComponent({
    name: 'ImportExcel',
    props: {
      width: { type: String, default: () => '400px' },
      title: { type: String, default: () => '数据导入' },
      visable: { type: Boolean, default: () => false },
      actionMethod: { type: String, default: () => '?folder=transport' },
      accept: {
        type: String,
        default: () =>
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
      },
      acceptStr: {
        type: String,
        default: () => 'xls,xslx'
      },
      loadding: {
        type: Boolean,
        default: () => false
      }
    },
    emits: ['update:visable', 'submit'],
    setup(props, { emit }) {
      const token = localStorage.getItem('JsToken') || ''
      const state = reactive({
        uploadFileData: {},
        headers: { Authorization: 'bearer ' + token }
      })
      const uploadFileList = ref([])
      // 内部 loading：未通过 loadding prop 外部控制时，点击导入自动进入 loading
      const innerLoading = ref(false)
      const handleClose = () => {
        emit('update:visable', false)
      }
      const handleImprot = () => {
        if (!props.loadding) {
          innerLoading.value = true
        }
        emit('submit', state.uploadFileData, unref(uploadFileList))
      }
      // 弹窗关闭后复位内部 loading
      watch(
        () => props.visable,
        (val) => {
          if (!val) {
            innerLoading.value = false
          }
        }
      )
      const beforeUpload = (file) => {
        const accepts = props.accept.split(',')
        const isXls = accepts.some((it) => it === file.type)
        // file.type ===
        //   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        // "application/vnd.ms-excel";
        const isLt20M = file.size / 1024 / 1024 < 20
        if (!isXls) {
          Message.error(`只能上传${props.acceptStr}文件!`)
          return isXls
        }
        if (!isLt20M) {
          Message.error('文件不能超过 20MB!')
          return isLt20M
        }
        return isXls && isLt20M
      }
      const beforeRemove = async (file) => {
        let isRemove = false
        await ElMessageBox.confirm(`是否移除${file.name}文件？`).then(() => (isRemove = true))
        return isRemove
      }
      const handleUploadSuccess = (response, file, fileList) => {
        if (response.name) {
          var fileAttact = {
            FileRealName: response.name,
            FileName: response.name,
            FilePath: response.path,
            FileSize: response.size,
            FileType: GetFileExtension(response.name)
          }
          uploadFileList.value = fileList
          state.uploadFileData = DcDeep.clone(fileAttact)
        }
      }
      const handleUploadError = (err) => {
        Message.error('上传文件失败')
        console.log(err)
      }
      const handleRemove = (file, fileList) => {
        if (!fileList || fileList.length === 0) {
          state.uploadFileData = {}
        }
      }
      const GetFileExtension = (fileName) => {
        if (fileName) {
          return fileName.substring(fileName.lastIndexOf('.'), fileName.length)
        }
        return '未知'
      }
      return {
        ...toRefs(state),
        FILE_URL,
        innerLoading,
        handleClose,
        handleImprot,
        beforeUpload,
        beforeRemove,
        handleUploadSuccess,
        handleUploadError,
        handleRemove
      }
    }
  })
</script>
<style lang="less" scoped>
  .upload-demo {
    :deep(.el-upload) {
      width: 100%;
      .el-upload-dragger {
        width: 100%;
      }
    }
  }
</style>
