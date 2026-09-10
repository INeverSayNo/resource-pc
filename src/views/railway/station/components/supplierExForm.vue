<template>
  <com-dialog
    v-model="showDetails"
    :show-fullscreen="true"
    :width="1000"
    title="供应商信息维护"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="showDetails = false"
  >
    <DcGap style="margin-bottom: 10px">
      <span class="gap-title">供应商基础信息</span>
    </DcGap>
    <component
      :is="supplierNature"
      ref="supplierFormRef"
      class="form-container"
      :supplier-id="supplierId"
      :supplier-type-tree-data="supplierTypeTreeData"
      :supplier-type-data="supplierTypeData"
      :business-type-data="businessTypeData"
      :show-bank="false"
      :type="type"
      :update-owner-og="autoLaunchOrgSelect"
      :update-channel="updateChannel"
      @open-detail-dialog="(data) => openDetailDialog(data)"
      @open-edit-dialog="openEditDialog"
      @clear-supplier-id="clearSupplierId"
      @close-dialog="closeDialog"
    ></component>
    <template v-if="type === 'railwayStation'">
      <DcGap style="margin-bottom: 10px">
        <span class="gap-title">铁路扩展</span>
      </DcGap>
      <el-form
        ref="formRef"
        :model="edit"
        class="form-container"
        :rules="rules"
        label-width="130px"
        label-suffix=":"
      >
        <el-form-item label="承接业务" prop="underTakingBus">
          <el-select
            v-model="underTakingBus"
            placeholder="请选择承接业务"
            multiple
            filterable
            clearable
            @change="handleUnderTakingChange"
          >
            <el-option
              v-for="item in underTakingBusOptions"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="其他业务">
          <el-input
            v-model="edit.otherBusiness"
            placeholder="请输入其他业务信息"
            type="textarea"
            :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="成本价说明">
          <el-input
            v-model="edit.costDescription"
            placeholder="请输入成本价说明"
            type="textarea"
            :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="showDetails = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts">
import {
  BaseData,
  GetSystemBaseDataAsync
} from "@/api/dictionaryApi";
import {
  computed,
  reactive,
  toRefs,
  defineComponent,
  PropType,
  onMounted,
  ref,
  watch,
  watchEffect
} from "vue";
import { useSupplier } from "@/views/supplierV2/useSupplier";
import {
  SupplierHeadDto,
  SupplierOwnerOrgShip,
  SupplierTypeHeadTreeDto
} from "@/views/supplierV2/types";
import { RailWaySupplerExCrudDto, RailWaySupplerExDto } from "../types";

import EnterpriseForm from "@/views/supplierV2/enterprise/createForm.vue";
import PersonForm from "@/views/supplierV2/person/createForm.vue";
import DcGap from "@/components/Gap/index.vue";
import { SetSupplierEx } from "../api";
import { Message } from "@/components/Message";
import { useStatisticTrace } from "@/hooks/useStatisticTrace";
import { useAnalyticsTrack } from "@/plugins/monitor";
import { DcDeep } from "@dczy/tie-tools";

type stateProp = {
  edit: RailWaySupplerExCrudDto;
  underTakingBusOptions: BaseData[];
  supplierTypeData: SupplierTypeHeadTreeDto[];
  supplierTypeTreeData: SupplierTypeHeadTreeDto[];
  businessTypeData: BaseData[];
  underTakingBus: string[];
  supplierId: string;
  loading: boolean;
  rules: any;
};
export default defineComponent({
  name: "",
  components: {
    DcGap,
    enterprise: EnterpriseForm,
    person: PersonForm
  },
  props: {
    modelValue: {
      type: Boolean,
      default: () => false
    },
    stationId: {
      type: String,
      default: () => ""
    },
    stationName: {
      type: String,
      default: () => ""
    },
    data: {
      type: Object as PropType<RailWaySupplerExDto>,
      default: () => {}
    },
    supplierNature: {
      type: String as PropType<"enterprise" | "person">,
      default: () => "enterprise"
    },
    autoLaunchOrgSelect: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    supplierId: {
      type: String as PropType<string>,
      default: ""
    },
    updateChannel: {
      type: String as PropType<"inner" | "outer">,
      default: "outer"
    },
    type: {
      type: String as PropType<"waterPort" | "railwayStation">,
      default: "railwayStation"
    }
  },
  emits: [
    "update:modelValue",
    "success",
    "closeFormDialog",
    "showDetail",
    "reloadEditForm",
    "clearFormSupplierId"
  ],
  setup(props, { emit, expose }) {
    const { businessOperationStart, businessOperationEnd } =
      useAnalyticsTrack();

    const { SetTrace } = useStatisticTrace();
    const { loadTypeData, loadBusinessData } = useSupplier();
    const { SetSupplierTrace } = useStatisticTrace();
    const supplierFormRef = ref();
    const formRef = ref();
    const showDetails = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      }
    });
    const state = reactive<stateProp>({
      supplierTypeData: [],
      supplierTypeTreeData: [],
      businessTypeData: [],
      edit: {},
      loading: false,
      underTakingBusOptions: [],
      underTakingBus: [],
      supplierId: "",
      rules: {
        underTakingBus: [
          { required: true, message: "请选择可承接业务", trigger: "blur" }
        ]
      }
    });
    const handleOpen = () => {
      businessOperationStart();
      if (props.data?.id) {
        state.supplierId = props.data.supplerId;
        state.edit = {
          stationId: props.stationId,
          supplerId: props.data.supplerId,
          underTakingBus: props.data.underTakingBus,
          underTakingBusName: props.data.underTakingBusName,
          otherBusiness: props.data.otherBusiness,
          costDescription: props.data.costDescription,
          stationName: props.stationName
        };
        state.underTakingBus = props.data.underTakingBus?.split(",") || [];
      } else {
        state.supplierId = props.supplierId;
        state.underTakingBus = [];
        state.edit = {
          stationId: props.stationId,
          stationName: props.stationName
        };
      }
    };

    async function handleSave() {
      businessOperationEnd({
        dataId: props.stationId,
        module: props.type === "railwayStation" ? "铁路站点":"水运港口",
        page_title: "供应商信息维护"
      });
      try {
        await supplierFormRef.value?.validate();

        if (props.type === "railwayStation") {
          formRef.value
            ?.validate()
            .then(async (res) => {
              if (res) {
                saveSupplier();
              } else {
                state.loading = false;
              }
            })
            .catch(() => {
              state.loading = false;
            });
        } else {
          saveSupplier();
        }
      } catch (error) {
        if (Reflect.has(error as any, "underTakingBus")) {
          Message.warning("铁路拓展信息不完整");
        }
        state.loading = false;
      }
      SetSupplierTrace(
        props.data?.id ? "$UPDATE" : "$INSERT",
        "",
        props.data?.id
      );
    }

    async function saveSupplier() {
      state.loading = true;
      const param = DcDeep.clone<RailWaySupplerExCrudDto>(state.edit);
      await supplierFormRef.value?.saveData(
        true,
        (res, supplier: SupplierHeadDto) => {
          if (res) {
            const supplierId = res?.multipleData?.Id || state.supplierId;
            param.supplerId = supplierId;
            param.supplierName = supplier.supplierName;
            SetSupplierEx(param, props.data?.id)
              .then((r) => {
                if (r) {
                  showDetails.value = false;
                  Message.success("保存成功");
                  emit("success", supplier);
                  if (!props.data?.id) {
                    SetTrace(
                      "$INSERT",
                      props.type === "railwayStation" ? "铁路站点" : "水运港口",
                      props.type === "railwayStation" ? "全国铁路站点" : "全国水运港口",
                      props.stationId,
                      1,
                      "供应商"
                    );
                  }
                }
              })
              .finally(() => {
                if (props.data?.stationId || props.stationId) {
                  SetTrace(
                    "$UPDATE",
                    props.type === "railwayStation" ? "铁路站点" : "水运港口",
                    props.type === "railwayStation" ? "全国铁路站点" : "全国水运港口",
                    props.data?.stationId || props.stationId
                  );
                }
                state.loading = false;
              });
          } else {
            state.loading = false;
          }
        }
      );
    }

    function handleUnderTakingChange(val: any) {
      state.edit.underTakingBus = val?.join(",") || "";
      if (val?.length) {
        state.edit.underTakingBusName =
          state.underTakingBusOptions
            .filter((x) => val.includes(x.value))
            .map((x) => x.text)
            .join(",") || "";
      }
    }

    watch(
      () => props.supplierNature,
      (val) => {
        loadTypeData(val, (res) => {
          state.supplierTypeData = res.data;
          state.supplierTypeTreeData = res.treeData;
        });
      },
      { immediate: true }
    );

    onMounted(() => {
      GetSystemBaseDataAsync("railwaySupplierBusiness").then((res) => {
        state.underTakingBusOptions = res;
      });

      loadBusinessData((res) => {
        state.businessTypeData = res;
      });
    });

    // 已存在供应商详情与更新
    function openDetailDialog(
      data: Record<"supplierHeadDto", SupplierHeadDto> &
        Record<"supplierOwnerOrgShipDtos", Array<SupplierOwnerOrgShip>>
    ) {
      const { supplierHeadDto, supplierOwnerOrgShipDtos } = data;
      emit("showDetail", supplierHeadDto, supplierOwnerOrgShipDtos);
      // closeDialog("showEdit");
    }

    function openEditDialog(
      data: Record<"supplierHeadDto", SupplierHeadDto> &
        Record<"supplierOwnerOrgShipDtos", Array<SupplierOwnerOrgShip>>
    ) {
      const { supplierHeadDto, supplierOwnerOrgShipDtos } = data;
      emit("reloadEditForm", supplierHeadDto, supplierOwnerOrgShipDtos);
    }
    function clearSupplierId() {
      emit("clearFormSupplierId");
    }
    function closeDialog(type: "showEdit" | "showDt") {
      emit("closeFormDialog", type);
    }
    function setState(id: string) {
      state.supplierId = id;
      console.log(state.supplierId);
    }
    expose({ setState });
    return {
      ...toRefs(state),
      showDetails,
      supplierFormRef,
      formRef,
      handleOpen,
      handleSave,
      handleUnderTakingChange,
      closeDialog,
      openDetailDialog,
      openEditDialog,
      clearSupplierId
    };
  }
});
</script>

<style></style>
