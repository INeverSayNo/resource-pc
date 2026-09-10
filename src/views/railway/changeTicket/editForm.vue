<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  reactive,
  onMounted,
  ref,
  unref
} from "vue";
import DcUploadAttach from "@/components/UploadAttach/index.vue";
import { FILE_URL } from "@/request";
import { ElLoading, ElMessage } from "element-plus";
import {
  CreateChangeTicket,
  UpdateChangeTicket,
  GetChangeTicketDetailById
} from "./api";
import { GetFileListByIds } from "@/api/fileApi";
import { FileAttach } from "@/utils/base-entity";
import { changeType, transportType, unitType } from "./enum";
import { EnumItem } from "./type";
import { validatePhone, formatTime } from "@/utils";
import ContributionInput from "@/views/railway/contribution/index.vue"
import { element } from "@/formCreate/config";

export default defineComponent({
  name: " ChangeTicketEditForm",
  components: {
    DcUploadAttach,
    ContributionInput
  },
  props: {
    visible: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    stationId: {
      type: String as PropType<string>,
      default: ""
    },
    stationName: {
      type: String as PropType<string>,
      default: ""
    },
    isEdit: {
      type: Boolean as PropType<boolean>,
      default: false
    },
    changeTicketId: {
      type: String as PropType<string>,
      default: ""
    }
  },
  emits: ["update:visible", "reload"],
  setup(props, { emit }) {
    const show = computed({
      get: () => props.visible,
      set: (val) => emit("update:visible", val)
    });

    function handleOpen() {
      const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
      baseInfo.contributionaTime=formatTime(new Date(), "yyyy-MM-dd");
      baseInfo.contributor = userInfo.given_name;
      if (props.changeTicketId) {
        getChangeTicketInfo();
      }
    }

    const baseInfo = reactive({
      changeCost: "",
      elapsedTime: "",
      contacts: "",
      phone: "",
      remark: "",
      contributor: "",
      contributionaTime: ""
    });

    //#region 费用单位
    const unitState = reactive({
      unit: "",
      unitList: unitType.getArray()
    });
    //#endregion

    //#region 换装方式
    const changeTypeState = reactive({
      changeType: changeType.Enum.OnStation.id,
      changeTypeName: changeType.Enum.OnStation.label,
      typeList: changeType.getArray()
    });
    function handleChangeType(name: string) {
      changeTypeState.changeType = changeTypeState.typeList.find(
        (e) => e.label === name
      )?.id;
    }
    //#endregion

    //#region  运输方式
    const transportTypeState = reactive({
      transportType: "",
      transportTypeName: "",
      showPicker: false,
      transportTypeList: transportType.getArray()
    });

    function changeTransportType(type: string) {
      transportTypeState.transportTypeName =
        transportTypeState.transportTypeList.find((e) => e.value === type)
          ?.label ?? "";
    }
    //#endregion

    // #region 附件列表
    const uploadAction = `${FILE_URL}/demandAttach`;
    const fileAttachs = ref<Array<FileAttach>>([]);
    // #endregion

    //#region 表单 & 提交
    const formRef = ref();
    const loading = ref(false);
    const formModel = computed(() => {
      return {
        ...baseInfo,
        ...unitState,
        ...transportTypeState,
        ...changeTypeState
      };
    });

    const rules = {
      transportType: [
        { required: true, message: "请选择运输方式", trigger: "blur" }
      ],
      changeTypeName: [
        { required: true, message: "请选择换装方式", trigger: "blur" }
      ],
      unit: [{ required: true, message: "请选择单位", trigger: "blur" }],
      changeCost: [
        { required: true, message: "请填写换装费用", trigger: "blur" }
      ],
      elapsedTime: [
        { required: true, message: "请填写换装耗时", trigger: "blur" }
      ],
      contributor: [{required: true, message: "请选择贡献人", trigger: "blur"}],
      contributionaTime: [{required: true, message: "请选择贡献时间", trigger: "blur"}],
    };
    async function saveChangeTicket() {
      await formRef.value?.validate();
      const payload = {
        ...baseInfo,
        unit: unitState.unit,
        transportType: transportTypeState.transportType,
        trnasportTypeName: transportTypeState.transportTypeName,
        changeType: changeTypeState.changeType,
        fileAttachs: unref(fileAttachs),
        stationId: props.stationId,
        stationName: props.stationName
      };
      if (props.isEdit) {
        payload["id"] = props.changeTicketId;
      }
      const fn = props.isEdit ? UpdateChangeTicket : CreateChangeTicket;
      const loading = ElLoading.service({ text: "数据保存中..." });
      fn(payload, props.changeTicketId)
        .then((res) => {
          loading.close();
          if (res.isSuccessful) {
            ElMessage.success("保存成功");
            show.value = false;
            emit("reload");
          } else {
            ElMessage.error("保存异常\n请检查");
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error("保存异常\n请检查");
        });
    }

    //#endregion

    function getChangeTicketInfo() {
      const loading = ElLoading.service({ text: "数据加载中..." });
      GetChangeTicketDetailById(props.changeTicketId)
        .then((res) => {
          loading.close();
          if (res.isSuccessful) {
            const { data } = res;
            baseInfo.changeCost = `${data.changeCost}`;
            baseInfo.contacts = data.contacts;
            baseInfo.elapsedTime = `${data.elapsedTime}`;
            baseInfo.phone = data.phone;
            baseInfo.remark = data.remark;

            unitState.unit = data.unit || "";

            changeTypeState.changeTypeName = changeType.getSelf(
              data.changeType
            ).label;
            changeTypeState.changeType = data.changeType;
            transportTypeState.transportType = data.transportType;
            transportTypeState.transportTypeName =
              data.transportTypeName ||
              transportType
                .getArray()
                .find((e) => e.value === data.transportType)?.label ||
              "";

            if (data.fileAttachIds) {
              GetFileListByIds(data.fileAttachIds.split(",")).then((res) => {
                if (Array.isArray(res)) {
                  fileAttachs.value = res;
                }
              });
            }
          }
        })
        .catch((err) => {
          console.log(err);
          loading.close();
        });
    }

    return {
      show,
      handleOpen,
      baseInfo,
      formModel,
      rules,
      changeTypeState,
      handleChangeType,
      transportTypeState,
      changeTransportType,
      fileAttachs,
      uploadAction,
      loading,
      formRef,
      saveChangeTicket,
      unitState
    };
  }
});
</script>
<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="show"
    :width="1000"
    title="换装信息维护"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="show = false"
  >
    <el-form
      ref="formRef"
      class="form-container"
      :model="formModel"
      :rules="rules"
      label-width="100px"
      label-suffix=":"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="运输方式" prop="transportType">
            <el-select
              v-model="transportTypeState.transportType"
              placeholder="请选择运输方式"
              size="large"
              style="width: 240px"
              @change="changeTransportType"
            >
              <el-option
                v-for="item in transportTypeState.transportTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="换装方式" prop="changeTypeName">
            <el-radio-group
              v-model="changeTypeState.changeTypeName"
              @change="handleChangeType"
            >
              <el-radio
                v-for="item in changeTypeState.typeList"
                :key="item"
                :label="item.label"
                :value="item.id"
              />
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="换装费用" prop="changeCost">
            <el-input
              v-model="baseInfo.changeCost"
              type="number"
              placeholder="请填写换装费用"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="单位" prop="unit">
            <el-select
              v-model="unitState.unit"
              placeholder="费用单位"
              style="width: 240px"
            >
              <el-option
                v-for="item in unitState.unitList"
                :key="item.value"
                :label="item.label"
                :value="item.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="换装耗时" prop="elapsedTime" label-width="10em">
            <el-input
              v-model="baseInfo.elapsedTime"
              type="number"
              placeholder="请填写换装耗时"
            >
              <template #suffix>
                <span>天</span>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人">
            <el-input
              v-model="baseInfo.contacts"
              placeholder="请输入负责人姓名"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="负责人联系方式" label-width="10em">
            <el-input
              v-model="baseInfo.phone"
              placeholder="请输入负责联系方式"
              type="tel"
              maxlength="11"
              minlength="8"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="附件上传">
            <dc-upload-attach
              v-model="fileAttachs"
              :action="uploadAction"
              accept="image/*"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="换装说明">
            <el-input
              v-model="baseInfo.remark"
              :autosize="{ minRows: 3, maxRows: 5 }"
              type="textarea"
              placeholder="请输入换装说明"
            />
          </el-form-item>
        </el-col>
        <!-- 贡献人 -->
      <contribution-input style="width: 100%" v-model:contributor="baseInfo.contributor" v-model:contributionaTime="baseInfo.contributionaTime"></contribution-input>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="saveChangeTicket">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>
