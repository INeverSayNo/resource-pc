<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="800"
    title="供应商银行账号维护"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="showDetails = false"
  >
    <el-form
      ref="formRef"
      :model="edit"
      :rules="rules"
      size="small"
      class="dialog-form"
      label-width="120px"
    >
      <el-form-item label="账户" prop="bankAccount">
        <el-input
          v-model="edit.bankAccount"
          placeholder="请输入账户名"
        ></el-input>
      </el-form-item>
      <el-form-item label="银行账号" prop="bankNo">
        <el-input v-model="edit.bankNo" placeholder="请输入银行账号"></el-input>
      </el-form-item>
      <el-form-item label="开户银行" prop="bankName">
        <el-input
          v-model="edit.bankName"
          placeholder="请输入开户银行"
        ></el-input>
      </el-form-item>
      <el-form-item label="币种" prop="currency">
        <el-select v-model="edit.currency" placeholder="请选择币种">
          <el-option
            v-for="item in currency"
            :key="item.id"
            :value="item.id"
            :label="item.label"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="账户类型" prop="currency">
        <el-radio-group v-model="edit.bankAccountType">
          <el-radio-button
            v-for="item in accountType"
            :key="item.id"
            :label="item.id"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否默认">
        <el-switch v-model="edit.isDefault"></el-switch>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button size="small" @click="showDetails = false">取消</el-button>
      <el-button size="small" type="primary" @click="handleSave">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts">
import { Message } from "@/components/Message";
import { deepClone } from "@/utils";
import { CurrencyEnum, AccountTypeEnum } from "@/utils/base-entity";
import {
  computed,
  reactive,
  toRefs,
  defineComponent,
  PropType,
  ref
} from "vue";
import { supplierBankApi } from "../api";
import {
  SupplierBankInfoCreateOrUpdateDto,
  SupplierBankInfoDto
} from "../types";
export default defineComponent({
  name: "",
  props: {
    visable: {
      type: Boolean,
      default: () => false
    },
    supplierId: {
      type: String,
      default: () => ""
    },
    modelValue: {
      type: Object as PropType<SupplierBankInfoDto>,
      default: () => {
        return {};
      }
    }
  },
  emits: ["update:visable", "save", "submit"],
  setup(props, { emit }) {
    const showDetails = computed({
      get: () => props.visable,
      set: (val) => {
        emit("update:visable", val);
      }
    });
    const formRef = ref();
    const state = reactive({
      edit: {
        currency: CurrencyEnum.Enum.CNY.id,
        bankAccountType: AccountTypeEnum.Enum.Company.id
      } as SupplierBankInfoCreateOrUpdateDto,
      currency: CurrencyEnum.getArray(),
      accountType: AccountTypeEnum.getArray(),
      rules: {
        bankAccount: [
          { required: true, message: "请输入账户名称", trigger: "blur" }
        ],
        bankName: [
          { required: true, message: "请输入开户行", trigger: "blur" }
        ],
        bankNo: [{ required: true, message: "请输入银行账号", trigger: "blur" }]
      }
    });

    const handleOpen = () => {
      if (props.modelValue?.id) {
        const temp = deepClone<SupplierBankInfoDto>(props.modelValue);
        state.edit = {
          isScrap: temp.isScrap,
          supplierHeadId: temp.supplierHeadId,
          bankAccount: temp.bankAccount,
          bankName: temp.bankName,
          bankNo: temp.bankNo,
          currency: temp.currency,
          bankAccountType: temp.bankAccountType,
          isDefault: temp.isDefault
        };
      }
    };
    function handleSave() {
      formRef.value?.validate(async (valid) => {
        if (valid) {
          if (!props.modelValue?.id && !props.supplierId) {
            // 本地新增
            emit("save", state.edit);
            showDetails.value = false;
          } else {
            let result = false;
            // 提交数据库
            if (props.modelValue?.id) {
              // 修改
              await supplierBankApi
                .Update(props.modelValue.id, state.edit)
                .then((res) => {
                  if (res.isSuccessful) {
                    result = true;
                  }
                });
            } else {
              // 有供应商Id,新增
              state.edit.supplierHeadId = props.supplierId;
              await supplierBankApi.Create(state.edit).then((res) => {
                if (res.isSuccessful) {
                  result = true;
                }
              });
            }
            if (result) {
              Message.success("数据保存成功");
              emit("submit", true);
              showDetails.value = false;
            }
          }
        } else {
          Message.warning("请完整的填写表单信息");
        }
      });
    }
    return {
      ...toRefs(state),
      formRef,
      showDetails,
      handleOpen,
      handleSave
    };
  }
});
</script>

<style></style>
