<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="联系人信息维护"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="showDetails = false"
  >
    <el-form
      ref="formRef"
      :model="edit"
      label-width="100px"
      label-suffix=":"
      class="form-container"
    >
      <el-form-item label="服务类型">
        <el-select v-model="edit.serviceType" placeholder="请选择服务类型">
          <el-option
            v-for="item in serviceOptions"
            :key="item.value"
            :label="item.text"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="联系人姓名"
        prop="contacts"
        :rules="[
          { required: true, message: '请输入联系人姓名', trigger: 'blur' }
        ]"
      >
        <el-input
          v-model="edit.contacts"
          placeholder="请输入联系人姓名"
          :maxlength="20"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="联系人手机"
        prop="phone"
        :rules="[
          {
            validator: validatorNoHZZM,
            messgae: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]"
      >
        <el-input
          v-model="edit.phone"
          placeholder="请输入联系人手机"
          :maxlength="50"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="座机电话"
        prop="telePhone"
        :rules="[
          {
            validator: validatorNoHZZM,
            messgae: '请输入正确的座机电话',
            trigger: 'blur'
          }
        ]"
      >
        <el-input
          v-model="edit.telePhone"
          placeholder="请输入座机电话"
          :maxlength="50"
        ></el-input>
      </el-form-item>
      <el-form-item label="服务时间">
        <el-input
          v-model="edit.serviceTime"
          placeholder="请输入服务时间,如：08:30-17:30"
          :maxlength="20"
        ></el-input>
      </el-form-item>
      <el-form-item label="是否有效">
        <el-switch v-model="edit.isValid"></el-switch>
        <span class="theme-warning ml-10px">
          请电联确认联系方式有效后再勾选此项
        </span>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="edit.remark"
          type="textarea"
          placeholder="请输入备注信息"
          :rows="3"
          :maxlength="500"
          show-word-limit
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
import ContributionInput from "@/views/railway/contribution/index.vue"
import { useStatisticTrace } from "@/hooks/useStatisticTrace";
import {
  BaseData,
  GetSystemBaseDataAsync
} from "@/api/dictionaryApi";
import { validatorNoHZZM, formatTime } from "@/utils";
import {
  computed,
  reactive,
  toRefs,
  defineComponent,
  PropType,
  onMounted,
  ref
} from "vue";
import { AddContact, SetContact } from "../api";
import {
  RailWayStationContacts,
  RailWayStationContactsCrudDto
} from "../types";
import { useAnalyticsTrack } from "@/plugins/monitor";

type stateProp = {
  edit: RailWayStationContactsCrudDto;
  loading: boolean;
  serviceOptions: BaseData[];
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
    contact: {
      type: Object as PropType<RailWayStationContacts>,
      default: () => {}
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
    const formRef = ref();
    const { SetTrace } = useStatisticTrace();
    const showDetails = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      }
    });
    const state = reactive<stateProp>({
      edit: {},
      loading: false,
      serviceOptions: []
    });

    /** 弹窗打开编辑数据赋值 */
    const handleOpen = () => {
      businessOperationStart();
      state.edit = {
        stationId: props.stationId
      };
      const { id, ...other } = props.contact;
      if (id) {
        state.edit = {
          serviceType: other.serviceType,
          stationId: other.stationId,
          telePhone: other.telePhone,
          phone: other.phone,
          contacts: other.contacts,
          serviceTime: other.serviceTime,
          isValid: other.isValid,
          remark: other.remark
        };
      }
      const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
      state.edit.contributionaTime = formatTime(new Date(), "yyyy-MM-dd");
      state.edit.contributor = userInfo.given_name;
    };

    /** 保存数据 */
    async function handleSave() {
      if (state.edit.contributor===''||state.edit.contributor===null||state.edit.contributor===undefined){
        Message.warning("请选择贡献人")
        return
      }
      if (state.edit.contributionaTime===''||state.edit.contributionaTime===null||state.edit.contributionaTime===undefined){
        Message.warning("请选择贡献时间")
        return
      }
      businessOperationEnd({
        dataId: props.stationId,
        module: "铁路站点",
        page_title: "站点联系人维护"
      });
      formRef.value?.validate(async (valid) => {
        if (valid) {
          let res = false;
          try {
            state.loading = true;
            if (props.contact?.id) {
              res = await SetContact(props.contact.id, state.edit);
            } else {
              res = await AddContact(state.edit);
            }
            state.loading = false;
            if (res) {
              Message.success("保存成功");
              showDetails.value = false;
              emit("success");
              if (!props.contact?.id) {
                SetTrace(
                  "$INSERT",
                  "铁路站点",
                  "全国铁路站点",
                  props.stationId,
                  1,
                  "联系人"
                );
              }
            }
          } catch (error) {
            state.loading = false;
          }
          SetTrace("$UPDATE", "铁路站点", "全国铁路站点", props.stationId);
        } else {
          Message.warning("请完整的填写表单信息");
        }
      });
    }

    function loadServiceType() {
      GetSystemBaseDataAsync("stationContactServiceType").then((res) => {
        state.serviceOptions = res;
      });
    }

    onMounted(() => {
      loadServiceType();
    });

    return {
      ...toRefs(state),
      formRef,
      showDetails,
      handleOpen,
      validatorNoHZZM,
      handleSave
    };
  }
});
</script>

<style></style>
