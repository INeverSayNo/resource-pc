<template>
  <div class="dt-view">
    <Gap>
      <span class="gap-title">身份信息</span>
    </Gap>
    <el-row style="margin: 5px 0;">
      <el-col :span="12" class="tc item">
        <div class="title">身份证人像面</div>
        <div class="img-content">
          <img
            v-if="data?.personExtend?.idCardBackFile?.url"
            class="cu-pointer"
            style="max-width: 100%; height: 190px;"
            :src="data.personExtend.idCardBackFile.url"
            @click="handlePreview(data?.personExtend?.idCardBackFile?.url)"
          />
        </div>
      </el-col>
      <el-col :span="12" class="tc item">
        <div class="title">身份证国徽面</div>
        <div class="img-content">
          <img
            v-if="data?.personExtend?.idCardFrontFile?.url"
            class="cu-pointer"
            style="max-width: 100%; height: 190px;"
            :src="data.personExtend.idCardFrontFile.url"
            @click="handlePreview(data.personExtend.idCardFrontFile.url)"
          />
        </div>
      </el-col>
      <el-col :span="12" class="item">
        <div class="title">身份证号</div>
        <div class="text-content">{{ data?.personExtend.idCardNo }}</div>
      </el-col>
      <el-col :span="12" class="item">
        <div class="title">身份地址</div>
        <div class="text-content">{{ data?.personExtend.idCardAddress }}</div>
      </el-col>
      <el-col :span="24" class="item">
        <div class="title">现居住地</div>
        <div class="text-content">{{ data?.personExtend.address }}</div>
      </el-col>
    </el-row>
    <Gap>
      <span class="gap-title">银行信息</span>
    </Gap>
    <el-row style="margin: 5px 0;">
      <el-col :span="12" class="item">
        <div class="title">账户</div>
        <div class="text-content">{{ editBank.bankAccount }}</div>
      </el-col>
      <el-col :span="12" class="item">
        <div class="title">银行账号</div>
        <div v-clipboard2="editBank.bankNo" class="text-content">
          {{ editBank.bankNo }}
        </div>
      </el-col>
      <el-col :span="12" class="item">
        <div class="title">开户银行</div>
        <div class="text-content">{{ editBank.bankName }}</div>
      </el-col>
      <el-col :span="12" class="item">
        <div class="title">账号类型</div>
        <div class="text-content">{{ editBank.bankAccountTypeName }}</div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent, PropType, watch } from "vue";
import { SupplierBankInfoDto, SupplierHeadDto } from "../types";
import { createImgPreview } from "@/components/Preview";

import Gap from "@/components/Gap/index.vue";
import { GetDefaultBankBySupplierId } from "../api";
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
  setup(props) {
    const state = reactive({
      editBank: {} as SupplierBankInfoDto
    });
    function handlePreview(url: string) {
      const urls: string[] = [];
      if (props.data?.personExtend?.idCardFrontFile?.url) {
        urls.push(props.data.personExtend.idCardFrontFile.url);
      }
      if (props.data?.personExtend?.idCardBackFile?.url) {
        urls.push(props.data.personExtend.idCardBackFile.url);
      }
      const index = urls.findIndex((x) => x === url);
      createImgPreview({
        imageList: urls,
        show: true,
        index: index,
        zIndex: 9999,
        style: null
      });
    }
    function loadBankInfo(id: string) {
      GetDefaultBankBySupplierId(id || props.data.id).then((res) => {
        state.editBank = res;
      });
    }

    watch(
      () => props.data,
      (val) => {
        if (val?.id) {
          loadBankInfo(val.id);
        }
      },
      { immediate: true, deep: true }
    );
    return {
      ...toRefs(state),
      handlePreview
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
