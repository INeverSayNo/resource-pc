<template>
  <div class="bank-content">
    <div class="bank-list-btn tr">
      <el-button type="primary" size="small" @click="showEdit = true">
        增加
      </el-button>
      <el-button
        type="danger"
        size="small"
        :loading="deleteLoading"
        @click="handleDel"
      >
        删除
      </el-button>
    </div>
    <el-table
      border
      stripe
      highlight-current-row
      size="small"
      :data="bankData"
      @current-change="handleCurrentChange"
    >
      <el-table-column
        header-align="center"
        label="账户"
        prop="bankAccount"
      ></el-table-column>
      <el-table-column
        header-align="center"
        label="开户银行"
        prop="bankName"
      ></el-table-column>
      <el-table-column
        header-align="center"
        label="银行账号"
        prop="bankNo"
      ></el-table-column>
      <el-table-column
        header-align="center"
        label="币种"
        prop="currencyName"
      ></el-table-column>
      <el-table-column
        header-align="center"
        label="账户类型"
        prop="bankAccountTypeName"
      ></el-table-column>
      <el-table-column align="center" label="是否默认" prop="isDefault">
        <template #default="scope">
          <el-checkbox v-model="scope.row.isDefault"></el-checkbox>
        </template>
      </el-table-column>
    </el-table>
    <CreateBankForm
      v-model:visable="showEdit"
      :supplier-id="supplerId"
      @save="handleSaveLocal"
      @submit="handleSubmit"
    ></CreateBankForm>
  </div>
</template>

<script lang="ts">
import { Message } from "@/components/Message";
import { deepClone } from "@/utils";
import { AccountTypeEnum, CurrencyEnum } from "@/utils/base-entity";
import { ElMessageBox } from "element-plus";
import { reactive, toRefs, defineComponent, onMounted } from "vue";
import { GetBankListBySupplierId, supplierBankApi } from "../api";
import {
  SupplierBankInfoCreateOrUpdateDto,
  SupplierBankInfoDto
} from "../types";
import CreateBankForm from "./createBankForm.vue";

export default defineComponent({
  components: {
    CreateBankForm
  },
  props: {
    supplerId: {
      type: String,
      default: () => ""
    }
  },
  setup(props) {
    const state = reactive({
      bankData: [] as SupplierBankInfoDto[],
      showEdit: false,
      currentRow: {} as SupplierBankInfoDto,
      deleteLoading: false
    });
    function loadBankList() {
      if (props.supplerId) {
        GetBankListBySupplierId(props.supplerId).then((res) => {
          state.bankData = res;
        });
      }
    }
    /**
     * 选中行
     * @param row
     */
    function handleCurrentChange(row: SupplierBankInfoDto) {
      state.currentRow = row;
    }
    /**
     * 删除
     */
    function handleDel() {
      if (!state.currentRow?.bankNo) {
        Message.warning("请选中需要删除行的信息");
        return;
      }
      ElMessageBox.confirm(
        "是否删除选中行的银行信息，删除后不能恢复!",
        "提示信息"
      ).then(() => {
        if (state.currentRow.id) {
          state.deleteLoading = true;
          supplierBankApi
            .Delete(state.currentRow.id)
            .then((res) => {
              if (res?.isSuccessful) {
                Message.success("删除成功");
                loadBankList();
              }
            })
            .finally(() => {
              state.deleteLoading = false;
            });
        } else {
          const old = deepClone<SupplierBankInfoDto[]>(state.bankData);
          const index = old.findIndex(
            (x) => x.bankNo === state.currentRow.bankNo
          );
          if (index !== -1) {
            old.splice(index, 1);
            state.bankData = old;
          }
        }
      });
    }
    /**
     * 本地保存
     * @param data
     */
    function handleSaveLocal(data: SupplierBankInfoCreateOrUpdateDto) {
      state.bankData.push({
        bankAccount: data.bankAccount,
        bankName: data.bankName,
        bankNo: data.bankNo,
        currency: data.currency,
        currencyName: CurrencyEnum.getSelf(data.currency).label,
        bankAccountType: data.bankAccountType,
        bankAccountTypeName: AccountTypeEnum.getSelf(data.currency).label,
        isDefault: data.isDefault
      } as SupplierBankInfoDto);
    }
    /**
     * 增加表单，已提交数据库
     */
    function handleSubmit() {
      loadBankList();
    }
    /**
     * 获取数据
     */
    function GetData() {
      return state.bankData;
    }
    function clearBankList() {
      state.bankData = [];
    }
    onMounted(() => {
      loadBankList();
    });
    return {
      ...toRefs(state),
      handleCurrentChange,
      handleDel,
      handleSaveLocal,
      handleSubmit,
      GetData,
      clearBankList
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
