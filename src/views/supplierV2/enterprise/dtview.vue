<template>
  <div class="dt-view">
    <Gap>
      <span class="gap-title">联系人信息</span>
    </Gap>
    <el-table
      border
      style="margin: 5px 0"
      :data="contactData"
      stripe
      highlight-current-row
    >
      <el-table-column
        header-align="center"
        label="联系人姓名"
        width="130px"
        prop="contact"
      ></el-table-column>
      <el-table-column
        header-align="center"
        label="联系手机"
        width="130px"
        prop="contactPhone"
      >
        <template #default="scope">
          <div v-clipboard2:vlaue="scope.row.contactPhone">
            <span v-html="createPrivatePhone(scope.row.contactPhone).outerHTML"></span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        header-align="center"
        label="负责事项"
        prop="responsibleDes"
      ></el-table-column>
      <el-table-column
        align="center"
        width="100px"
        label="职位"
        prop="position"
      ></el-table-column>
      <el-table-column
        align="center"
        width="100px"
        label="禁止登录"
        prop="isDisabled"
      >
        <template #default="scope">
          {{ scope.row.isDisabled ? "是" : "否" }}
        </template>
      </el-table-column>
    </el-table>
    <Gap>
      <span class="gap-title">银行账户信息</span>
    </Gap>
    <el-table
      border
      style="margin: 5px 0"
      stripe
      highlight-current-row
      :data="bankData"
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
      <el-table-column header-align="center" label="银行账号" prop="bankNo">
        <template #default="scope">
          <span v-clipboard2>{{ scope.row.bankNo }}</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        width="100px"
        label="币种"
        prop="currencyName"
      ></el-table-column>
      <el-table-column
        align="center"
        width="100px"
        label="账户类型"
        prop="bankAccountTypeName"
      ></el-table-column>
      <el-table-column
        align="center"
        width="100px"
        label="是否默认"
        prop="isDefault"
      >
        <template #default="scope">
          {{ scope.row.isDefault ? "是" : "否" }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent, PropType, watch } from "vue";
import {
  SupplierBankInfoDto,
  SupplierEnterpriseLinkPersonDto,
  SupplierHeadDto
} from "../types";
import Gap from "@/components/Gap/index.vue";
import { GetBankListBySupplierId, GetListBySupplierId } from "../api";
export default defineComponent({
  components: {
    Gap
  },
  props: {
    data: {
      type: Object as PropType<SupplierHeadDto>,
      default: () => {}
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      contactData: [] as SupplierEnterpriseLinkPersonDto[],
      bankData: [] as SupplierBankInfoDto[]
    });

    function loadData(id: string) {
      const pId = id || props.data.id;
      Promise.all([
        GetListBySupplierId(pId),
        GetBankListBySupplierId(pId)
      ]).then((res) => {
        if (res?.length === 2) {
          state.contactData = res[0];
          state.bankData = res[1];
        }
      });
    }

    watch(
      () => props.data,
      (val) => {
        if (val?.id) {
          loadData(val.id);
        }
      },
      { immediate: true, deep: true }
    );

    return {
      ...toRefs(state)
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
