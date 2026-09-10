<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="visible"
    :width="1000"
    :title="title"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="visible = false"
  >
    <el-form
      ref="formRef"
      class="form-container"
      :model="edit"
      label-suffix=":"
      label-width="100px"
      :rules="rules"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="拜访业务">
            <el-radio-group v-model="edit.visitExtendJson.visitBusinessType">
              <el-radio
                v-for="item in VisitBusinessTypeEnum.getArray()"
                :key="item.id"
                :label="item.id"
              >
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col v-if="renderPrivateLine" :span="12">
          <el-form-item label="专用线" prop="visitExtendJson.businessObjId">
            <el-select
              v-model="edit.visitExtendJson.businessObjId"
              placeholder="请选择专用线"
              filterable
              clearable
              @change="handlePlChange"
            >
              <el-option
                v-for="item in optionsState.privateLineOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="拜访方式">
            <el-radio-group v-model="edit.visitExtendJson.visitType">
              <el-radio
                v-for="item in optionsState.visitTypeOptions"
                :key="item.value"
                :label="item.value"
              >
                {{ item.text }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="站点联系人">
            <el-select
              v-model="edit.visitExtendJson.contact"
              placeholder="请输入铁路站点联系人信息"
              filterable
              clearable
              allow-create
              default-first-option
              @change="handleContactChange"
            >
              <el-option
                v-for="item in contactOptions"
                :key="item.value"
                :label="item.value"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="visitExtendJson.contactPhone">
            <el-input
              v-model="edit.visitExtendJson.contactPhone"
              placeholder="请输入联系电话"
              :maxlength="11"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="拜访日期" prop="visitDate">
            <el-date-picker
              v-model="edit.visitDate"
              placeholder="请选择拜访日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="拜访内容" prop="visitContent">
        <el-input
          v-model="edit.visitContent"
          placeholder="请输入拜访内容"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
        ></el-input>
      </el-form-item>
      <!-- 贡献人 -->
      <contribution-input v-model:contributor="edit.contributor" v-model:contributionaTime="edit.contributionaTime" style="width: 100%"></contribution-input>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts" setup>
import { Message } from "@/components/Message";
import { formatTime, validatePhone } from "@/utils";
import { computed, ref, watch } from "vue";
import {
  resourceObject,
  StationVisitExtend,
  StationVisitRecordCrud,
  VisitBusinessTypeEnum
} from "@/views/railway/station-visit/types";
import { useOptions } from "@/views/railway/station-visit/useOptions";
import { useStatisticTrace } from "@/hooks/useStatisticTrace";

import ResourceVisitApi from "@/views/resource-visit/api";
import { useAnalyticsTrack } from "@/plugins/monitor";
import ContributionInput from "@/views/railway/contribution/index.vue"
import { DcDeep } from "@dczy/tie-tools";
const props = defineProps({
  show: {
    type: Boolean,
    default: () => false
  },
  title: {
    type: String,
    default: () => "新增站点拜访记录"
  },
  stationId: {
    type: String,
    default: () => ""
  },
  stationName: {
    type: String,
    default: () => ""
  }
});
const { businessOperationStart, businessOperationEnd } = useAnalyticsTrack();

const { SetTrace } = useStatisticTrace();
const edit = ref<StationVisitRecordCrud>({
  businessTbName: resourceObject.tbName,
  businessTypeId: resourceObject.id,
  visitExtendJson: {
    visitBusinessType: VisitBusinessTypeEnum.Station as number
  },
  businessId: props.stationId,
  businessName: props.stationName,
  visitDate: formatTime(new Date(), "yyyy-MM-dd HH:mm"),
  visitContent: ""
});
const formRef = ref();
const loading = ref(false);
const stationId = computed(() => props.stationId);
const api = new ResourceVisitApi<StationVisitExtend>();
const { optionsState, getVisitType, getPrivateLine, getContact } = useOptions(
  stationId,
  edit
);

const contactOptions = computed(() => {
  if (
    edit.value.visitExtendJson?.visitBusinessType ===
    (VisitBusinessTypeEnum.Station as number)
  ) {
    return optionsState.contactOptions.map((x) => {
      return {
        label: x.contacts,
        value: x.contacts,
        phone: x.phone
      };
    });
  } else if (
    edit.value.visitExtendJson?.visitBusinessType ===
    (VisitBusinessTypeEnum.PrivateLine as number)
  ) {
    return optionsState.privateLineOptions
      .filter(
        (x) => x.id === edit.value.visitExtendJson?.businessObjId && x.contacts
      )
      .map((x) => {
        return {
          label: x.contacts,
          value: x.contacts,
          phone: x.phone
        };
      });
  }
  return [];
});

const renderPrivateLine = computed(
  () =>
    edit.value.visitExtendJson?.visitBusinessType ===
    (VisitBusinessTypeEnum.PrivateLine as number)
);

function handleContactChange(val) {
  const item = contactOptions.value?.find((x) => x.value === val);
  if (item?.phone) {
    edit.value.visitExtendJson!.contactPhone = item?.phone;
  }
}
function handlePlChange(val) {
  const item = optionsState.privateLineOptions.find((x) => x.id === val);
  edit.value.visitExtendJson.businessObjName = item?.name || "";
}
function handleSave() {
  businessOperationEnd({
    dataId: props.stationId,
    module: "铁路站点",
    page_title: "新增拜访记录"
  });
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      const temp = DcDeep.clone<StationVisitRecordCrud>(edit.value);
      temp.visitDate = formatTime(temp.visitDate, "yyyy-MM-ddTHH:mm:ss");
      const res = await api.Create(temp);
      loading.value = false;
      if (res) {
        Message.success("保存成功");
        SetTrace(
          "$INSERT",
          "铁路站点",
          "全国铁路站点",
          props.stationId,
          1,
          "拜访记录"
        );
        SetTrace("$UPDATE", "铁路站点", "全国铁路站点", props.stationId);
        emits("success");
        visible.value = false;
      }
    } else {
      Message.warning("请完整的填写表单信息");
    }
  });
}

watch(
  () => edit.value.visitExtendJson?.visitBusinessType,
  (val) => {
    if (val === (VisitBusinessTypeEnum.PrivateLine as number)) {
      getPrivateLine();
    } else {
      edit.value.visitExtendJson.businessObjId = "";
      edit.value.visitExtendJson.businessObjName = "";
    }
  }
);
watch(
  () => contactOptions.value,
  (val) => {
    if (val.length === 1) {
      edit.value.visitExtendJson!.contact = val[0].label;
      edit.value.visitExtendJson!.contactPhone = val[0].phone;
    } else {
      edit.value.visitExtendJson!.contact = "";
      edit.value.visitExtendJson!.contactPhone = "";
    }
  }
);
const rules = {
  visitDate: [{ required: true, message: "请选择拜访日期", trigger: "blur" }],
  visitContent: [
    { required: true, message: "请输入拜访内容", trigger: "blur" }
  ],
  "visitExtendJson.businessObjId": [
    { required: true, message: "请选择专用线信息", trigger: "change" }
  ],
  contributor: [{ required: true, message: "请选择贡献人", trigger: "blur" }],
  contributionaTime: [{ required: true, message: "请选择贡献时间", trigger: "blur" }]
};
const emits = defineEmits(["update:show", "success"]);
const visible = computed({
  get: () => props.show,
  set: (val) => {
    emits("update:show", val);
  }
});
function handleOpen() {
  businessOperationStart();
  const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
  optionsState.hasLoadC = false;
  optionsState.hasLoadPl = false;
  optionsState.contactOptions = [];
  optionsState.visitTypeOptions = [];
  optionsState.privateLineOptions = [];
  getVisitType();
  getContact();
  edit.value = {
    businessTbName: resourceObject.tbName,
    businessTypeId: resourceObject.id,
    visitExtendJson: {
      visitBusinessType: VisitBusinessTypeEnum.Station as number
    },
    businessId: props.stationId,
    businessName: props.stationName,
    visitDate: formatTime(new Date(), "yyyy-MM-dd HH:mm"),
    visitContent: "",
    contributionaTime: formatTime(new Date(), "yyyy-MM-dd"),
    contributor: userInfo.given_name
  };
}
</script>

<style lang="less" scoped></style>
