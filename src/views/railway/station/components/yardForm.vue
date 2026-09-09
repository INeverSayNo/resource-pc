<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="visable"
    :width="1000"
    :title="title"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @opened="handleOpen"
    @close="visable = false"
  >
    <el-form
      v-if="edit"
      class="form-container"
      :model="edit"
      size="small"
      label-suffix=":"
      label-width="110px"
    >
      <el-form-item label="办理范围">
        <el-input
          v-model="edit.handleScope.scope"
          placeholder="请输入办理范围"
        ></el-input>
      </el-form-item>
      <el-form-item label="" label-width="110px">
        <el-checkbox-group v-model="scopeAttr">
          <el-checkbox
            v-for="item in scopeOption"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="集装箱发送">
        <el-select
          v-model="containerSend"
          multiple
          filterable
          clearable
          placeholder="请选择集装箱发送办理范围"
        >
          <el-option
            v-for="item in containerOption"
            :key="item.field"
            :label="item.label"
            :value="item.field"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="集装箱到达">
        <el-select
          v-model="containerArrive"
          multiple
          filterable
          clearable
          placeholder="请选择集装箱到达办理范围"
        >
          <el-option
            v-for="item in containerOption"
            :key="item.field"
            :label="item.label"
            :value="item.field"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="" label-width="110px">
        <el-checkbox v-model="edit.containerMixedLoading" :label="true">
          集装箱货物混装
        </el-checkbox>
      </el-form-item>
      <!-- 贡献人 -->
      <contribution-input style="width: 100%" v-model:contributor="edit.contributor" v-model:contributionaTime="edit.contributionaTime"></contribution-input>
      <DcGap class="mb-05">
        暂存费收费标准
        <span class="fr theme-color cu-pointer" @click="handleAddCharge">
          <DLegacyIcon name="plus" class="" />
          新增行
        </span>
        <span
          class="fr mr-10 theme-danger cu-pointer"
          @click="handleDeleteCharge"
        >
          <DLegacyIcon name="delete" class="" />
          删除选中
        </span>
      </DcGap>
      <el-table
        :data="edit.yardChargeItem"
        size="small"
        border
        stripe
        highlight-current-row
        @selection-change="handleTableSelectionCharge"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column
          label="办理类型"
          header-align="center"
          width="160"
          prop="chargeType"
        >
          <template #default="scoped">
            <el-select
              v-model="scoped.row.chargeType"
              size="small"
              placeholder="请选择办理类型"
              @change="(val) => handleChargeTypeChange(val, scoped.row)"
            >
              <el-option
                v-for="item in YardChargeType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="免费时间" width="250" header-align="center">
          <template #default="scoped">
            <el-input
              v-model="scoped.row.freeTime"
              size="small"
              placeholder="请输入免费时间"
            >
              <template #append>
                <el-select
                  v-model="scoped.row.freeTimeUnit"
                  size="small"
                  style="width: 80px !important"
                  placeholder="单位"
                >
                  <el-option label="小时" value="小时">小时</el-option>
                  <el-option label="天" value="天">天</el-option>
                </el-select>
              </template>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column label="超期收费标准" width="250" header-align="center">
          <template #default="scoped">
            <el-input
              v-model="scoped.row.overdueFee"
              type="number"
              size="small"
              placeholder="请输入超期收费标准"
            >
              <template #append>
                <el-select
                  v-model="scoped.row.overdueFeeUnit"
                  size="small"
                  style="width: 100px !important"
                  placeholder="单位"
                >
                  <el-option label="元/吨.天" value="元/吨.天">
                    元/吨.天
                  </el-option>
                  <el-option label="元/箱.天" value="元/箱.天">
                    元/箱.天
                  </el-option>
                  <el-option label="元/车.天" value="元/车.天">
                    元/车.天
                  </el-option>
                </el-select>
              </template>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column label="收费说明" header-align="center">
          <template #default="scoped">
            <el-input
              v-model="scoped.row.chargeRemark"
              size="small"
              show-word-limit
              placeholder="请输入收费说明"
            ></el-input>
          </template>
        </el-table-column>
      </el-table>
      <DcGap class="mb-05">起重能力</DcGap>
      <el-row>
        <el-col :span="12">
          <el-form-item label="最大">
            <el-input
              v-model="edit.maxLiftingCapacity"
              type="number"
              placeholder="请输入最大起重能力"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="叉车">
            <el-input
              v-model="edit.forkliftLC"
              type="number"
              placeholder="请输入叉车起重能力"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="20尺集装箱">
            <el-input
              v-model="edit.container20LC"
              type="number"
              placeholder="请输入20尺集装箱起重能力"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="40尺集装箱">
            <el-input
              v-model="edit.container40LC"
              type="number"
              placeholder="请输入40尺集装箱起重能力"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <DcGap class="mb-05">
        危险品办理
        <span class="fr theme-color cu-pointer" @click="handleAdd">
          <DLegacyIcon name="plus" class="" />
          新增行
        </span>
        <span class="fr mr-10 theme-danger cu-pointer" @click="handleDelete">
          <DLegacyIcon name="delete" class="" />
          删除选中
        </span>
      </DcGap>
      <el-table
        :data="edit.danger"
        size="small"
        border
        stripe
        highlight-current-row
        @selection-change="handleTableSelection"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column
          width="150"
          label="办理类型"
          header-align="center"
          prop="type"
        >
          <template #default="scoped">
            <el-input
              v-model="scoped.row.type"
              size="small"
              placeholder="请输入办理类型"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="发送货物" header-align="center" prop="fsInfo">
          <template #default="scoped">
            <el-input
              v-model="scoped.row.fsInfo"
              size="small"
              placeholder="请输入发送货物"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column label="到达货物" header-align="center" prop="ddInfo">
          <template #default="scoped">
            <el-input
              v-model="scoped.row.ddInfo"
              size="small"
              placeholder="请输入到达货物"
            ></el-input>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <template #footer>
      <el-button @click="visable = false">取消</el-button>
      <el-button type="primary" :loading="saveLoading" @click="handleSave">
        保存
      </el-button>
    </template>
  </com-dialog>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from "vue";
import {
  DangerScope,
  RailWayGoodsYard,
  YardChargeItem,
  YardHandleScope
} from "../types";
import { deepClone, guid, formatTime } from "@/utils";
import { UpdateGoodsYard } from "../api";
import { ContainerType, YardChargeType } from "../store";
import { useStatisticTrace } from "@/hooks/useStatisticTrace";
import { Message } from "@/components/Message";
import { ElMessageBox } from "element-plus";
import DcGap from "@/components/Gap/index.vue";
import { useAnalyticsTrack } from "@/plugins/monitor";
import ContributionInput from "@/views/railway/contribution/index.vue"

const props = defineProps({
  show: {
    type: Boolean,
    default: () => false
  },
  title: {
    type: String,
    default: () => "货场信息编辑"
  },
  data: {
    type: Object as PropType<RailWayGoodsYard>,
    default: () => {
      return {};
    }
  }
});
const emits = defineEmits(["update:show", "success"]);
const visable = computed({
  get: () => props.show,
  set: (val) => {
    emits("update:show", val);
  }
});
const { businessOperationStart, businessOperationEnd } = useAnalyticsTrack();

const { SetTrace } = useStatisticTrace();
const scopeOption = ref([
  { label: "零散", value: "lshw" },
  { label: "批量散货", value: "pllshw" },
  { label: "超重", value: "cz" },
  { label: "超限", value: "cx" },
  { label: "货物混装", value: "hwhz" }
]);
const containerOption = ContainerType.filter((x) => x.label);
const edit = ref<RailWayGoodsYard>({
  handleScope: {} as YardHandleScope,
  danger: [] as DangerScope[],
  yardChargeItem: [] as YardChargeItem[]
} as RailWayGoodsYard);
const scopeAttr = ref<string[]>([]);
const containerSend = ref<string[]>([]);
const containerArrive = ref<string[]>([]);
const currentRows = ref<DangerScope[]>([]);
const currentChargeRows = ref<YardChargeItem[]>([]);
const saveLoading = ref(false);
function handleOpen() {
  businessOperationStart();
  const dataTemp = deepClone<RailWayGoodsYard>(props.data);
  dataTemp.danger?.forEach((d) => {
    d._gId = guid();
  });
  dataTemp.yardChargeItem?.forEach((d) => {
    d._gId = guid();
  });
  if (!dataTemp.handleScope) {
    dataTemp.handleScope = {} as YardHandleScope;
  }
  const userInfo = JSON.parse(localStorage.getItem("CurUser") || "{}");
  dataTemp.contributor = userInfo.given_name;
  dataTemp.contributionaTime = formatTime(new Date(), "yyyy-MM-dd");
  edit.value = dataTemp;
  scopeAttr.value = [];
  const temp: string[] = [];
  if (props.data.handleScope) {
    Object.keys(props.data.handleScope).forEach((key) => {
      const value = props.data.handleScope[key];
      if (typeof value === "boolean" && value) {
        temp.push(key);
      }
    });
  }
  containerArrive.value = props.data?.containerArriveHS?.split(",") || [];
  containerSend.value = props.data?.containerSendHS?.split(",") || [];
  scopeAttr.value = temp;
  
}
// #region 危险品办理范围操作
function handleTableSelection(rows: DangerScope[]) {
  currentRows.value = rows;
}
function handleAdd() {
  if (!edit.value?.danger) {
    edit.value!.danger = [];
  }
  edit.value?.danger.push({
    _gId: guid(),
    type: "",
    ddInfo: "",
    fsInfo: ""
  });
}
function handleDelete() {
  if (!currentRows.value.length) {
    Message.warning("请选中需要删除的行!");
    return;
  }
  ElMessageBox.confirm(
    "是否删除选中行的信息，删除后不能恢复!",
    "提示信息"
  ).then(() => {
    const temp = deepClone<DangerScope[]>(edit.value?.danger || []);
    const result: DangerScope[] = temp.filter(
      (x) => !currentRows.value.some((c) => c._gId === x._gId)
    );
    edit.value!.danger = result;
  });
}
// #endregion
// #region 收费标准操作
function handleChargeTypeChange(val: string, row: YardChargeItem) {
  const chargeType = YardChargeType.find((x) => x.value === val);
  row.overdueFeeUnit = chargeType?.unit || "";
}
function handleTableSelectionCharge(rows: YardChargeItem[]) {
  currentChargeRows.value = rows;
}
function handleAddCharge() {
  if (!edit.value?.yardChargeItem) {
    edit.value!.yardChargeItem = [];
  }
  edit.value?.yardChargeItem.push({
    _gId: guid(),
    chargeType: "",
    freeTimeUnit: "小时",
    overdueFeeUnit: "",
    chargeRemark: ""
  });
}
function handleDeleteCharge() {
  if (!currentChargeRows.value.length) {
    Message.warning("请选中需要删除的行!");
    return;
  }
  ElMessageBox.confirm(
    "是否删除选中行的信息，删除后不能恢复!",
    "提示信息"
  ).then(() => {
    const temp = deepClone<YardChargeItem[]>(edit.value?.yardChargeItem || []);
    const result: YardChargeItem[] = temp.filter(
      (x) => !currentChargeRows.value.some((c) => c._gId === x._gId)
    );
    edit.value!.yardChargeItem = result;
  });
}
// #endregion

function handleSave() {
  if (edit.value?.contributor===''||edit.value?.contributor===null||edit.value?.contributor===undefined){
        Message.warning("请选择贡献人")
        return
      }
      if (edit.value?.contributionaTime===''||edit.value?.contributionaTime===null||edit.value?.contributionaTime===undefined){
        Message.warning("请选择贡献时间")
        return
      }
  businessOperationEnd({
    dataId: props.data.stationId,
    module: "铁路站点",
    page_title: "货场信息维护"
  });
  if (!edit.value) {
    Message.warning("数据错误，请填写表单信息!");
    return;
  }
  const temp = deepClone<RailWayGoodsYard>(edit.value);
  /** 重置 */
  scopeOption.value.forEach((x) => {
    temp.handleScope[x.value] = false;
  });
  scopeAttr.value.forEach((x) => {
    temp.handleScope[x] = true;
  });
  temp.containerArriveHS = containerArrive.value.join(",");
  temp.containerSendHS = containerSend.value.join(",");
  temp.danger = temp.danger?.filter((x) => x.ddInfo || x.fsInfo);
  saveLoading.value = true;
  try {
    UpdateGoodsYard(temp)
      .then((res) => {
        if (res) {
          Message.success("保存成功");
          emits("success");
          visable.value = false;
        }
      })
      .finally(() => {
        SetTrace("$UPDATE", "铁路站点", "全国铁路站点", props.data.stationId);
        saveLoading.value = false;
      });
  } catch {
    saveLoading.value = false;
  }
}
</script>

<style lang="less" scoped></style>
