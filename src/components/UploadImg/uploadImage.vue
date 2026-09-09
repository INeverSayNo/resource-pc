<template>
  <el-upload
    ref="fileUpload"
    :class="{ disabled: uploadDisabled }"
    :action="action"
    :headers="headers"
    :method="method"
    :multiple="multiple"
    :show-file-list="showfilelist"
    :drag="drag"
    :accept="accept"
    :thumbnail-mode="thumbnailMode"
    :file-list="items"
    :list-type="listType"
    :auto-upload="autoUpload"
    :disabled="disabled"
    :limit="limit"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-progress="handleProgress"
    :on-change="handleChange"
    :before-upload="beforeUpload"
    :before-remove="beforeRemove"
    :on-exceed="handleExceed"
  >
    <template #default>
      <DLegacyIcon name="plus" class=""  />
    </template>
    <template #file="{ file }">
      <div>
        <img
          v-if="checkPreview(file)"
          class="el-upload-list__item-thumbnail"
          :src="file.url"
          alt=""
        />
        <span v-else>{{ file.name }}</span>
        <span class="el-upload-list__item-actions">
          <span
            v-if="checkPreview(file)"
            class="el-upload-list__item-preview"
            @click="handlePreview(file)"
          >
            <DLegacyIcon name="zoom-in" class=""  />
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="handleDownload(file)"
          >
            <DLegacyIcon name="download" class=""  />
          </span>
          <span
            v-if="!disabled"
            class="el-upload-list__item-delete"
            @click="handleRemove(file, [])"
          >
            <DLegacyIcon name="delete" class=""  />
          </span>
        </span>
      </div>
    </template>
  </el-upload>
</template>

<script lang="ts">
import { reactive, ref, toRefs, watch, onMounted } from "vue";
import { FILE_URL, GETFILE_URL, Download } from "@/request";
import { createImgPreview } from "@/components/Preview";
import { ElLoading, ElMessageBox } from "element-plus";
import { Message } from "@/components/Message";
const imgTypes = [
  ".xbm",
  ".tif",
  ".pjp",
  ".svgz",
  ".jpg",
  ".jpeg",
  ".ico",
  ".tiff",
  ".gif",
  ".svg",
  ".jfif",
  ".webp",
  ".png",
  ".bmp",
  ".pjpeg",
  ".avif"
];
export default {
  props: {
    method: { type: String, default: () => "post" }, // 设置上传请求方法	string	post/put/patch
    multiple: { type: Boolean, default: () => false }, // 是否支持多选文件
    // data: { type: Object, default: () => {} }, // 上传时附带的额外参数
    // name: { type: String, default: () => "file" }, // 上传的文件字段名
    showfilelist: { type: Boolean, default: () => true }, //	是否显示已上传文件列表
    drag: { type: Boolean, default: () => false }, //	是否启用拖拽上传
    accept: { type: String, default: () => imgTypes.toString() }, // 接受上传的文件类型
    thumbnailMode: { type: Boolean, default: () => false }, // 是否显示缩略图
    fileList: { type: Array, default: () => [] }, // 上传的文件列表，例如：[{name: 'food.jpg', url: '
    listType: { type: String, default: () => "picture-card" }, // 文件列表的类型	text/picture/picture-card
    autoUpload: { type: Boolean, default: () => true }, // 是否自动上传文件
    disabled: { type: Boolean, default: () => false }, // 是否禁用
    limit: { type: Number, default: () => 1 }, // 允许上传的最大数量

    folder: { type: String, default: () => "common" }, // 上传地址
    tipText: { type: String, default: () => "图片文件" }, //
    maxSize: { type: Number, default: () => 10 } // 文件大小
  },
  emits: ["update:modelValue", "success", "remove"],
  setup(props: any, ctx: any) {
    const state = reactive({
      action: `${FILE_URL}/${props.folder}`, // 必选参数，上传的地址
      headers: {}, // 设置上传的请求头部
      items: [] as any, // 文件数据
      uploadDisabled: false
    });

    const fileUpload = ref<any>(null);
    const token = localStorage.getItem("JsToken") || "";
    state.headers = { Authorization: "bearer " + token };

    // 点击文件列表中已上传的文件时的钩子
    const handlePreview = (file: any) => {
      let url = file.path ? file.path : file.response.path;

      if (!url.toLowerCase().startsWith("http")) {
        url = `${GETFILE_URL}${url}`;
      }

      createImgPreview({
        imageList: [url],
        show: true,
        index: 0,
        zIndex: 9999,
        style: null
      });
    };

    //	文件列表移除文件时的钩子
    const handleRemove = (file: any, fileList: any) => {
      console.log("handleRemove");
      return ElMessageBox.confirm(`是否移除${file.name}文件？`).then(() => {
        fileUpload.value.handleRemove(file);
        ctx.emit("remove", file);
        const index = state.items.findIndex((it: any) => it.uid === file.uid);
        if (index !== -1) {
          state.items.splice(index, 1);
          const data = props.limit && props.limit === 1 ? {} : state.items;
          ctx.emit("update:modelValue", data);
        }
      });
    };

    // 文件上传成功时的钩子
    const handleSuccess = (response: any, file: any, fileList: any) => {
      console.log(response, file);
      
      const item = {
        uid: file.uid,
        url: file.url,
        name: file.name,
        fullname: response.name,
        path: response.path,
        size: file.size,
        type: file.raw.type || "image/jpeg",
        date: response.creationDate,
        // 以下是资源系统附件中心保存的字段
        FileRealName: file.name,
        FileName: response.name,
        FilePath: response.path,
        FileSize: file.size,
        FileType: file.raw.type || "image/jpeg",
        CreationDate: response.creationDate
      };
      const data = props.limit && props.limit === 1 ? item : state.items;
      console.log(data);
      
      ctx.emit("update:modelValue", data);
      ctx.emit("success", data);
    };

    // 文件上传失败时的钩子
    const handleError = (err: any, file: any, fileList: any) => {
      Message.error("上传文件失败");
      console.log(err);
    };

    // 文件上传时的钩子
    const handleProgress = (event: any, file: any, fileList: any) => {};

    let loading: any;
    // 文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
    const handleChange = (file: any, fileList: any) => {
      if (file?.status === "ready") {
        loading = ElLoading.service({
          text: "图片上传中...",
          background: "#000000ae",
          customClass: "my-loading"
        });
      } else {
        loading?.close();
      }
      if (props.limit && props.limit === 1 && fileList.length >= 1) {
        state.uploadDisabled = true;
      } else {
        state.uploadDisabled = false;
      }
    };

    // 上传文件之前的钩子，参数为上传的文件。 若返回 false 或者返回 Promise 且被 reject，则终止上传。
    const beforeUpload = (file: any) => {
      if (props.limit && state.items.length > props.limit) {
        Message.error(`请先删除文件!`);
        return false;
      }

      const accepts = props.accept.split(",");
      const ary = file.name.split(".");
      const fileType = "." + ary[ary.length - 1];
      const isXls = accepts.some((it: any) => it === fileType);
      const isLt10M = file.size / 1024 / 1024 < props.maxSize;
      if (!isXls) {
        Message.error(`只能上传${props.tipText}!`);
        loading?.close();
        return isXls;
      }
      if (!isLt10M) {
        Message.error(`文件不能超过 ${props.maxSize}MB!`);
        return isLt10M;
      }
      return isXls && isLt10M;
    };

    //	删除文件之前的钩子，参数为上传的文件和文件列表。 若返回 false 或者返回 Promise 且被 reject，则终止删除。
    const beforeRemove = (file: any, fileList: any) => {
      state.uploadDisabled = false;
    };

    //	文件超出个数限制时的钩子
    const handleExceed = (files: any, fileList: any) => {
      fileUpload.value.clearFiles();
      fileUpload.value.handleStart(files[0]);
      state.items = [];
    };

    //	文件下载
    const handleDownload = (file: any) => {
      let url = file.path ? file.path : file.response.path;
      if (!url.toLowerCase().startsWith("http")) {
        url = `${GETFILE_URL}${url}`;
      }

      Download(url, file.name);
    };

    // 验证是否能预览
    const checkPreview = (file: any) => {
      const names = file.name.split(".");
      const type = "." + names[names.length - 1];
      return imgTypes.some((it) => it === type);
    };

    // 监视fileList
    watch(
      () => props.fileList,
      (val) => {
        if (val && val.length > 0) {
          val.forEach((it: any) => {
            if (!it.name) it.name = it.fileRealName;
            if (!it.path) it.path = it.filePath;
            it.url = `${GETFILE_URL}${it.path}`;
            if (!it.uid) it.uid = new Date().getTime();
          });
          state.items = [...val];
        } else {
          state.items = []
        }
        handleChange(null, props.fileList);
      },
      {
        immediate: true,
        deep: true
      }
    );

    onMounted(async () => {
      // loadData();
    });

    return {
      ...toRefs(state),

      fileUpload,
      FILE_URL,

      handlePreview,
      handleRemove,
      handleSuccess,
      handleError,
      handleProgress,
      handleChange,
      beforeUpload,
      beforeRemove,
      handleExceed,
      handleDownload,
      checkPreview
    };
  }
};
</script>

<style lang="less">
.disabled .el-upload.el-upload--picture-card {
  display: none !important;
}

.disabled .el-button--success.is-plain {
  display: none !important;
}
.my-loading {
  color: #fff;
}
</style>
