<script lang="ts">
import {
  PropType,
  defineComponent,
  computed,
  ref,
  reactive,
  onMounted
} from "vue";
import { GetDownMarkList } from "@/api/dictionary";
import DcMapSelect from "@/components/BmapSelect/index.vue";
import UserSelectV2 from "@/components/TableUserSelectV2/selectField.vue";
import { WarehouseType } from "./enum";
import { validatePhone, formatTime } from "@/utils";
import { ElLoading, ElMessage } from "element-plus";
import { QueryWarehouseDetail, UpdateWarehouseInfo } from "./api";
import ContributionInput from "@/views/railway/contribution/index.vue"
import baseInfoFormVue from "../../waterway/station/components/baseInfoForm.vue";

export default defineComponent({
  name: "WarehouseEditForm",
  components: {
    DcMapSelect,
    UserSelectV2,
    ContributionInput
  },
  props: {
    warehouseId: {
      type: String as PropType<string>,
      default: ""
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
    visible: {
      type: Boolean as PropType<boolean>,
      default: false
    }
  },
  emits: ["update:visible", "reload"],
  setup(props, { emit }) {
    const show = computed({
      get: () => props.visible,
      set: (val) => {
        emit("update:visible", val);
      }
    });

    function handleOpen() {
      affiliationState.waType = props.stationId ? "站点" : "公司";
      affiliationState.afId = props.stationId || "";
      affiliationState.afName = props.stationName || "";
      if (props.isEdit) {
        getWareHouseDetail();
      }
      const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
      baseInfo.contributionaTime = formatTime(new Date(), "yyyy-MM-dd");
      baseInfo.contributor = userInfo.given_name;
    }

    const baseInfo = reactive({
      name: "",
      area: "",
      // volume: "",
      height: "",
      freeDays: "",
      price: "",
      remark: "",
      contacts: "", // 负责人
      phone: "", // 负责人电话
      principalId: "" as any, // 对接人
      principalName: "", // 对接人电话
      principalPhone: "",
      contributor: '',
      contributionaTime: ''
    });

    const principalVisable = ref(false);
    function selectPrincipalInfo(id: string, payload: any) {
      baseInfo.principalId = id;
      baseInfo.principalName = payload.userName;
      baseInfo.principalPhone = payload.phone;
    }

    // #region 单价与单位
    const unitState = reactive({
      unit: "",
      showPicker: false,
      unitList: ["元/天.吨", "元/天.平方米"]
    });

    // #endregion

    // #region 仓库类型
    const typeMarkState = reactive({
      typeMark: "",
      typeName: "",
      typeList: WarehouseType.getArray()
    });

    function changeWarehouseType(payload: string) {
      typeMarkState.typeMark = typeMarkState.typeList.find(
        (e) => e.label === payload
      )?.value;
    }

    // #endregion

    // #region 仓库性质
    const natureMarkState = reactive({
      natureMark: [] as Array<string>,
      natureName: [] as Array<string>,
      natureList: [] as Array<Record<"label" | "value", string>>
    });

    function getNatureMarkList() {
      GetDownMarkList("WarehouseTypeMarks")
        .then((res: Array<Record<"label" | "value", string>>) => {
          natureMarkState.natureList = res;
        })
        .catch((err) => {
          console.log(err);
        });
    }

    function changeNatureMark(payload: Array<string>) {
      natureMarkState.natureMark = natureMarkState.natureList
        .filter((e) => payload.some((label) => label === e.label))
        .map((e) => e.value);
    }

    // #endregion

    // #region 仓库地址
    const addressState = reactive({
      address: "",
      lat: "",
      lng: ""
    });

    function changeAddress(
      address: string,
      lat: string,
      lng: string,
      regionName: string,
      adt: any
    ) {
      addressState.address = `${adt.province}${adt.city}${adt.district}${adt.town}${adt.street}${adt.street_number}`;
      addressState.lat = lat;
      addressState.lng = lng;
    }

    // #endregion

    // #region 归属单位
    const affiliationState = reactive({
      waType: "公司",
      waTypeList: ["公司", "站点"].map((e) => {
        return { value: e, label: e };
      }),
      afId: "",
      afName: ""
    });

    function changeStation(queryName: string, payload) {
      if (Reflect.has(payload, "Id")) {
        affiliationState.afId = payload.Id;
        affiliationState.afName = payload.RailwayStationName;
      }
    }

    function changeWaType(payload: string) {
      if (payload === "公司") {
        affiliationState.afId = "";
        affiliationState.afName = "";
      }
    }
    //#endregion

    //#region 保存
    const loading = ref(false);
    const formRef = ref();
    async function saveWarehouse() {
      await formRef.value?.validate();

      const payload = {
        ...baseInfo,
        address: addressState,
        unit: unitState.unit,
        typeMark: typeMarkState.typeMark,
        typeName: typeMarkState.typeName,
        natureMark: natureMarkState.natureMark.join(","),
        natureName: natureMarkState.natureName.join(","),
        affiliation: {
          waType: affiliationState.waType,
          afId: affiliationState.afId,
          afName: affiliationState.afName
        }
      };
      if (props.isEdit) {
        payload["id"] = props.warehouseId;
      }
      const loading = ElLoading.service({ text: "数据保存中..." });
      UpdateWarehouseInfo(payload)
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

    const formModel = computed(() => {
      return {
        ...baseInfo,
        ...addressState,
        ...typeMarkState,
        ...unitState,
        ...natureMarkState
      };
    });
    const rules = {
      name: [{ required: true, message: "请输入仓库名称", trigger: "blur" }],
      address: [
        { required: true, message: "请选择仓库所在地", trigger: "blur" }
      ],
      area: [{ required: true, message: "请输入仓库面积", trigger: "blur" }],
      height: [{ required: true, message: "请输入首层层高", trigger: "blur" }],
      freeDays: [
        { required: true, message: "请输入仓库免堆期", trigger: "blur" }
      ],
      price: [{ required: true, message: "请输入仓库单价", trigger: "blur" }],
      unit: [{ required: true, message: "请选择单价单位", trigger: "blur" }],
      typeName: [
        { required: true, message: "请选择仓库类型", trigger: "blur" }
      ],
      natureName: [
        { required: true, message: "请选择仓库性质", trigger: "blur" }
      ],
      contacts: [
        { required: true, message: "请输入负责人姓名", trigger: "blur" }
      ],
      phone: [
        {
          validator: validatePhone,
          message: "请正确输入负责人联系方式",
          trigger: "blur"
        }
      ],
      contributor: [{required: true, message: "请选择贡献人", trigger: "blur"}],
      contributionaTime: [{required: true, message: "请选择贡献时间", trigger: "blur"}],
    };
    //#endregion

    function getWareHouseDetail() {
      const loading = ElLoading.service({ text: "数据加载中..." });
      QueryWarehouseDetail(props.warehouseId)
        .then((res) => {
          loading.close();
          if (res.isSuccessful) {
            baseInfo.name = res.data.name;
            baseInfo.area = `${res.data.area || 0}`;
            // baseInfo.volume = `${res.data.volume || 0}`;
            baseInfo.height = `${res.data?.height || 0}`;
            baseInfo.freeDays = `${res.data.freeDays || 0}`;
            baseInfo.price = `${res.data.price || 0}`;
            baseInfo.remark = res.data.remark;
            baseInfo.contacts = res.data.contacts;
            baseInfo.phone = res.data.phone;
            baseInfo.principalId = res.data.principalId;
            baseInfo.principalName = res.data.principalName;
            baseInfo.principalPhone = res.data.principalPhone;

            unitState.unit = res.data.unit;
            typeMarkState.typeMark = res.data.typeMark;
            typeMarkState.typeName = res.data.typeName;

            natureMarkState.natureMark = res.data.natureMark?.split(",") || [];
            natureMarkState.natureName = res.data.natureName
              ? res.data.natureName?.split(",")
              : [];

            Object.assign(addressState, res.data.address || {});
          }
        })
        .catch((err) => {
          console.log(err);
          loading.close();
        });
    }

    onMounted(() => {
      getNatureMarkList();
    });

    return {
      show,
      handleOpen,
      formRef,
      formModel,
      rules,
      baseInfo,
      addressState,
      unitState,
      typeMarkState,
      natureMarkState,
      loading,
      saveWarehouse,
      principalVisable,
      selectPrincipalInfo,
      changeWarehouseType,
      changeNatureMark,
      changeAddress,
      affiliationState,
      changeWaType,
      changeStation
    };
  }
});
</script>
<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="show"
    :width="1000"
    title="仓库/堆场信息维护"
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
          <el-form-item label="仓库名称" prop="name">
            <el-input
              v-model="baseInfo.name"
              placeholder="请输入仓库名称"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓库地址" prop="address">
            <dc-map-select
              v-model:value="addressState"
              @change="changeAddress"
            ></dc-map-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="面积" prop="area">
            <el-input
              v-model="baseInfo.area"
              type="number"
              placeholder="请填写面积"
            >
              <template #suffix>
                <span>㎡</span>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="首层层高" prop="height">
            <el-input
              v-model="baseInfo.height"
              type="number"
              placeholder="请填写首层层高"
            >
              <template #suffix>
                <span>m</span>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="免堆期" prop="freeDays">
            <el-input
              v-model="baseInfo.freeDays"
              type="number"
              placeholder="请填写免堆期"
            >
              <template #suffix>
                <span>天</span>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单价" prop="price">
            <el-input
              v-model="baseInfo.price"
              type="number"
              placeholder="请填写单价"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单价单位" prop="unit">
            <el-radio-group v-model="unitState.unit">
              <el-radio
                v-for="item in unitState.unitList"
                :key="item"
                :label="item"
              />
            </el-radio-group>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="归属单位" prop="waType">
            <el-radio-group
              v-model="affiliationState.waType"
              @change="changeWaType"
            >
              <el-radio
                v-for="item in affiliationState.waTypeList"
                :key="item"
                :label="item.label"
              />
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            v-if="affiliationState.waType === '站点'"
            label="站点名称"
            prop="afName"
          >
            <DcRailwayStation
              v-model="affiliationState.afName"
              :show-unknown="false"
              placeholder="请选择站点"
              @change="changeStation"
            ></DcRailwayStation>
          </el-form-item>
          <el-form-item v-else label="公司名称" prop="afName">
            <el-input
              v-model="affiliationState.afName"
              placeholder="请输入公司名称"
            ></el-input>
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="仓库类型" prop="typeName">
            <el-radio-group
              v-model="typeMarkState.typeName"
              @change="changeWarehouseType"
            >
              <el-radio
                v-for="item in typeMarkState.typeList"
                :key="item"
                :label="item.label"
                :value="item.id"
              />
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓库性质" prop="natureMark">
            <el-checkbox-group
              v-model="natureMarkState.natureName"
              @change="changeNatureMark"
            >
              <el-checkbox
                v-for="item in natureMarkState.natureList"
                :key="item"
                :label="item.label"
                :value="item.value"
              />
            </el-checkbox-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="仓库负责人" prop="contacts">
            <el-input
              v-model="baseInfo.contacts"
              placeholder="请输入负责人姓名"
            ></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="负责人联系方式" prop="phone" label-width="10em">
            <el-input
              v-model="baseInfo.phone"
              placeholder="请输入负责联系方式"
              type="tel"
              maxlength="11"
              minlength="8"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="我方对接人" >
            <UserSelectV2
              v-model="baseInfo.principalId"
              placeholder="选择我方对接人"
              @change="selectPrincipalInfo"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="对接人联系方式"
            prop="principalPhone"
            label-width="10em"
          >
            <el-input
              v-model="baseInfo.principalPhone"
              type="tel"
              maxlength="11"
              minlength="8"
              placeholder="请输入我方对接人联系方式"
            ></el-input>
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
      <el-button type="primary" :loading="loading" @click="saveWarehouse">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>
