<script lang="ts">
import {
  PropType,
  UnwrapRef,
  computed,
  defineComponent,
      ref,
  watch
} from "vue";
import { FILE_URL, GETFILE_URL } from "@/request";
import { Message } from "@/components/Message";
import { ElMessageBox } from "element-plus";
import { storeToRefs } from 'pinia'
import { useRailwayStationStore } from '../station/store/index'
import { AddStationImages } from "./api";
import PreviewWidget from "./preview.vue";
import { ElementUploadResponse, PreviewImgItem, UploadResponse } from "./type";
import SearchBg from '@/assets/img/search-bg.png'
import { DcCommon } from "@dczy/tie-tools";

type OptionItem = Record<"label" | "value", string>;
type Mark =
  | "handlingEquipment"
  | "edicatedLine"
  | "goodsShed"
  | "storageYard"
  | "innerWarehouse";

const fileurl = FILE_URL + "/RailwayStationImg";
const uploadHeaders = {
  Authorization: "bearer " + (localStorage.getItem("JsToken") || "")
};

export default defineComponent({
  name: "EditWidget",
  components: {
    PreviewWidget
  },
  props: {
    stationId: {
      type: String as PropType<string>,
      default: ""
    }
  },
  emits: ["uploadSuccess", "deleteSuccess"],
  setup(props, { emit }) {
    const railwayStationStore = useRailwayStationStore()
    const { equipmentList, privateLineList, warehouseList } = storeToRefs(railwayStationStore)
    const normalFileType = ref([
      {
        typeMark: "railwayDoor",
        typeName: "货场大门"
      },
      {
        typeMark: "railwayOffice",
        typeName: "制票大厅"
      },
      {
        typeMark: "railwayStationPlatform",
        typeName: "站台"
      }
    ]);

    const dropdownFileType = ref([
      {
        typeMark: "edicatedLine",
        typeName: "专用线",
        options: [] as Array<OptionItem>,
        selectedId: "",
        selectedName: ""
      },
      {
        typeMark: "handlingEquipment",
        typeName: "装卸设备",
        options: [] as Array<OptionItem>,
        selectedId: "",
        selectedName: ""
      },
      {
        typeMark: "innerWarehouse",
        typeName: "站内仓库",
        options: [] as Array<OptionItem>,
        selectedId: "",
        selectedName: ""
      },
      {
        typeMark: "storageYard",
        typeName: "堆场",
        options: [] as Array<OptionItem>,
        selectedId: "",
        selectedName: ""
      },
      {
        typeMark: "goodsShed",
        typeName: "货棚",
        options: [] as Array<OptionItem>,
        selectedId: "",
        selectedName: ""
      },
      {
        typeMark: "other",
        typeName: "其他",
        options: [
          {
            label: "停车场",
            value: "railwayPark"
          },
          {
            label: "运输设备",
            value: "translateDevice"
          }
        ] as Array<OptionItem>,
        selectedId: "",
        selectedName: ""
      }
    ]);

    // 抽离上传文件列表类型
    type NormalFileType = UnwrapRef<typeof normalFileType>[number];
    type DropdownFileType = UnwrapRef<typeof dropdownFileType>[number];
    type unionFileType = NormalFileType | DropdownFileType;

    function setMultipleFileOptions<T extends Mark>(
      mark: T,
      options: Array<OptionItem>
    ) {
      const item = dropdownFileType.value.find((e) => e.typeMark === mark)!;
      item.options = options;
    }

    function toggleDropdownType(id: string, dropdownItem: DropdownFileType) {
      dropdownItem.selectedName = dropdownItem.options.find(
        (e) => e.value === id
      )!.label;
    }

    watch(
      [
        equipmentList,
        privateLineList,
        warehouseList
      ],
      ([equipmentList, privateLineList, warehouseList]) => {
        if (Array.isArray(equipmentList) && equipmentList.length) {
          setMultipleFileOptions(
            "handlingEquipment",
            equipmentList.map((e) => {
              return {
                value: e.id,
                label: e.equipmentTypeName
              };
            })
          );
        }
        if (Array.isArray(privateLineList) && privateLineList.length) {
          setMultipleFileOptions(
            "edicatedLine",
            privateLineList.map((e) => {
              return {
                value: e.id,
                label: e.name
              };
            })
          );
        }

        if (Array.isArray(warehouseList) && warehouseList.length) {
          const storageYardList = warehouseList.filter(
            (e) => e.typeMark === "storageYard"
          );
          const goodsShed = warehouseList.filter(
            (e) => e.typeMark === "goodsShed"
          );
          const innerWarehouse = warehouseList.filter(
            (e) => e.typeMark === "innerWarehouse"
          );
          if (storageYardList.length) {
            setMultipleFileOptions(
              "storageYard",
              storageYardList.map((e) => {
                return {
                  value: e.id,
                  label: e.name
                };
              })
            );
          }
          if (goodsShed.length) {
            setMultipleFileOptions(
              "goodsShed",
              goodsShed.map((e) => {
                return {
                  value: e.id,
                  label: e.name
                };
              })
            );
          }
          if (innerWarehouse.length) {
            setMultipleFileOptions(
              "innerWarehouse",
              innerWarehouse.map((e) => {
                return {
                  value: e.id,
                  label: e.name
                };
              })
            );
          }
        }
      },
      {
        deep: true,
        immediate: true
      }
    );

    // #endregion

    // #region 预览 & 前置校验
    function handlePreview(file: any) {
      if ("jpg,png,jpeg".includes(file.fileType)) {
        const url = GETFILE_URL + "/resource/" + file.fileUrl;
        window.open(url);
      } else {
        Message.warning("文件不支持预览");
      }
    }

    async function beforeRemove(file: any) {
      let isRemove = false;
      await ElMessageBox.confirm(`确定移除${file.name}？`, "提示信息").then(
        () => {
          isRemove = true;
        }
      );
      return isRemove;
    }

    async function beforeUpload(file: any) {
      const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
      const whiteList = ["jpg", "png", "jpeg"];
      if (whiteList.indexOf(fileSuffix) === -1) {
        Message.error("上传文件只能是 jpg、png、jpeg 格式");
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        Message.error("上传文件大小不能超过 10MB");
        return false;
      }
    }
    function handleExceed(files: any, fileList: any) {
      const filecount = files.length + fileList.length;
      if (filecount > 1) {
        Message.warning(`超过限制约束，最多上传 1 个文件`);
      }
    }

    // #endregion

    // #region 此次上传文件列表
    const renderFileList = ref<Array<PreviewImgItem>>([]);
    const getFileList = computed(() => (mark: string) => {
      return renderFileList.value.filter((e) => e.typeMark === mark);
    });

    function handleRemove(
      file: ElementUploadResponse,
      fileList: Array<ElementUploadResponse>,
      item: unionFileType
    ) {
      // 已拦截为自定义删除
    }

    function handleSuccess(
      response: UploadResponse,
      file: ElementUploadResponse,
      fileList: Array<ElementUploadResponse>,
      item: unionFileType
    ) {
      const ImageFile = {
        id: DcCommon.guid(),
        fileGroupMark: "RailwayStationImg",
        fileGroupName: "站点图片",
        fileRealName: file.name,
        fileName: response.name,
        filePath: response.path,
        fileSize: response.size,
        fileType: file.name.substring(file.name.lastIndexOf(".") + 1),
        creationDate: new Date().toISOString()
      };
      const payload = {
        stationId: props.stationId,
        typeMark: item.typeMark,
        typeName: item.typeName,
        imageFile: ImageFile,
        id: ImageFile.id
      };
      if (Reflect.has(item, "selectedId")) {
        // 下拉
        payload["resourceId"] = (item as DropdownFileType).selectedId;
        payload["resourceName"] = (item as DropdownFileType).selectedName;
      }
      AddStationImages(payload).then((res) => {
        if (res.isSuccessful) {
          Message.success("上传成功!");
          emit("uploadSuccess", payload);
          renderFileList.value.push({
            stationId: props.stationId,
            typeMark: payload.typeMark,
            typeName: payload.typeName,
            fileId: payload.imageFile.id,
            createTime: payload.imageFile.creationDate,
            ...payload.imageFile,
            id: payload.id
          });
        }
      });
    }
    // #endregion

    function deletePreviewImg(id: string) {
      const index = renderFileList.value.findIndex((e) => e.id === id);
      if (index > -1) renderFileList.value.splice(index, 1);
      emit("deleteSuccess", id);
    }

    function setBackground(item: unionFileType) {
      const wrapEl = document.querySelector(
        `.upload-file[data-mark="${item.typeMark}"]`
      );
      const innerEl = wrapEl?.querySelector(
        "div.el-upload"
      ) as HTMLDivElement | null;
      if (innerEl) {
        innerEl.style.background = `linear-gradient(rgb(122 122 122 / 34%), rgb(164 161 161 / 78%)), url(https://rapi.daochen.com/UploadFile/RailwayStationPhotoDemo/${item.typeMark.toLowerCase()}.jpg) no-repeat 0% 20% / cover`;
        innerEl.style.backgroundPosition = `50% 50%`;
      }
    }

    return {
      normalFileType,
      dropdownFileType,
      renderFileList,
      deletePreviewImg,
      fileurl,
      uploadHeaders,
      handlePreview,
      handleRemove,
      handleSuccess,
      beforeRemove,
      beforeUpload,
      handleExceed,
      getFileList,
      toggleDropdownType,
      setBackground
    };
  }
});
</script>
<template>
  <div>
    <div>
      <PreviewWidget
        :file-list="renderFileList"
        @delete-success="deletePreviewImg"
      ></PreviewWidget>
    </div>
    <div style="overflow: hidden">
      <div
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, 120px);
          margin-top: 8px;
          margin-bottom: 8px;
          gap: 20px;
        "
      >
        <el-upload
          v-for="normalItem in normalFileType"
          :key="normalItem.typeMark"
          class="upload-file"
          :data-mark="normalItem.typeMark"
          :style="setBackground(normalItem)"
          :action="fileurl"
          :headers="uploadHeaders"
          name="File"
          :data="{ data: 'RailwayStationImg' }"
          :on-preview="handlePreview"
          :on-success="
            (response, file, fileList) =>
              handleSuccess(response, file, fileList, normalItem)
          "
          :on-remove="
            (file, fileList) => handleRemove(file, fileList, normalItem)
          "
          :before-remove="beforeRemove"
          :before-upload="beforeUpload"
          multiple
          accept=".jpg,.png,.jpeg"
          :on-exceed="handleExceed"
          :show-file-list="false"
          :file-list="getFileList(normalItem.typeMark)"
          list-type="picture-card"
        >
          <DAliIcon name="plus" class="" style="font-size: 16px" />
          {{ normalItem.typeName }}
        </el-upload>

        <!-- 下拉选择 -->
        <div
          v-for="dropdownItem in dropdownFileType"
          :key="dropdownItem.typeMark"
          style="
            display: grid;
            justify-content: center;
            grid-template-columns: repeat(1, 1fr);
            place-self: center;
          "
        >
          <el-select
            v-model="dropdownItem.selectedId"
            style="width: 120px; font-size: 12px"
            :placeholder="`${dropdownItem.typeName}类型`"
            @change="(id) => toggleDropdownType(id, dropdownItem)"
          >
            <el-option
              v-for="item in dropdownItem.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <div class="other-class">
            <el-upload
              class="upload-file"
              :action="fileurl"
              :headers="uploadHeaders"
              name="File"
              :data-mark="dropdownItem.typeMark"
              :style="setBackground(dropdownItem)"
              :data="{ data: 'RailwayStationImg' }"
              :on-preview="handlePreview"
              :on-success="
                (response, file, fileList) =>
                  handleSuccess(response, file, fileList, dropdownItem)
              "
              :on-remove="
                (file, fileList) => handleRemove(file, fileList, dropdownItem)
              "
              :before-remove="beforeRemove"
              :before-upload="beforeUpload"
              multiple
              accept=".jpg,.png,.jpeg"
              :on-exceed="handleExceed"
              :show-file-list="false"
              :file-list="getFileList(dropdownItem.typeMark)"
            >
              <DAliIcon name="plus" class="" />
              {{ dropdownItem.typeName }}
            </el-upload>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import "../station/style.less";
.upload-file {
  text-align: center;
  color: white;
  font-size: 14px;
  :deep(.el-upload--picture-card) {
    width: 120px;
    height: 120px;
    line-height: 120px;
  }
  :deep(.el-upload--text) {
    width: 100%;
    height: 100%;
    &:hover {
      color: #409eff;
    }
  }
}
.other-class {
  background-color: #fbfdff;
  border: 1px dashed #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  width: 120px;
  height: 84px;
  cursor: pointer;
  line-height: 85px;
  vertical-align: top;
}
</style>
