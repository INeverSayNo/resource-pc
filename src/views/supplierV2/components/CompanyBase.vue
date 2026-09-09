<template>
  <div v-loading="loading">
    <el-descriptions
      v-model="formRef"
      class="margin-top"
      size="small"
      direction="vertical"
      border
    >
      <el-descriptions-item label="企业名称">
        {{ formRef.name }}
      </el-descriptions-item>
      <el-descriptions-item label="统一社会信用代码">
        {{ formRef.creditCode }}
      </el-descriptions-item>
      <el-descriptions-item label="负责人">
        {{ formRef.legalPersonName }}
      </el-descriptions-item>
      <el-descriptions-item label="登记状态">
        {{ formRef.regStatus }}
      </el-descriptions-item>
      <el-descriptions-item label="成立日期">
        {{ formRef.estiblishTime }}
      </el-descriptions-item>
      <el-descriptions-item label="注册资本	">
        {{ formRef.regCapital }}
      </el-descriptions-item>
      <el-descriptions-item label="核准日期">
        {{ formRef.approvedTime }}
      </el-descriptions-item>
      <el-descriptions-item label="组织机构代码">
        {{ formRef.orgNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="纳税人识别号">
        {{ formRef.taxNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="企业类型">
        {{ formRef.companyOrgType }}
      </el-descriptions-item>
      <el-descriptions-item label="所属行业">
        {{ formRef.industry }}
      </el-descriptions-item>
      <el-descriptions-item label="所属地区">
        {{ formRef.city }}-{{ formRef.district }}
      </el-descriptions-item>
      <el-descriptions-item label="登记机关">
        {{ formRef.regInstitute }}
      </el-descriptions-item>
      <el-descriptions-item label="人员规模">
        {{ formRef.staffNumRange }}
      </el-descriptions-item>
      <el-descriptions-item label="参保人数">
        {{ formRef.socialStaffNum }}
      </el-descriptions-item>
      <el-descriptions-item label="曾用名">
        {{ formRef.historyNames }}
      </el-descriptions-item>
      <el-descriptions-item label="英文名">
        {{ formRef.property3 }}
      </el-descriptions-item>
      <el-descriptions-item label="注册地址">
        {{ formRef.regLocation }}
      </el-descriptions-item>
      <el-descriptions-item label="经营范围">
        {{ formRef.businessScope }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { GetCompanyBaseDetailAsync } from "@/api/qccApi";
import { formatTime } from "@/utils/index";
import { Message } from "@/components/Message";

export default defineComponent({
  name: "CompanyBase",
  props: {
    companyName: {
      type: String,
      default: () => ""
    },
    data: {
      type: String,
      default: () => ""
    }
  },
  setup(props: any) {
    const formRef = ref<any>({});
    const loading = ref(false);
    onMounted(() => {
      const companyName = props.companyName;
      if (props.data) {
        try {
          const data = JSON.parse(props.data);

          if (data?.name) {
            formRef.value = data;
            return;
          }
        } catch (error) {
          //
        }
      }
      loading.value = true;
      GetCompanyBaseDetailAsync(companyName)
        .then((res: any) => {
          if (res) {
            if (res.reason === "ok" && res.error_code === "0") {
              formRef.value = res.result;
              formRef.value.estiblishTime = formatTime(
                formRef.value.estiblishTime,
                "yyyy-MM-dd"
              );
            } else {
              Message.warning("未查询到该企业工商信息！");
            }
          }
        })
        .catch((ex) => {
          console.log(ex);
          Message.warning("工商信息查询失败！");
          loading.value = false;
        })
        .finally(() => {
          loading.value = false;
        });
    });
    return { formRef, loading };
  }
});
</script>
