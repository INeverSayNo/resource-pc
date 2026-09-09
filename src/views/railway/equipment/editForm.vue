<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  reactive,
  onMounted,
  ref
} from "vue";
import DcUploadAttach from "@/components/UploadAttach/index.vue";
import { FILE_URL } from "@/request";
import { GetDownMarkList } from "@/api/dictionary";
import { siteType } from "./enum";
import { ElLoading, ElMessage } from "element-plus";
import { UpdateEquipmentInfo, QueryEquipmentDetail } from "./api";
import { GetFileListByIds } from '@/api/fileApi';
import { FileAttach } from '@/utils/base-entity';
import ContributionInput from "@/views/railway/contribution/index.vue"
import { formatTime } from "@/utils";
import { element } from "@/formCreate/config";
export default defineComponent({
  name: " EquipmentEditForm",
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
    equipmentId: {
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

    const baseInfo = reactive({
      siteId: "",
      siteName: "",
      liftingWeight: "", // 起重重量
      num: "", // 数量
      efficiency: "", // 设备装卸效率
      applyScope: "", // 适用范围
      remark: "" ,// 备注
      contributor: "",
      contributionaTime: ""
    });

    // #region  设备类型
    const equipmentTypeState = reactive({
      equipmentType: "",
      equipmentTypeName: "",
      showPicker: false,
      equipmentTypeList: [] as Array<Record<"label" | "value", string>>
    });

    function getEquipmentTypeList() {
      GetDownMarkList("RailwayEquipmentType")
        .then((res: Array<Record<"label" | "value", string>>) => {
          equipmentTypeState.equipmentTypeList = res;
        })
        .catch((err) => {
          console.log(err);
        });
    }

    function changeEquipmentType(mark: string) {
      console.log(equipmentTypeState);
      equipmentTypeState.equipmentTypeName =
        equipmentTypeState.equipmentTypeList.find((e) => e.value === mark)
          ?.label || "";
    }
    // #endregion

    // #region  所属场所
    const siteTypeState = reactive({
      siteType: siteType.Enum.station.value,
      siteTypeName: siteType.Enum.station.label,
      siteTypeList: siteType.getArray()
    });
    // #endregion

    // #region 附件列表
    const uploadAction = `${FILE_URL}/demandAttach`;
    const fileAttachs = ref<Array<FileAttach>>([]);
    // #endregion

    function handleOpen() {
      const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
      baseInfo.contributionaTime = formatTime(new Date(), "yyyy-MM-dd");
      baseInfo.contributor = userInfo.given_name;
      baseInfo.siteId = props.stationId;
      baseInfo.siteName = props.stationName;
      if (props.isEdit) {
        getEquipmentDetail();
      }
    }

    // #region  保存
    const formModel = computed(() => {
      return {
        ...baseInfo,
        ...equipmentTypeState
      };
    });

    const loading = ref(false);
    const formRef = ref();
    const rules = {
      equipmentType: [
        { required: true, message: "请选择设备类型", trigger: "blur" }
      ],
      num: [{ required: true, message: "请输入数量", trigger: "blur" }],
      contributor: [{required: true, message: "请选择贡献人", trigger: "blur"}],
      contributionaTime: [{required: true, message: "请选择贡献时间", trigger: "blur"}],
    };
    async function saveEquipment() {
      await formRef.value?.validate();

      const payload = {
        ...baseInfo,
        equipmentType: equipmentTypeState.equipmentType,
        equipmentTypeName: equipmentTypeState.equipmentTypeName,
        siteType: siteTypeState.siteType,
        siteTypeName: siteTypeState.siteTypeName,
        fileAttachs: fileAttachs.value
      };
      if (props.isEdit) {
        payload["id"] = props.equipmentId;
      }
      const loading = ElLoading.service({ text: "数据保存中..." });
      UpdateEquipmentInfo(payload)
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

    // #endregion

    function getEquipmentDetail() {
      const loading = ElLoading.service({ text: "数据加载中..." });
      QueryEquipmentDetail([props.equipmentId])
        .then((res) => {
          loading.close();
          if (res.isSuccessful && Array.isArray(res.data) && res.data.length) {
            const [item] = res.data;
            baseInfo.siteId = item.siteId;
            baseInfo.siteName = item.siteName;
            baseInfo.liftingWeight = `${item.liftingWeight}`;
            baseInfo.num = `${item.num}`;
            baseInfo.efficiency = `${item.efficiency}`;
            baseInfo.applyScope = item.applyScope;
            baseInfo.remark = item.remark;
            equipmentTypeState.equipmentType = item.equipmentType;
            equipmentTypeState.equipmentTypeName = item.equipmentTypeName;
            if(item.fileAttachIds) {
              GetFileListByIds(item.fileAttachIds.split(",")).then(res=>{
                console.log(res)
                if(Array.isArray(res)) {
                  fileAttachs.value = res
                }
              })
            }
          }
        })
        .catch((err) => {
          console.log(err);
          loading.close();
        });
    }

    onMounted(() => {
      getEquipmentTypeList();
    });

    return {
      show,
      baseInfo,
      equipmentTypeState,
      changeEquipmentType,
      formModel,
      rules,
      loading,
      formRef,
      saveEquipment,
      handleOpen,
      uploadAction,
      fileAttachs
    };
  }
});
</script>
<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="show"
    :width="1000"
    title="设备信息维护"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="show = false"
  >
    <el-form
      ref="formRef"
      class="form-container"
      size="small"
      :model="formModel"
      :rules="rules"
      label-width="100px"
      label-suffix=":"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="设备类型" prop="equipmentType">
            <el-select
              v-model="equipmentTypeState.equipmentType"
              placeholder="请选择设备类型"
              style="width: 240px"
              @change="changeEquipmentType"
            >
              <el-option
                v-for="item in equipmentTypeState.equipmentTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数量" prop="num">
            <el-input
              v-model="baseInfo.num"
              type="number"
              placeholder="请填写数量"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="起重重量">
            <el-input
              v-model="baseInfo.liftingWeight"
              type="number"
              placeholder="请填写起重重量"
            >
              <template #suffix>
                <span>吨</span>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
       
        <el-col :span="12">
          <el-form-item
            label="设备装卸效率"
            label-width="10em"
          >
            <el-input
              v-model="baseInfo.efficiency"
              type="number"
              placeholder="请填写设备装卸效率"
            >
              <template #suffix>
                <span>吨/小时</span>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="附件上传">
            <dc-upload-attach v-model="fileAttachs" :action="uploadAction" accept="image/*"/>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="适用范围">
            <el-input
              v-model="baseInfo.applyScope"
              :autosize="{ minRows: 3, maxRows: 5 }"
              type="textarea"
              placeholder="请输入适用范围"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="baseInfo.remark"
              :autosize="{ minRows: 3, maxRows: 5 }"
              type="textarea"
              placeholder="请输入备注/收费说明"
            />
          </el-form-item>
        </el-col>
        <!-- 贡献人 -->
      <contribution-input style="width: 100%" v-model:contributor="baseInfo.contributor" v-model:contributionaTime="baseInfo.contributionaTime"></contribution-input>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="saveEquipment">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>
