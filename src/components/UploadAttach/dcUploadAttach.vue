<template>
  <el-upload
    ref="uploadRef"
    class="upload-demo"
    :headers="header"
    :action="action"
    :before-upload="handleChange"
    :before-remove="handleBeforRemove"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
    :on-error="handleError"
    v-bind="$attrs"
    :file-list="fileList"
    :on-preview="handlePreview"
  >
    <el-button type="primary">选择并上传</el-button>
    <template #tip>
      <div class="el-upload__tip">
        {{ description }}
      </div>
    </template>
    <template v-if="!$slots.file" #file="{ file }">
      <div v-show="file.name" class="file-list" :class="file.status">
        <span class="cu-pointer" @click="handlePreview(file)">
          {{ file.name }}
        </span>
        <p class="file-item-operate">
          <template v-if="file.status === 'success' && isPreview">
          <span
            class="file-list-bar preview file-item-operate-preview"
            title="预览/下载"
            @click="handlePreview(file)"
          >
            <DLegacyIcon name="view" class="" />
          </span>
        </template>
          <DLegacyIcon name="close" class=" file-item-operate-delete"  @click="handleRemoveFile(file)" />
        </p>
      </div>
    </template>
  </el-upload>
</template>

<script lang="ts">
import { PropType, ref } from "vue";
import { defineComponent, watch } from "vue";
import { ElLoading, ElMessageBox } from "element-plus";
import { fileView } from "@/utils/fileView";
import { deepClone } from "@/utils";
import {
  GETFILE_URL,
  SYSTEM_BASE_DATA_URL
} from "@/request";
import { Message } from "../Message";

type FileAttach = any;
type FileResponse = any;
export default defineComponent({
  name: "DcUploadAttachs",
  props: {
    action: {
      type: String,
      default: () => "",
      required: true
    },
    description: {
      type: String,
      default: () => "请选择需要上传的附件"
    },
    modelValue: {
      type: Array as PropType<Array<FileAttach>>,
      default: () => {
        return [];
      }
    },
    isPreview: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    maxSize: { type: Number, default: () => 100 } // 文件大小
  },
  emits: ["update:modelValue", "preview"],
  setup(props: any, _ctx: any) {
    // const { proxy }: any = getCurrentInstance()
    const uploadRef = ref();
    const fileList = ref([]);
    let oldFile: Array<FileAttach> = [];
    watch(
      () => props.modelValue,
      (val: any) => {
        if (val?.length) {
          oldFile = val.map((e: any) => {
            return {
              ...e,
              name: e.fileRealName,
              url: `${GETFILE_URL}${e.filePath}`
            };
          });
          fileList.value = deepClone(oldFile);
        }
      }
    );
    const token = localStorage.getItem("JsToken") || "";
    const header = { Authorization: `bearer ${token}` };
    const loading = ref<any>(null);

    const handleChange = (file: any) => {
      const isLt10M = file.size / 1024 / 1024 < props.maxSize;
      if (!isLt10M) {
        Message.error(`文件不能超过 ${props.maxSize}MB!`);
        return isLt10M;
      }
      loading.value = ElLoading.service({
        lock: true,
        text: "文件上传中~",
        background: "rgba(0, 0, 0, 0.7)",
        customClass: "max-zindex-loading"
      });
      return true;
    };

    const handleRemoveFile = (file) => {
      uploadRef.value?.handleRemove(file);
    };

    const handleSuccess = (response: FileResponse, file: any) => {
      loading.value?.close();
      if (file && response) {
        if (oldFile.every((it: any) => it.filePath !== response.path)) {
          oldFile.push({
            fileRealName: file.name || "",
            fileName: response.name,
            filePath: response.path,
            fileSize: response.size,
            fileType: GetFileExtension(file.name || "")
          });
        }
        fileList.value = (oldFile as any).map((e: any) => {
          return {
            ...e,
            name: e.fileRealName,
            url: `${SYSTEM_BASE_DATA_URL}${e.filePath}`
          };
        });
        _ctx.emit("update:modelValue", oldFile);
      }
    };
    const handleError = () => {
      //   DcMessage.warning('上传失败')
      loading.value?.close();
    };

    const GetFileExtension = (fileName: string) => {
      if (fileName) {
        return fileName.substring(fileName.lastIndexOf("."), fileName.length);
      }
      return "未知";
    };

    const handleBeforRemove = (file, files): any => {
      if (file.status === "ready") {
        return true;
      }
      return ElMessageBox.confirm("是否删除选中文件信息？", "提示信息", {
        type: "warning"
      });
    };
    const handleRemove = (file: FileAttach) => {
      const path = file?.filePath ?? file.response.path;
      const index = oldFile.findIndex((it) => it.filePath === path);
      if (index !== -1) {
        oldFile.splice(index, 1);
      }
      _ctx.emit("update:modelValue", oldFile);
    };
    const handlePreview = (file: any) => {
      if (!props.isPreview) return;
      const url = file?.url ?? file.response.path;
      const fileName = file?.fileRealName ?? file.response.name;
      const prevewUrl = url.endsWith(".")
        ? `${url.substring(0, url.length - 1)}${file.fileType}`
        : url;
      fileView(prevewUrl, fileName);
      _ctx.emit("preview", file);
    };
    return {
      fileList,
      header,
      uploadRef,
      handleChange,
      handleBeforRemove,
      handleSuccess,
      handleError,
      handleRemove,
      handlePreview,
      handleRemoveFile
    };
  }
});
</script>

<style>
.max-zindex-loading {
  z-index: 9999 !important;
}
</style>
<style lang="less" scoped>
.file-list {
  display: flex;
    align-items: center;
    justify-content: space-between;
  &.success {
    color: #67c23a;
    background-color: transparent !important;
  }
  .el-icon {
    float: right;
    top: 7px;
    &.icon {
      // display: none;
      color: #f56c6c;
    }
  }
  &:hover {
    .el-icon {
      display: inline-flex;
      cursor: pointer;
    }
  }
  .file-list-bar {
    float: right;
    margin-left: 5px;
    text-decoration: underline;
    cursor: pointer;
    &.preview {
      color: #409eff;
    }
    &.download {
      color: #333;
    }
  }
}
.file-item-operate{
  display: flex;
    align-items: flex-start;
    &-preview{
      margin-right: 20px;
    }
    &-delete{
      position: relative !important;
      height: 25px;
    display: inline-block;
    line-height: 18px;
    }
}
</style>
