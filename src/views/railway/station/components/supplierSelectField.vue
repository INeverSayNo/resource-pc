<template>
  <el-autocomplete
    v-model="nameValue"
    :fetch-suggestions="supplierQuerySearch"
    placeholder="请输入供应商名称"
    @select="handleSelect"
  >
    <template #suffix>
      <DLegacyIcon class="el-input__icon" name="search" @click="show = true" />
    </template>
    <template v-if="stationId" #append>
      <el-popconfirm
        class="dc-popconfirm"
        title="请选择新增供应商类型?"
        cancel-button-type="success"
        confirm-button-type="primary"
        confirm-button-text="企业"
        cancel-button-text="个体"
        @confirm="handleAdd('enterprise')"
        @cancel="handleAdd('person')"
      >
        <template #reference>
          <span class="bar-btn fr">
            <DLegacyIcon name="plus" class="" />
            新增
          </span>
        </template>
      </el-popconfirm>
    </template>
  </el-autocomplete>
  <SupplierList v-model="show" @select="handleListSelect"></SupplierList>
  <EditForm
    ref="editFormRef"
    v-model="showEdit"
    :station-id="stationId"
    :station-name="stationName"
    :supplier-id="dtSupplierId"
    :supplier-nature="supplierNature"
    :update-channel="updateChannel"
    :auto-launch-org-select="autoLaunchOrgSelect"
    @success="handleSuccess"
  ></EditForm>
</template>

<script lang="ts">
import { computed, ref, watch } from "vue";
import { GetSupplierList } from "@/views/supplierV2/api";
import { SupplierHeadAllParamDto, SupplierHeadDto } from "@/views/supplierV2/types";
import SupplierList from "@/views/supplierV2/components/supplerList.vue";
import EditForm from "@/views/railway/station/components/supplierExForm.vue";

export default {
  components: {
    SupplierList,
    EditForm
  },
  props: {
    name: {
      type: String,
      default: () => ""
    },
    id: {
      type: String,
      default: () => ""
    },
    stationId: {
      type: String,
      default: () => ""
    },
    stationName: {
      type: String,
      default: () => ""
    }
  },
  emits: ["update:name", "update:id"],
  setup(props, { emit }) {
    const idValue = computed({
      get: () => props.id,
      set: (val) => {
        emit("update:id", val);
      }
    });
    const nameValue = computed({
      get: () => props.name,
      set: (val) => {
        emit("update:name", val);
      }
    });
    const show = ref(false);
    const supplerList = ref<SupplierHeadDto[]>([]);
    const loading = ref(false);

    function handleSelect(item) {
      idValue.value = item.label;
    }
    function handleListSelect(row: SupplierHeadDto) {
      idValue.value = row.id;
      nameValue.value = row.supplierName || "";
    }

    function supplierQuerySearch(queryString: string, cb: any) {
      if (!queryString) {
        cb([]);
        return;
      }
      const query = {
        keyWords: queryString,
        isAudit: true
      } as SupplierHeadAllParamDto;
      loadSupplier(query).then((res) => {
        cb(res);
      });
    }

    async function loadSupplier(query: SupplierHeadAllParamDto) {
      loading.value = true;
      const result = await GetSupplierList(query);
      loading.value = false;
      supplerList.value = result;
      const data = (result || []).map((g: any) => {
        return {
          label: g.id,
          value: g.supplierName,
          businessTypeIds: g.businessTypeIds,
          supplier: g
        };
      });
      return data;
    }
    const dtSupplierId = ref("");
    const showEdit = ref(false);
    const supplierNature = ref<"enterprise" | "person">("enterprise");
    const updateChannel = ref<"outer" | "inner">("outer");
    const autoLaunchOrgSelect = ref(false);

    function handleAdd(type: "enterprise" | "person") {
      updateChannel.value = "outer";
      dtSupplierId.value = "";
      supplierNature.value = type;
      showEdit.value = true;
      autoLaunchOrgSelect.value = false;
    }
    function handleSuccess(supplier: SupplierHeadDto) {
      idValue.value = supplier.id;
      nameValue.value = supplier.supplierName || "";
    }
    watch(
      () => props.id,
      (val) => {
        if (val && !nameValue.value) {
          const self = supplerList.value.find((x) => x.id === val);
          if (self) {
            nameValue.value = self.supplierName || "";
          } else {
            const query = {
              Ids: [val],
              isAudit: true
            } as SupplierHeadAllParamDto;
            GetSupplierList(query).then((res) => {
              supplerList.value = res;
              if (res?.length > 0) {
                nameValue.value = res[0].supplierName || "";
              }
            });
          }
        }
      },
      { immediate: true }
    );
    return {
      show,
      nameValue,
      dtSupplierId,
      supplierNature,
      showEdit,
      updateChannel,
      autoLaunchOrgSelect,

      supplierQuerySearch,
      handleSelect,
      handleListSelect,
      handleAdd,
      handleSuccess
    };
  }
};
</script>

<style lang="less" scoped></style>
