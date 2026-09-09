<template>
  <DtDialog
    v-model="show"
    title="供应商详情"
    :columns="tbColumn"
    :data="detailsData"
  >
    <!--详情页自定义插槽-->
    <template #supplierName>
      <div>
        {{ detailsData?.supplierName }}

        <el-button
          v-if="isEnterprise"
          type="warning"
          size="small"
          plain
          @click="companyDialogVisible = true"
        >
          工商信息
        </el-button>
      </div>
    </template>
    <template #supplierCMDC>
      <img
        v-if="detailsData?.enterpriseExtend?.cmdcFile?.url"
        class="cu-pointer"
        style="width: 100px; height: auto"
        :src="detailsData.enterpriseExtend.cmdcFile.url"
        @click="handlePreview(detailsData?.enterpriseExtend.cmdcFile.url)"
      />
      <span v-else>暂无</span>
    </template>
    <template #auditStatus>
      <el-tag :type="renderStatusType(detailsData)" effect="plain">
        {{ detailsData?.auditStatusName }}
      </el-tag>
    </template>

    <template v-if="detailsData?.id" #detailsExtented>
      <PersonDt v-if="!isEnterprise" :data="detailsData"></PersonDt>
      <EnterpriseDt v-else :data="detailsData"></EnterpriseDt>

      <el-row justify="end">
        <el-col v-if="detailsData?.ownerOrgName" :span="8">
          <div style="text-align: right">
            <el-button type="primary" @click="() => changeSupplierInfo()">
              修改信息
            </el-button>
            <el-button type="success" @click="() => changeSupplierInfo(true)">
              增加归属机构
            </el-button>
          </div>
        </el-col>
      </el-row>
    </template>
  </DtDialog>
  <!-- 工商信息 -->
  <com-dialog
    :model-value="companyDialogVisible"
    width="1000px"
    title="工商信息"
    @close="companyDialogVisible = false"
  >
    <CompanyBase
      :company-name="detailsData?.supplierName"
      :data="detailsData?.enterpriseExtend?.businessInfoJson"
    />
  </com-dialog>
</template>

<script lang="ts">
import {
  reactive,
  toRefs,
  defineComponent,
  computed,
  watch,
  PropType
} from "vue";
import { createImgPreview } from "@/components/Preview";
import { GETFILE_URL } from "@/request";
import { deepClone, isUrlPath } from "@/utils";
import { GetFileListByIds } from "../../api/fileApi";
import { ElLoading } from "element-plus";
import { SupplierHeadDto, SupplierOwnerOrgShip } from "./types";
import { useSupplier } from "./useSupplier";
import { AuditStatusEnum, SupplierNatureEnum } from "./Enum";
import { EnterpriseTbCols, showColSetting } from "./tableColumns";
import { DCTableColumn } from "@/components/DCLayout/store";

import DtDialog from "@/components/DCLayout/detailsDialog.vue";
import PersonDt from "./person/dtview.vue";
import EnterpriseDt from "./enterprise/dtview.vue";
import CompanyBase from "./components/CompanyBase.vue";

type stateProp = {
  detailsData: SupplierHeadDto | undefined;
  companyDialogVisible: boolean;
};

export default defineComponent({
  components: {
    DtDialog,
    PersonDt,
    EnterpriseDt,
    CompanyBase
  },
  props: {
    visable: {
      type: Boolean,
      default: () => false
    },
    supplierId: {
      type: String,
      default: () => ""
    },
    ownerOrgList: {
      type: Array as PropType<Array<SupplierOwnerOrgShip>>,
      default: () => []
    }
  },
  emits: ["update:visable", "updateInfo"],
  setup(props, { emit }) {
    const { GetSupplierById } = useSupplier();
    const state = reactive<stateProp>({
      detailsData: undefined,
      companyDialogVisible: false
    });
    const show = computed({
      get: () => props.visable,
      set: (val) => {
        emit("update:visable", val);
      }
    });
    const isEnterprise = computed(() => {
      return (
        state.detailsData?.supplierNature ===
        SupplierNatureEnum.Enum.Enterprise.id
      );
    });
    const tbColumn = computed(() => {
      return deepClone<DCTableColumn[]>(EnterpriseTbCols).map((col) => {
        const activeName = isEnterprise.value ? "enterprise" : "person";
        if (showColSetting.get(activeName)?.includes(col.name || "")) {
          col.hidden = false;
        }
        if (isEnterprise.value) {
          if (showColSetting.get("person")?.includes(col.name || "")) {
            col.hidden = true;
          }
        } else {
          if (showColSetting.get("enterprise")?.includes(col.name || "")) {
            col.hidden = true;
          }
        }
        if (
          col.name === "ownerOrgName" &&
          Reflect.has(state.detailsData || {}, "ownerOrgName")
        ) {
          col.hidden = false;
        }
        return col;
      });
    });
    /**
     * 预览质量认证图片
     */
    function handlePreview(row: SupplierHeadDto | string) {
      if (typeof row === "string") {
        createImgPreview({
          imageList: [row],
          show: true,
          index: 0,
          zIndex: 9999,
          style: null
        });
      } else {
        if (row.enterpriseExtend?.hasCMDC && row.enterpriseExtend?.cmdcPics) {
          const loading = ElLoading.service({
            text: "图片加载中...",
            lock: true,
            background: "#000000a8"
          });
          GetFileListByIds([row.enterpriseExtend.cmdcPics])
            .then((res) => {
              if (res?.length) {
                const urls = res
                  .filter((x) => x.filePath)
                  .map((x) => {
                    if (isUrlPath(x.filePath)) {
                      return x.filePath || "";
                    } else {
                      return `${GETFILE_URL}${x.filePath}`;
                    }
                  });
                createImgPreview({
                  imageList: urls,
                  show: true,
                  index: 0,
                  zIndex: 9999,
                  style: null
                });
              }
            })
            .finally(() => {
              loading.close();
            });
        }
      }
    }
    function renderStatusType(row?: SupplierHeadDto) {
      let type = "";
      if (row) {
        switch (row.auditStatus) {
          case AuditStatusEnum.Enum.ApprovalFailed.id:
            type = "danger";
            break;
          case AuditStatusEnum.Enum.Approved.id:
            type = "success";
            break;
          case AuditStatusEnum.Enum.UnderApproved.id:
            type = "warning";
            break;
          case AuditStatusEnum.Enum.NotApproved.id:
            type = "info";
            break;
        }
      }
      return type;
    }

    function changeSupplierInfo(update = false) {
      emit("updateInfo", update);
    }
    watch(
      () => props.visable,
      (val) => {
        if (val && props.supplierId) {
          GetSupplierById(props.supplierId).then((res) => {
            state.detailsData = Object.assign(res, {
              ownerOrgName:
                props.ownerOrgList.map((e) => e.ownerOrgName).join(",") ||
                "暂无"
            });
          });
        }
      }
    );

    return {
      ...toRefs(state),
      show,
      isEnterprise,
      tbColumn,
      renderStatusType,
      handlePreview,
      changeSupplierInfo
    };
  }
});
</script>

<style lang="less" scoped></style>
