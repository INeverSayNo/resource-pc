<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="供应商选择"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="showDetails = false"
  >
    <el-form
      :model="query"
      inline
      size="small"
      label-width="100px"
      class="dt-none-bottom-form"
    >
      <el-form-item label="供应商名称">
        <el-input v-model="query.supplierName" placeholder="请输入供应商名称" />
      </el-form-item>
      <el-form-item label="供应商编码">
        <el-input v-model="query.supplierCode" placeholder="请输入供应商编码" />
      </el-form-item>
      <el-form-item label="供应商性质">
        <el-radio-group v-model="query.supplierNature">
          <el-radio-button>全部</el-radio-button>
          <el-radio-button
            v-for="item in SupplierNatureEnum.getArray()"
            :key="item.id"
            :label="item.id"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label=" " label-width="100px">
        <el-button type="primary" class="fr" @click="handleOpen">
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="supplierData"
      size="small"
      height="390px"
      border
      stripe
      highlight-current-row
      @row-click="handleRowClick"
      @selection-change="handleSelection"
    >
      <el-table-column type="selection"></el-table-column>
      <el-table-column label="序号" type="index"></el-table-column>
      <DcTableItem :columns="EnterpriseTbCols">
        <template #supplierName="scoped">
          {{ scoped.row.supplierName }}
        </template>
        <template #auditStatus="scoped">
          <el-tag :type="renderStatusType(scoped.row)" effect="plain">
            {{ scoped.row.auditStatusName }}
          </el-tag>
        </template>
      </DcTableItem>
    </el-table>
    <el-pagination
      v-model:currentPage="page"
      class="table-pagination"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <template #footer>
      <el-button @click="showDetails = false">取消</el-button>
      <el-button type="primary" @click="handleOk">确定</el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts">
import { computed, reactive, toRefs, defineComponent, ref } from "vue";
import { SupplierHeadDto } from "../types";
import DcTableItem from "@/components/DCLayout/TableColumn.vue";
import { EnterpriseTbCols } from "../tableColumns";
import { supplierHeadApi } from "../api";
import { Message } from "@/components/Message";
import { MsgPushTypeEnum } from "@/utils/base-entity";
import { AuditStatusEnum, SupplierNatureEnum } from "../Enum";

export default defineComponent({
  name: "",
  components: {
    DcTableItem
  },
  props: {
    modelValue: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ["update:modelValue", "select"],
  setup(props, { emit }) {
    const tableRef = ref();
    const showDetails = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      }
    });
    const state = reactive({
      supplierData: [] as SupplierHeadDto[],
      total: 0,
      page: 1,
      pageSize: 10,
      loading: false,
      query: {} as any,
      selectRows: [] as SupplierHeadDto[]
    });
    const handleOpen = () => {
      state.selectRows = [];
      loadData();
    };
    const loadData = () => {
      state.loading = true;
      supplierHeadApi
        .Query({
          page: state.page,
          pageSize: state.pageSize,
          ...state.query
        })
        .then((res) => {
          if (res?.isSuccessful) {
            state.supplierData = res.data.items;
            state.total = res.data.totalCount;
          }
        })
        .finally(() => {
          state.loading = false;
        });
    };

    function handleSizeChange(size: number) {
      state.pageSize = size;
      loadData();
    }
    function handleCurrentChange(page: number) {
      state.page = page;
      loadData();
    }
    function handleSelection(rows: SupplierHeadDto[]) {
      console.log(rows);

      state.selectRows = rows;
    }
    function handleOk() {
      if (state.selectRows?.length) {
        emit("select", state.selectRows[0]);
        showDetails.value = false;
      } else {
        Message.warning("请至少选中一个供应商信息");
      }
    }
    function handleRowClick(row: SupplierHeadDto) {
      const currentRow = state.selectRows.find((r) => r.id === row.id);
      tableRef.value?.clearSelection();
      if (currentRow) {
        tableRef.value?.toggleRowSelection(row, false);
      } else {
        tableRef.value?.toggleRowSelection(row, true);
      }
    }
    function renderStatusType(row: SupplierHeadDto) {
      let type = "";
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
      return type as any;
    }
    return {
      ...toRefs(state),
      tableRef,
      showDetails,
      EnterpriseTbCols,
      handleOpen,
      handleSizeChange,
      handleCurrentChange,
      handleSelection,
      handleOk,
      handleRowClick,
      SupplierNatureEnum,
      renderStatusType
    };
  }
});
</script>

<style></style>
