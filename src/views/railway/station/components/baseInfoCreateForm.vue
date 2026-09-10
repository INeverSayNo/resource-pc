<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="车站信息编辑"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="showDetails = false"
  >
    <template v-if="edit">
      <el-form
        ref="formRef"
        :model="edit"
        label-width="100px"
        label-suffix=":"
        class="form-container"
        :rules="rules"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="站点名称" prop="railwayStationName">
              <el-input
                v-model="edit.railwayStationName"
                placeholder="请输入站点名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点等级" prop="stationGrade">
              <el-select
                v-model="edit.stationGrade"
                clearable
                placeholder="请选择站点等级"
              >
                <el-option
                  v-for="item in stationScaleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="站点国籍" prop="countryName">
              <el-select
                filterable
                remote
                v-model="edit.countryName"
                placeholder="请选择国籍"
                :change="changeCountry()"
              >
                <el-option
                  v-for="item in nationalityOptions"
                  :key="item.field"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="国际名称" prop="railwayStationAliasName"  v-if="isInter">
              <el-input
                v-model="edit.railwayStationAliasName"
                placeholder="请用英文或该国语言输入站点名称"
              />
            </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="站点编码" prop="railwayStationCode" v-if="!isInter">
              <el-input
                v-model="edit.railwayStationCode"
                placeholder="请输入站点编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="车站编码" prop="railwayStationDbm" v-if="!isInter">
              <el-input
                v-model="edit.railwayStationDbm"
                placeholder="请输入车站编码"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="路局" prop="railwayBureau"  v-if="!isInter">
              <el-select
                v-model="edit.railwayBureau"
                placeholder="请选择路局"
                clearable
                filterable
              >
                <el-option
                  v-for="item in bureauData"
                  :key="item.value"
                  :label="`${item.label}`"
                  :value="`${item.label}`"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="线路" prop="railwayLine"  v-if="!isInter">
              <el-input v-model="edit.railwayLine" placeholder="请输入线路" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="车站地址" prop="AddressFormat"  v-show="!isInter">
          <dc-map-select v-model:value="edit.AddressFormat"></dc-map-select>
        </el-form-item>
        <el-row><el-col :span="12">
            <el-form-item label="Lng" prop="lng"  v-if="isInter">
              <el-input-number v-model="edit.lng" placeholder="请输入站点经度" />
            </el-form-item>
        </el-col>
        <el-col :span="12">
            <el-form-item label="Lat" prop="lat"  v-if="isInter">
              <el-input-number v-model="edit.lat" placeholder="请输入站点纬度" />
            </el-form-item>
        </el-col></el-row>
        <el-form-item label="业务范围" prop="scopeOfBusiness">
          <el-input
            v-model="edit.scopeOfBusiness"
            placeholder="请输入业务范围"
            type="textarea"
            :rows="3"
            :maxlength="250"
            show-word-limit
          ></el-input>
        </el-form-item>
        <!-- <el-row>
          <el-col :span="12">
            <el-form-item label="" prop="isHyStation">
              <el-switch
                v-model="edit.isHyStation"
                active-text="是否货运站"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="" prop="isImportant">
              <el-switch
                v-model="edit.isImportant"
                active-text="是否重要站点"
              ></el-switch>
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-form-item v-if="false" label="车站等级" prop="stationGrade">
          <el-select v-model="edit.stationGrade" placeholder="请选择车站等级">
            <el-option
              v-for="item in stationGradeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属物流中心" prop="logisticCenterName"  v-show="!isInter">
          <el-select
            v-model="edit.logisticCenterName"
            value-key="id"
            filterable
            remote
            reserve-keyword
            placeholder="请输入物流中心关键字"
            @change="handleChangeLogisticCenter"
            style="width: 240px"
          >
            <el-option
              v-for="item in logisticCenterList"
              :key="item.id"
              :label="item.name"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属区域" prop="areaCompany">
          <DcAreaCompany
            v-model="edit.areaCompany"
            v-model:label="edit.areaCompanyName"
            placeholder="请选择所属区域公司"
          ></DcAreaCompany>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="区域负责人" prop="principalId">
              <DcOrgUserSelect
                v-model="edit.principalId"
                :show-tree="false"
                placeholder="请选择道臣公司负责该站点的人员"
                @change="handleChangePrincipalId"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人电话" prop="principalPhone">
              <el-input
                v-model="edit.principalPhone"
                placeholder="请输入负责人电话"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="" prop="isAgreement"  v-if="!isInter">
              <el-switch
                v-model="edit.isAgreement"
                active-text="是否与车站签订发运协议"
                @change="(val) => handleChange(val, 'isAgreement')"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col v-if="edit.isAgreement" :span="12">
            <el-form-item label="协议签订公司" prop="agreementCompany">
              <DcCompanySelect
                v-model="edit.agreementCompany"
                placeholder="请选择协议签订公司"
                @change="
                  (v, data) => {
                    if (data) edit.agreementCompanyName = data.name;
                  }
                "
              ></DcCompanySelect>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="站点类型" prop="natureType"  v-if="!isInter">
              <el-radio-group v-model="stationTypeState.natureType.value">
                <el-radio
                  v-for="item in stationTypeState.natureType.options"
                  :key="item.id"
                  :label="item.id"
                  @change="() => changeStationType(item, 'natureTypes')"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="办理种类" prop="transactType"  v-if="!isInter">
              <el-radio-group v-model="stationTypeState.transactType.value">
                <el-radio
                  v-for="item in stationTypeState.transactType.options"
                  :key="item.id"
                  :label="item.id"
                  @change="() => changeStationType(item, 'transactTypes')"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="服务对象" prop="serviceType"  v-if="!isInter">
              <el-radio-group v-model="stationTypeState.serviceType.value">
                <el-radio
                  v-for="item in stationTypeState.serviceType.options"
                  :key="item.id"
                  :label="item.id"
                  @change="() => changeStationType(item, 'serviceTypes')"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="" prop="isAdvantage"  v-if="!isInter">
              <el-switch
                v-model="edit.isAdvantage"
                active-text="是否优势站点"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col v-if="edit.isAdvantage" :span="24">
            <el-form-item label="优势内容" prop="advantageRemark">
              <el-input
                v-model="edit.advantageRemark"
                placeholder="请输入优势内容"
                :rows="3"
                type="textarea"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点性质" prop="stationNature"  v-if="!isInter">
              <el-radio-group v-model="edit.stationNature">
                <el-radio
                  v-for="item in StationNature.getArray()"
                  :key="item.id"
                  :label="item.id"
                >
                  {{ item.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="" prop="isStationary"  v-if="!isInter"> 
              <el-switch
                v-model="edit.isStationary"
                active-text="是否有驻站人员"
              ></el-switch>
            </el-form-item>
          </el-col>
          <!-- 贡献人 -->
          <!-- <contribution-input style="width: 100%" v-model:contributor="edit.contributor"
            v-model:contributionaTime="edit.contributionaTime"></contribution-input> -->
          <el-col v-if="edit.isStationary" :span="24">
            <StationaryUser
              ref="stationaryUserRef"
              :is-view="false"
              :list="stationaryUsers"
            ></StationaryUser>
          </el-col>
        </el-row>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="showDetails = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts">
import { useAnalyticsTrack } from "@/plugins/monitor";
import ContributionInput from "@/views/railway/contribution/index.vue";
import { Message } from "@/components/Message";
import {
  computed,
  reactive,
  toRefs,
  defineComponent,
  PropType,
  ref,
  onMounted
} from "vue";
import {
  RailWayStation,
  RailwayStationaryUser,
  RailwayStationCrudDto,
  StationNature,
  StationNatureTypes,
  StationServiceTypes,
  StationTransactTypes
} from "../types";
import DcMapSelect from "@/components/BmapSelect/index.vue";
import DcAreaCompany from "@/components/OrgAreaSelect/index.vue";
import DcCompanySelect from "@/components/CompanySelect/index.vue";
import DcOrgUserSelect from "@/components/TableUserSelectV2/selectField.vue";
import SupplierSelectField from "./supplierSelectField.vue";
import StationaryUser from "./stationaryUser.vue";
import { CreateStationBaseInfo } from "../api";
import { useStatisticTrace } from "@/hooks/useStatisticTrace";
import { QueryLogisticCenter } from "../../logisticCenter/api";
import { on } from "@/utils/dom-utils";
import { LogisticCenterItem } from "../../logisticCenter/type";
import { EnumItemType } from "@/utils/CustomEnum";
import { getSystemDataShow } from "@/api/systemDataShowApi";
import { NationalityOptions } from "@/views/waterway/station/store";

type stateProp = {
  edit: any;
  loading: boolean;
  bureauData: Array<any>;
};

export default defineComponent({
  name: "",
  components: {
    DcMapSelect,
    DcAreaCompany,
    DcOrgUserSelect,
    DcCompanySelect,
    SupplierSelectField,
    StationaryUser,
    ContributionInput
  },
  props: {
    modelValue: {
      type: Boolean,
      default: () => false
    },
    stationaryUsers: {
      type: Array as PropType<RailwayStationaryUser[]>,
      default: () => []
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
    const rules = reactive({
      // contributor: [{ required: true, message: "请选择贡献人", trigger: "change" }],
      // contributionaTime: [{ required: true, message: "请选择贡献时间", trigger: "change" }],
      railwayStationName: [
        { required: true, message: "请输入站点名称", trigger: "blur" }
      ],
      railwayBureau: [
        { required: true, message: "请选择路局", trigger: "blur" }
      ],
      stationGrade: [
        { required: true, message: "请选择车站等级", trigger: "blur" }
      ],
      AddressFormat: [
        { required: true, message: "请选择车站地址", trigger: "blur" }
      ],
      countryName: [
        { required: true, message: "请选择车站国籍", trigger: "blur" }
      ],
      stationNature: [
        { required: true, message: "请选择站点性质", trigger: "blur" }
      ],
      lng: [
          { required: true, message: '请输入经度', trigger: 'blur' },
          { type: 'number', min: -180, max: 180, message: '经度范围应为 -180 到 180', trigger: 'blur' },
        ],
      lat: [
          { required: true, message: '请输入纬度', trigger: 'blur' },
          { type: 'number', min: -90, max: 90, message: '纬度范围应为 -90 到 90', trigger: 'blur' },
        ]
    });
    const isInter= ref(false);
    function changeCountry() {
      if(state.edit.countryName==="中国") {
        isInter.value=false;
      } else {
        isInter.value=true;
      }
    }
    const state = reactive<stateProp>({
      edit: {} as RailwayStationCrudDto,
      loading: false,
      bureauData: []
    });
    // #endregion 站点类型
    const stationTypeState = reactive({
      natureType: {
        value: "" as string | number,
        options: StationNatureTypes.getArray()
      }, // 性质
      serviceType: {
        value: "" as string | number,
        options: StationServiceTypes.getArray()
      }, // 服务对象
      transactType: {
        value: "" as string | number,
        options: StationTransactTypes.getArray()
      } // 办理种类
    });
    const changeStationType = (
      { label, code }: EnumItemType,
      type: "natureTypes" | "transactTypes" | "serviceTypes"
    ) => {
      state.edit[type] = [{ code, name: label }];
    };
    // #endregion

    const stationaryUserRef = ref<InstanceType<typeof StationaryUser>>();
    /** 窗口打开时，加载历史数据 */
    function handleOpen() {
      businessOperationStart();
      clearForm();
    }

    /** 保存数据 */
    function handleSave() {
      if (isInter){
        state.edit.AddressFormat=state.edit.lat+","+state.edit.lng
      }
      businessOperationEnd({
        dataId: "",
        module: "铁路站点",
        page_title: "站点信息新增"
      });
      formRef.value?.validate(async (valid) => {
        if (valid) {
          const param = state.edit; 
          if (state.edit.railwayBureau) {
            const item = state.bureauData.find(
              (e) => e.label === param.railwayBureau
            );
            param.railwayBureauCode = item.value;
          }
          if (state.edit.stationGrade) {
            const items = stationScaleOptions.find(
              (e) => e.value === param.stationGrade
            );
            param.stationGradeName = items?.label;
          }
          param.address = JSON.stringify(param.AddressFormat);
          param.isHyStation = true;
          param.stationNature = 0;
          if (isInter){
            var country=nationalityOptions.value.find(
              (e) => e.label === param.countryName
            );
            // param.railwayStationCode=country?.field.toUpperCase()+"";
            param.railwayBureau='国际'+param.countryName;
            param.railwayBureauCode= country?.field.toUpperCase()+"00"
            param.lat=state.edit.lat+"";
            param.lng=state.edit.lng+"";
            param.railwayStationDbm = country?.field.toUpperCase()
          }
          state.loading = true;
          const stationaryData = stationaryUserRef.value?.GetData();
          if (!param.isStationary) {
            param.stationaryUsers = [];
          } else {
            param.stationaryUsers = stationaryData || [];
          }
          const count = param.stationaryUsers.filter((x) => !x.id).length;
          let delCount = 0;
          (props.stationaryUsers || []).forEach((x) => {
            if (!param.stationaryUsers.some((s) => s.id === x.id)) {
              delCount++;
            }
          });
          CreateStationBaseInfo("", param)
            .then((res) => {
              if (res) {
                Message.success("保存成功");
                showDetails.value = false;
                emit("success");
                if (count > 0) {
                  SetTrace(
                    "$INSERT",
                    "铁路站点",
                    "全国铁路站点",
                    "",
                    count,
                    "驻站人员"
                  );
                }
                if (delCount > 0) {
                  SetTrace(
                    "$DELETE",
                    "铁路站点",
                    "全国铁路站点",
                    "",
                    delCount,
                    "驻站人员"
                  );
                }
              }
            })
            .finally(() => {
              state.loading = false;
            });
          SetTrace("$INSERT", "铁路站点", "全国铁路站点", "");
        }
      });
    }

    const stationGradeOptions = ["特等", "一等", "二等", "三等", "四等"];

    function handleChangePrincipalId(_, data: any) {
      state.edit.principalName = data?.userName || "";
      state.edit.principalPhone = data?.phone || "";
    }
    function handleChange(
      val: boolean,
      type: "hasProxySupplier" | "isAgreement"
    ) {
      if (!val) {
        if (type === "hasProxySupplier") {
          state.edit.proxySupplierId = "";
          state.edit.proxySupplierName = "";
        }
      } else {
        if (type === "isAgreement") {
          state.edit.hasProxySupplier = false;
          state.edit.proxySupplierId = "";
          state.edit.proxySupplierName = "";
        }
      }
    }

    // 物流中心
    const logisticCenterList = ref<Array<LogisticCenterItem>>([]);

    const getAllLogisticCenterList = () => {
      QueryLogisticCenter().then((res) => {
        logisticCenterList.value = res;
      });
    };

    const handleChangeLogisticCenter = (item: LogisticCenterItem) => {
      state.edit.logisticCenterId = item.id;
      state.edit.logisticCenterName = item.name;
    };
    function clearForm() {
      state.edit = {
        railwayStationName: "",
        stationGrade: "",
        railwayStationCode: "",
        railwayStationDbm: "",
        railwayBureau: "",
        railwayLine: "",
        AddressFormat: "",
        scopeOfBusiness: "",
        isHyStation: false,
        isImportant: false,
        countryName: "",
        railwayStationAliasName: "",
        logisticCenterName: "",
        areaCompany: "",
        areaCompanyName: "",
        principalId: "",
        principalPhone: "",
        isAgreement: false,
        agreementCompany: "",
        agreementCompanyName: "",
        isAdvantage: false,
        advantageRemark: "",
        stationNature: "",
        isStationary: false,
        stationaryUsers: [],
        natureTypes: [],
        transactTypes: [],
        serviceTypes: []
      };
    }
    const nationalityOptions = ref(NationalityOptions);
    function filterNationality(query: string) {
      nationalityOptions.value = NationalityOptions.filter(
        (p) => p.label === query
      );
    }
    const stationScaleOptions = [
      { label: "核心站点", value: "Core" },
      { label: "重要站点", value: "Important" },
      { label: "普通站点", value: "Ordinary" },
      { label: "待开发站点", value: "Todo" }
    ];
    onMounted(() => {
      getSystemDataShow("RailwayBureauSelect", "").then((res) => {
        state.bureauData = res;
      });
      getAllLogisticCenterList();
    });
    return {
      ...toRefs(state),
      showDetails,
      stationGradeOptions,
      handleOpen,
      handleSave,
      handleChangePrincipalId,
      handleChange,
      stationaryUserRef,
      StationNature,
      logisticCenterList,
      handleChangeLogisticCenter,
      stationTypeState,
      StationNatureTypes,
      StationServiceTypes,
      StationTransactTypes,
      changeStationType,
      rules,
      filterNationality,
      nationalityOptions,
      stationScaleOptions,
      formRef,
      changeCountry,
      isInter
    };
  }
});
</script>

<style></style>
