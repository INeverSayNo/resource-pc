<template>
  <el-upload
    class="upload-demo"
    :headers="header"
    :action="action"
    :before-upload="handleChange"
    :before-remove="handleBeforRemove"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
    :on-error="handleError"
    :show-file-list="isShowList"
    :file-list="
      fileList.map((it) => {
        return { ...it, name: it.fileRealName };
      })
    "
    v-bind="$attrs"
  >
    <el-button v-if="isSpan===false"  type="primary">
      {{buttonName}}
    </el-button>
    <span v-if="isSpan===true"  type="primary">
      <DAliIcon name="upload" class="" />
      {{buttonName}}
    </span>
    <template #tip>
      <div class="el-upload__tip">
        {{ description }}
      </div>
    </template>
  </el-upload>
</template>

<script lang="ts">
import {
  computed,
  getCurrentInstance,
  nextTick,
  PropType,
  ref
} from 'vue'
import { ElLoading, ElMessageBox } from "element-plus";
import { Message } from "@/components/Message";
import { DcDeep } from '@dczy/tie-tools';
export interface FileAttach {
  id?: string;
  fileRealName?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  creationDate?: string;
}
export interface FileResponse {
  creationDate?: Date;
  isFolder?: boolean;
  lastModifiedDate?: Date;
  name?: string;
  path?: string;
  size?: number;
}
export default {
  name: "DcUploadAttach",
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
    buttonName: {
      type: String,
      default: () => "选择并上传"
    },
    isShowList: {
      type: Boolean,
      default: () => true
    },
    isSpan: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ["update:modelValue"],
  setup(props: any, _ctx: any) {
    const { proxy }: any = getCurrentInstance();
    const fileList = computed({
      get: () => props.modelValue,
      set: (val) => {
        _ctx.emit("update:modelValue", val);
        nextTick(() => {
          proxy.$forceUpdate();
        });
      }
    });
    const token = localStorage.getItem("JsToken") || "";
    const header = { Authorization: "bearer " + token };
    const loading = ref<any>(null);

    const handleChange = () => {
      loading.value = ElLoading.service({
        lock: true,
        text: "文件上传中",
        background: "rgba(0, 0, 0, 0.7)"
      });
    };

    const handleSuccess = (response: FileResponse, file: any) => {
      loading.value?.close();
      console.log(fileList.value);
      const oldFile: FileAttach[] = DcDeep.clone(fileList.value);
      if (file && response) {
        if (!oldFile.some((it) => it.filePath === response.path)) {
          oldFile.push({
            fileRealName: file.name || "",
            fileName: response.name,
            filePath: response.path,
            fileSize: response.size,
            fileType: GetFileExtension(response.name || "")
          });
          fileList.value = oldFile;
        }
      }
    };
    const handleError = () => {
      Message.warning("上传失败");
      loading.value?.close();
    };

    const GetFileExtension = (fileName: string) => {
      if (fileName) {
        return fileName.substring(fileName.lastIndexOf("."), fileName.length);
      }
      return "未知";
    };

    const handleBeforRemove = () => {
      return ElMessageBox.confirm("是否删除选中文件信息？", "提示信息", {
        type: "warning"
      });
    };
    const handleRemove = (file: FileAttach) => {
      const oldFile: FileAttach[] = DcDeep.clone(fileList.value);
      const index = oldFile.findIndex((it) => it.filePath === file.filePath);
      if (index !== -1) {
        oldFile.splice(index, 1);
      }
      fileList.value = oldFile;
    };
    return {
      fileList,
      header,
      handleChange,
      handleBeforRemove,
      handleSuccess,
      handleError,
      handleRemove
    };
  }
};
</script>
