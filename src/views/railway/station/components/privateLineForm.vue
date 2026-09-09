<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="专用线信息维护"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="showDetails = false"
  >
    <el-form
      ref="formRef"
      :model="edit"
      class="form-container"
      size="small"
      label-width="100px"
      label-suffix=":"
      :rules="rules"
    >
      <el-row>
        <el-col :span="12" v-if="!privateLine?.stationId">
          <el-form-item label="关联站点" prop="stationId">
            <DcRailwayStation
              v-model="stationName"
              :show-unknown="false"
              placeholder="请输入关联站点"
              :rules="[{ required: true }]"
              @change="handleStationChange"
            ></DcRailwayStation>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="专用线名称" prop="name">
            <el-input
              v-model="edit.name"
              :disabled="!isEdit"
              placeholder="请输入专用线名称"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="代码" prop="num">
            <el-input
              v-model="edit.num"
              :disabled="!isEdit"
              placeholder="请输入专用线代码"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="取货里程" prop="transferMileage">
            <el-input
              v-model="edit.transferMileage"
              type="number"
              :disabled="!isEdit"
              placeholder="请输入取货里程"
            >
              <template #suffix>米</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="专用线地址">
        <dc-map-select v-model:value="edit.addressFormat"></dc-map-select>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="联系人姓名" prop="contacts">
            <el-input
              v-model="edit.contacts"
              placeholder="请输入联系人姓名"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="联系人电话"
            prop="phone"
            :rules="[
              {
                validator: validatorNoHZZM,
                messgae: '请输入正确的电话号码',
                trigger: 'blur'
              }
            ]"
          >
            <el-input
              v-model="edit.phone"
              placeholder="请输入联系人电话"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="收费标准" prop="chargeRemark">
            <el-input
              v-model="edit.chargeRemark"
              type="textarea"
              :rows="3"
              placeholder="请输入收费标准"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="" props="isAgreement">
            <el-switch
              v-model="edit.isAgreement"
              active-text="是否与专用线签订共用协议"
              inline-prompt
            ></el-switch>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="属性">
            <el-input
              v-model="edit.lineProperty"
              placeholder="请输入属性，如：企业/国铁"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="类别">
            <el-input
              v-model="edit.lineType"
              placeholder="请输入类别，如：A/B"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属单位">
            <el-input
              v-model="edit.ownerUnit"
              placeholder="请输入所属单位"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产权单位">
            <el-input
              v-model="edit.rightUnit"
              placeholder="请输入产权单位"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="附件信息">
            <DcFileAttach
              v-model="fileAttacies"
              :action="action"
            ></DcFileAttach>
          </el-form-item>
        </el-col>
        <!-- 贡献人 -->
      <contribution-input style="width: 100%" v-model:contributor="edit.contributor" v-model:contributionaTime="edit.contributionaTime"></contribution-input>
      </el-row>
      <!-- 普货办理范围 -->
      <el-row>
        <el-col :span="24">
          <DcGap class="mb-05">普货办理范围</DcGap>
        </el-col>
        <el-col :span="24">
          <el-form-item label="达到品类">
            <el-input
              v-model="edit.arriveCategory"
              type="textarea"
              placeholder="请输入达到品类"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="发送品类">
            <el-input
              v-model="edit.sendCategory"
              type="textarea"
              placeholder="请输入发送品类"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="">
            <el-checkbox v-model="edit.overrun" :label="true">超限</el-checkbox>
            <el-checkbox v-model="edit.overweight" :label="true">
              超重
            </el-checkbox>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 集装箱办理范围 -->
      <el-row>
        <el-col :span="24">
          <DcGap class="mb-05">
            集装箱办理范围
            <span
              class="theme-color fr cu-pointer"
              @click="expand.container = !expand.container"
            >
              {{ expand.container ? "收起" : "展开" }}
            </span>
          </DcGap>
        </el-col>
        <el-col v-show="expand.container" :span="24">
          <el-row>
            <el-col :span="24">
              <el-form-item label="发送">
                <el-select
                  v-model="containerSend"
                  multiple
                  filterable
                  clearable
                  placeholder="请选择集装箱发送办理范围"
                  @change="(val) => (edit.containerSendHS = val.join(','))"
                >
                  <el-option
                    v-for="item in containerOption"
                    :key="item.field"
                    :label="item.label"
                    :value="item.field"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="到达">
                <el-select
                  v-model="containerArrive"
                  multiple
                  filterable
                  clearable
                  placeholder="请选择集装箱到达办理范围"
                  @change="(val) => (edit.containerArriveHS = val.join(','))"
                >
                  <el-option
                    v-for="item in containerOption"
                    :key="item.field"
                    :label="item.label"
                    :value="item.field"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="">
                <el-checkbox v-model="edit.containerMixedLoading" :label="true">
                  集装箱混装
                </el-checkbox>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <!-- 危险品办理范围 -->
      <el-row>
        <el-col :span="24">
          <DcGap class="mb-05">
            危险品办理范围
            <span
              class="theme-color fr cu-pointer"
              @click="expand.danger = !expand.danger"
            >
              {{ expand.danger ? "收起" : "展开" }}
            </span>
          </DcGap>
        </el-col>
        <el-col v-show="expand.danger" :span="24">
          <el-row>
            <el-col :span="24">
              <el-form-item label="灌装发送">
                <el-input
                  v-model="edit.dangerSendFilling"
                  placeholder="请输入危险品灌装发送货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="灌装到达">
                <el-input
                  v-model="edit.dangerArriveFilling"
                  placeholder="请输入危险品灌装到达货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="非灌装发送">
                <el-input
                  v-model="edit.dangerSendNotFilling"
                  placeholder="请输入危险品非灌装发送货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="非灌装到达">
                <el-input
                  v-model="edit.dangerArriveNotFilling"
                  placeholder="请输入危险品非灌装到达货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="集装箱发送">
                <el-input
                  v-model="edit.dangerSendContainer"
                  placeholder="请输入危险品集装箱发送货物"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="集装箱到达">
                <el-input
                  v-model="edit.dangerArriveContainer"
                  placeholder="请输入危险品集装箱到达货物"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <!-- 起重能力 -->
      <el-row>
        <el-col :span="24">
          <DcGap class="mb-05">
            起重能力
            <span
              class="theme-color fr cu-pointer"
              @click="expand.LiftingCapacity = !expand.LiftingCapacity"
            >
              {{ expand.LiftingCapacity ? "收起" : "展开" }}
            </span>
          </DcGap>
        </el-col>
        <el-col v-show="expand.LiftingCapacity" :span="24">
          <el-row>
            <el-col :span="12">
              <el-form-item label="最大">
                <el-input
                  v-model="edit.maxLiftingCapacity"
                  placeholder="请输入最大起重能力"
                  type="number"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="叉车">
                <el-input
                  v-model="edit.forkliftLC"
                  placeholder="请输入叉车起重能力"
                  type="number"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="20尺集装箱">
                <el-input
                  v-model="edit.container20LC"
                  placeholder="请输入20尺集装箱起重能力"
                  type="number"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="40尺集装箱">
                <el-input
                  v-model="edit.container40LC"
                  placeholder="请输入40尺集装箱起重能力"
                  type="number"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
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
import {
  computed,
  reactive,
  toRefs,
  defineComponent,
  PropType,
  ref
} from "vue";
import { SetPrivateLine } from "../api";
import { RailWayPrivatelLine, RailWayPrivatelLineCrudDto } from "../types";
import { deepClone, GetAddress, validatorNoHZZM } from "@/utils";
import { useStatisticTrace } from "@/hooks/useStatisticTrace";
import { ContainerType } from "../store";
import { FILE_URL } from "@/request";
import { FileAttach } from "@/utils/base-entity";
import DcMapSelect from "@/components/BmapSelect/index.vue";
import DcGap from "@/components/Gap/index.vue";
import DcFileAttach from "@/components/UploadAttach/dcUploadAttach.vue";
import { useAnalyticsTrack } from "@/plugins/monitor";
import { QueryPrivateLineDetailById } from "../../privateLine/api";
import DcRailwayStation from "@/components/Railway/station.vue";
import ContributionInput from "@/views/railway/contribution/index.vue"
import { formatTime } from "@/utils";
type stateProp = {
  edit: RailWayPrivatelLineCrudDto;
  loading: boolean;
  containerSend: string[];
  containerArrive: string[];
  fileAttacies: FileAttach[];
  expand: {
    danger: boolean;
    LiftingCapacity: boolean;
    container: boolean;
  };
};
export default defineComponent({
  name: "",
  components: {
    DcMapSelect,
    DcGap,
    DcFileAttach,
    DcRailwayStation,
    ContributionInput
  },
  props: {
    modelValue: {
      type: Boolean,
      default: () => false
    },
    privateLine: {
      type: Object as PropType<RailWayPrivatelLine>,
      default: () => {}
    }
  },
  emits: ["update:modelValue", "success"],
  setup(props, { emit }) {
    const { businessOperationStart, businessOperationEnd } =
      useAnalyticsTrack();
    const stationName = ref("");
    const stationIptId = ref("");
    const formRef = ref();
    const action = ref(`${FILE_URL}/privateline`);
    const { SetTrace } = useStatisticTrace();
    const containerOption = ContainerType.filter((x) => x.label);
    const showDetails = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      }
    });
    const isEdit = computed(() => {
      return !props.privateLine.id;
    });
    const state = reactive<stateProp>({
      edit: {},
      loading: false,
      containerSend: [],
      containerArrive: [],
      expand: {
        danger: false,
        LiftingCapacity: false,
        container: false
      },
      fileAttacies: []
    });
    const handleOpen = () => {
      businessOperationStart();
      if (props.privateLine?.id) {
        state.edit = {
          name: props.privateLine.name,
          num: props.privateLine.num,
          transferMileage: props.privateLine.transferMileage,
          contacts: props.privateLine.contacts,
          phone: props.privateLine.phone,
          chargeRemark: props.privateLine.chargeRemark,
          addressFormat: GetAddress(props.privateLine.address, true),
          isAgreement: props.privateLine.isAgreement,
          lineProperty: props.privateLine.lineProperty,
          lineType: props.privateLine.lineType,
          ownerUnit: props.privateLine.ownerUnit,
          rightUnit: props.privateLine.rightUnit,
          shareUnit: props.privateLine.shareUnit,
          arriveCategory: props.privateLine.arriveCategory,
          sendCategory: props.privateLine.sendCategory,
          overrun: props.privateLine.overrun,
          overweight: props.privateLine.overweight,
          containerSendHS: props.privateLine.containerSendHS,
          containerArriveHS: props.privateLine.containerArriveHS,
          containerMixedLoading: props.privateLine.containerMixedLoading,
          maxLiftingCapacity: props.privateLine.maxLiftingCapacity,
          forkliftLC: props.privateLine.forkliftLC,
          container20LC: props.privateLine.container20LC,
          container40LC: props.privateLine.container40LC,
          dangerSendFilling: props.privateLine.dangerSendFilling,
          dangerSendNotFilling: props.privateLine.dangerSendNotFilling,
          dangerSendContainer: props.privateLine.dangerSendContainer,
          dangerArriveFilling: props.privateLine.dangerArriveFilling,
          dangerArriveNotFilling: props.privateLine.dangerArriveNotFilling,
          dangerArriveContainer: props.privateLine.dangerArriveContainer,
        };
        state.containerArrive =
          props.privateLine?.containerArriveHS?.split(",") || [];
        state.containerSend =
          props.privateLine?.containerSendHS?.split(",") || [];
        // state.fileAttacies = deepClone<FileAttach[]>(
        //   props.privateLine.fileAttach || []
        // );
        getFileList(props.privateLine.id);
      } else {
        state.edit = {};
        state.containerArrive = [];
        state.containerSend = [];
        state.fileAttacies = [];
      }
      const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
      state.edit.contributionaTime = formatTime(new Date(), "yyyy-MM-dd");
      state.edit.contributor = userInfo.given_name;
    };

    function handleStationChange(_, station) {
      stationIptId.value = station.Id;
    }

    function handleSave() {
      businessOperationEnd({
        dataId: props.privateLine.stationId,
        module: "铁路站点",
        page_title: "站点专用线信息编辑"
      });
      const id =
        props.privateLine.id ||
        props.privateLine.stationId ||
        stationIptId.value;
      if (!id) {
        Message.warning("请选择输入正确的关联站点");
        return;
      }
      formRef.value?.validate((valid) => {
        if (valid) {
          state.loading = true;
          const param = deepClone<RailWayPrivatelLineCrudDto>(state.edit);
          param.address = JSON.stringify(param.addressFormat);
          param.fileAttach = state.fileAttacies;
          SetPrivateLine(id, param, !isEdit.value)
            .then((res) => {
              if (res) {
                Message.success("保存成功");
                showDetails.value = false;
                if (!props.privateLine.id) {
                  SetTrace(
                    "$INSERT",
                    "铁路站点",
                    "全国铁路站点",
                    props.privateLine.stationId,
                    1,
                    "专用线"
                  );
                }
                emit("success");
              }
            })
            .finally(() => {
              state.loading = false;
            });
          SetTrace(
            "$UPDATE",
            "铁路站点",
            "全国铁路站点",
            props.privateLine.stationId || stationIptId.value
          );
        } else {
          Message.warning("请完整的填写表单信息");
        }
      });
    }
    const rules = {
      name: [{ required: true, message: "请输入专用线名称", trigger: "blur" }],
      num: [{ required: true, message: "请输入专用代码", trigger: "blur" }],
      contributor: [{required: true, message: "请选择贡献人", trigger: "blur"}],
      contributionaTime: [{required: true, message: "请选择贡献时间", trigger: "blur"}],
    };

    //#region 附件信息
    function getFileList(id: string) {
      QueryPrivateLineDetailById(id).then((res) => {
        state.fileAttacies = res.fileAttach || [];
      });
    }
    //#endregion
    return {
      ...toRefs(state),
      formRef,
      showDetails,
      handleOpen,
      validatorNoHZZM,
      handleSave,
      containerOption,
      action,
      isEdit,
      rules,
      stationName,
      handleStationChange
    };
  }
});
</script>

<style></style>
