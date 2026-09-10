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
      <el-alert
        title="仅支持修改以下信息，其余信息均为数据采集不能修改！"
        :closable="false"
        type="warning"
        class="mb-10"
      />
      <el-alert
        title="如果发现禁止修改的信息有误，请联系集团信息技术部进行更新！"
        :closable="false"
        type="warning"
        class="mb-10"
      />
      <el-form
        :model="edit"
        
        label-width="100px"
        label-suffix=":"
        class="form-container"
        :rules="rules"
      >
        <el-form-item label="车站地址">
          <dc-map-select
            v-model:value="edit.AddressFormat"
            disabled
          ></dc-map-select>
        </el-form-item>
        <el-form-item label="业务范围">
          <el-input
            v-model="edit.scopeOfBusiness"
            disabled
            placeholder="请输入业务范围"
            type="textarea"
            :rows="3"
            :maxlength="250"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="">
              <el-switch
                v-model="edit.isHyStation"
                disabled
                active-text="是否货运站"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="">
              <el-switch
                v-model="edit.isImportant"
                active-text="是否重要站点"
              ></el-switch>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="false" label="车站等级">
          <el-select v-model="edit.stationGrade" placeholder="请选择车站等级">
            <el-option
              v-for="item in stationGradeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="站点别名">
          <el-input
            v-model="edit.railwayStationAliasName"
            placeholder="请输入站点别名"
          />
        </el-form-item>
        <el-form-item label="所属物流中心">
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
        <el-form-item label="所属区域">
          <DcAreaCompany
            v-model="edit.areaCompany"
            v-model:label="edit.areaCompanyName"
            :isAccessControl="false"
            placeholder="请选择所属区域公司"
          ></DcAreaCompany>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="区域负责人">
              <DcOrgUserSelect
                v-model="edit.principalId"
                :show-tree="false"
                placeholder="请选择道臣公司负责该站点的人员"
                @change="handleChangePrincipalId"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人电话">
              <el-input
                v-model="edit.principalPhone"
                placeholder="请输入负责人电话"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="">
              <el-switch
                v-model="edit.isAgreement"
                active-text="是否与车站签订发运协议"
                @change="(val) => handleChange(val, 'isAgreement')"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col v-if="!edit.isAgreement" :span="12">
            <el-form-item label="">
              <el-switch
                v-model="edit.hasProxySupplier"
                active-text="是否有可代理发运的物流供应商"
                @change="(val) => handleChange(val, 'hasProxySupplier')"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col v-if="edit.isAgreement" :span="12">
            <el-form-item label="协议签订公司">
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
          <el-col v-if="edit.hasProxySupplier" :span="12">
            <el-form-item label="代理供应商">
              <SupplierSelectField
                v-model:id="edit.proxySupplierId"
                v-model:name="edit.proxySupplierName"
                :station-id="station.id"
                :station-name="station.railwayStationName"
              ></SupplierSelectField>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="站点类型">
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
            <el-form-item label="办理种类">
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
            <el-form-item label="服务对象">
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
            <el-form-item label="">
              <el-switch
                v-model="edit.isAdvantage"
                active-text="是否优势站点"
              ></el-switch>
            </el-form-item>
          </el-col>
          <el-col v-if="edit.isAdvantage" :span="24">
            <el-form-item label="优势内容">
              <el-input
                v-model="edit.advantageRemark"
                placeholder="请输入优势内容"
                :rows="3"
                type="textarea"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="站点性质">
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
            <el-form-item label="">
              <el-switch
                v-model="edit.isStationary"
                active-text="是否有驻站人员"
              ></el-switch>
            </el-form-item>
          </el-col>
          <!-- 贡献人 -->
          <contribution-input
            style="width: 100%"
            v-model:contributor="edit.contributor"
            v-model:contributionaTime="edit.contributionaTime"
          ></contribution-input>
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
import { GetAddress, formatTime } from "@/utils";
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
import { SetStationBaseInfo } from "../api";
import { useStatisticTrace } from "@/hooks/useStatisticTrace";
import { QueryLogisticCenter } from "../../logisticCenter/api";
import { on } from "@/utils/dom-utils";
import { LogisticCenterItem } from "../../logisticCenter/type";
import { EnumItemType } from "@/utils/CustomEnum";
import { DcDeep } from "@dczy/tie-tools";

type stateProp = {
  edit: RailwayStationCrudDto;
  loading: boolean;
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
    station: {
      type: Object as PropType<RailWayStation>,
      default: () => {}
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
    const rules = {
      contributor: [
        { required: true, message: "请选择贡献人", trigger: "change" }
      ],
      contributionaTime: [
        { required: true, message: "请选择贡献时间", trigger: "change" }
      ]
    };
    const state = reactive<stateProp>({
      edit: {} as RailwayStationCrudDto,
      loading: false
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

      if (props.station?.id) {
        const {
          address,
          scopeOfBusiness,
          stationGrade,
          isHyStation,
          railwayLocation,
          areaCompany,
          areaCompanyName,
          principalId,
          principalName,
          principalPhone,
          isAgreement,
          agreementCompany,
          agreementCompanyName,
          hasProxySupplier,
          proxySupplierId,
          proxySupplierName,
          isAdvantage,
          advantageRemark,
          isStationary,
          isImportant,
          stationNature,
          logisticCenterName,
          logisticCenterId,
          natureTypesFormat,
          serviceFormat,
          transactFormat,
          railwayStationAliasName
        } = props.station;
        state.edit = {
          address,
          scopeOfBusiness,
          stationGrade,
          isHyStation,
          areaCompany,
          areaCompanyName,
          principalId,
          principalName,
          principalPhone,
          isAgreement,
          agreementCompany,
          agreementCompanyName,
          hasProxySupplier,
          proxySupplierId,
          proxySupplierName,
          isAdvantage,
          advantageRemark,
          isStationary,
          isImportant,
          stationNature,
          logisticCenterName,
          logisticCenterId,
          contributor: "",
          contributionaTime: "",
          railwayStationAliasName,
          natureTypes: natureTypesFormat,
          serviceTypes: serviceFormat,
          transactTypes: transactFormat,
          stationaryUsers: DcDeep.clone<RailwayStationaryUser[]>(
            props.stationaryUsers
          ),
          AddressFormat: GetAddress(address, true)
        };
        if (!address && railwayLocation) {
          const ary = railwayLocation.split(",");
          state.edit.AddressFormat = {
            address: "",
            lat: ary[1],
            lng: ary[0]
          };
        }
        if (natureTypesFormat) {
          stationTypeState.natureType.value =
            StationNatureTypes.getArray().find(
              (e) => e.label === natureTypesFormat[0].name
            )!.id;
        }
        if (serviceFormat) {
          stationTypeState.serviceType.value =
            StationServiceTypes.getArray().find(
              (e) => e.label === serviceFormat[0].name
            )!.id;
        }
        if (transactFormat) {
          stationTypeState.transactType.value =
            StationTransactTypes.getArray().find(
              (e) => e.label === transactFormat[0].name
            )!.id;
        }
      } else {
        Message.warning("请选择正确的车站信息");
      }
      const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
      state.edit.contributionaTime = formatTime(new Date(), "yyyy-MM-dd");
      state.edit.contributor = userInfo.given_name;
    }

    /** 保存数据 */
    function handleSave() {
      if (
        state.edit.contributor === "" ||
        state.edit.contributor === null ||
        state.edit.contributor === undefined
      ) {
        Message.warning("请选择贡献人");
        return;
      }
      if (
        state.edit.contributionaTime === "" ||
        state.edit.contributionaTime === null ||
        state.edit.contributionaTime === undefined
      ) {
        Message.warning("请选择贡献时间");
        return;
      }
      businessOperationEnd({
        dataId: props.station.id,
        module: "铁路站点",
        page_title: "站点信息编辑"
      });
      const param = DcDeep.clone<RailwayStationCrudDto>(state.edit);
      param.address = JSON.stringify(param.AddressFormat);
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
      SetStationBaseInfo(props.station.id, param)
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
                props.station.id,
                count,
                "驻站人员"
              );
            }
            if (delCount > 0) {
              SetTrace(
                "$DELETE",
                "铁路站点",
                "全国铁路站点",
                props.station.id,
                delCount,
                "驻站人员"
              );
            }
          }
        })
        .finally(() => {
          state.loading = false;
        });
      SetTrace("$UPDATE", "铁路站点", "全国铁路站点", props.station.id);
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

    onMounted(() => {
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
      rules
    };
  }
});
</script>

<style></style>
