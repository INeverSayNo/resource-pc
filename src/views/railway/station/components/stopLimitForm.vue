<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="新增停限公告"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="showDetails = false"
  >
    <el-form
      ref="formRef"
      :model="edit"
      :rules="rules"
      class="form-container"
      size="small"
      label-width="100px"
      label-suffix=":"
    >
      <el-form-item label="发布单位" prop="railwayBureau">
        <el-select
          v-model="edit.railwayBureau"
          placeholder="请选择发布单位"
          clearable
          filterable
        >
          <el-option
            v-for="item in bureauData"
            :key="item.value"
            :label="`${item.label}局`"
            :value="`${item.label}局`"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="停限地点" prop="stopAddr">
        <el-input
          v-model="edit.stopAddr"
          placeholder="请输入停限地点"
        ></el-input>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="受限发局" prop="restrictedDepartureBureau">
            <el-input
          v-model="edit.restrictedDepartureBureau"
          placeholder="请输入受限发局"
        ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="受限发站" prop="restrictedDepartureStation">
            <el-input
          v-model="edit.restrictedDepartureStation"
          placeholder="请输入受限发站"
        ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="起始日期" prop="startDt">
            <el-date-picker
              v-model="edit.startDt"
              type="datetime"
              :disabled-date="(date) => renderDate(date, 'start')"
              placeholder="请选择起始日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="终止日期" prop="endDt">
            <el-date-picker
              v-model="edit.endDt"
              type="datetime"
              :disabled-date="(date) => renderDate(date, 'end')"
              placeholder="请选择终止日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="限停内容" prop="content">
        <el-input
          v-model="edit.content"
          type="textarea"
          :rows="3"
          placeholder="请输入限停内容"
        ></el-input>
      </el-form-item>
      <el-form-item label="限停原因" prop="reason">
        <el-input
          v-model="edit.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入限停原因"
        ></el-input>
      </el-form-item>
      <!-- 贡献人 -->
      <contribution-input style="width: 100%" v-model:contributor="edit.contributor" v-model:contributionaTime="edit.contributionaTime"></contribution-input>
    </el-form>
    <template #footer>
      <el-button @click="showDetails = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts">
import { Message } from "@/components/Message";
import { useStatisticTrace } from "@/hooks/useStatisticTrace";
import { getSystemDataShow } from "@/api/systemDataShowApi";
import { formatDateTime, formatTime } from "@/utils";
import {
  computed,
  reactive,
  toRefs,
  defineComponent,
  ref,
  onMounted
} from "vue";
import { AddStopNotice } from "../api";
import { RailWayStopNoticeCrudDto } from "../types";
import { useAnalyticsTrack } from "@/plugins/monitor";
import ContributionInput from "@/views/railway/contribution/index.vue"

type stateProp = {
  edit: RailWayStopNoticeCrudDto;
  loading: boolean;
  rules: object;
  bureauData: Array<any>;
};
export default defineComponent({
  name: "",
  components: {
    ContributionInput
  },
  props: {
    modelValue: {
      type: Boolean,
      default: () => false
    },
    stationId: {
      type: String,
      default: () => ""
    }
  },
  emits: ["update:modelValue", "success"],
  setup(props, { emit }) {
    const { businessOperationStart, businessOperationEnd } =
      useAnalyticsTrack();

    const { SetTrace } = useStatisticTrace();
    const showDetails = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      }
    });
    const formRef = ref();
    const state = reactive<stateProp>({
      edit: {
        stationId: props.stationId,
        noticeId: 65535,
        releaseDt: formatDateTime(new Date(), "YYYY-MM-DDTHH:mm")
      },
      loading: false,
      bureauData: [],
      rules: {
        stopAddr: [
          { required: true, message: "请输入停限地点", trigger: "blur" }
        ],
        startDt: [
          { required: true, message: "请选择起始日期", trigger: "change" }
        ],
        endDt: [{ required: true, message: "请选择终止", trigger: "change" }],
        content: [
          { required: true, message: "请输入停限内容", trigger: "blur" }
        ],
        reason: [{ required: true, message: "请输入停限原因", trigger: "blur" }],
        restrictedDepartureBureau:[{ required: true, message: "请输入受限发局", trigger: "blur" }],
        restrictedDepartureStation:[{ required: true, message: "请输入受限发站", trigger: "blur" }],
        contributor: [{required: true, message: "请选择贡献人", trigger: "blur"}],
        contributionaTime: [{required: true, message: "请选择贡献时间", trigger: "blur"}],
        
      }
    });

    const handleOpen = () => {
      businessOperationStart();
      state.edit = {
        stationId: props.stationId,
        noticeId: 65535,
        releaseDt: formatDateTime(new Date(), "YYYY-MM-DDTHH:mm")
      };
      const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
      state.edit.contributionaTime = formatTime(new Date(), "yyyy-MM-dd");
      state.edit.contributor = userInfo.given_name;
    };

    function handleSave() {
      businessOperationEnd({
        dataId: props.stationId,
        module: "铁路站点",
        page_title: "新增停限装信息"
      });
      formRef.value?.validate((valid) => {
        if (valid) {
          state.loading = true;
          AddStopNotice(state.edit)
            .then((res) => {
              if (res) {
                Message.success("保存成功");
                showDetails.value = false;
                SetTrace(
                  "$INSERT",
                  "铁路站点",
                  "全国铁路站点",
                  props.stationId,
                  1,
                  "停限装公告"
                );
                emit("success");
              }
            })
            .finally(() => {
              state.loading = false;
            });
          SetTrace("$UPDATE", "铁路站点", "全国铁路站点", props.stationId);
        } else {
          Message.warning("请完整的填写表单信息");
        }
      });
    }

    function renderDate(date, type: "start" | "end") {
      if (type === "start" && state.edit.endDt) {
        return date > new Date(state.edit.endDt);
      }
      if (type === "end" && state.edit.startDt) {
        return date < new Date(state.edit.startDt);
      }
      return false;
    }

    onMounted(() => {
      getSystemDataShow("RailwayBureauSelect", "").then((res) => {
        state.bureauData = res;
      });
    });

    return {
      ...toRefs(state),
      formRef,
      showDetails,
      renderDate,
      handleOpen,
      handleSave
    };
  }
});
</script>

<style></style>
