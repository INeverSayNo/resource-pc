<template>
  <el-table
    :data="list"
    stripe
    :max-height="360"
    show-overflow-tooltip
    highlight-current-row
    border
  >
    <el-table-column label="专用线信息" header-align="center">
      <template #default="scoped">
        <div style="font-weight: bold">
          {{ scoped.row.name }}(
          <span class="theme-danger fw-b">{{ scoped.row.lineType }}</span>
          )
          <span v-if="scoped.row.isAgreement" class="theme-danger">
            (已签订共用协议)
          </span>
          <el-button
            type="text"
            style="color: var(--theme-color)"
            @click="handleEdit(scoped.row)"
          >
            <DAliIcon name="edit" class="" />
            编辑
          </el-button>
        </div>
        <div>
          代码：{{ scoped.row.num }}, 取货里程：{{
            scoped.row.transferMileage
          }}米
        </div>
        <div v-if="scoped.row.addressFormat?.address">
          地址：{{ scoped.row.addressFormat?.address }}
        </div>
        <div>
          联系方式：{{ scoped.row.contacts }}
          <span v-html="createPrivatePhone(scoped.row.phone).outerHTML"></span>
        </div>
        <div>收费标准：{{ scoped.row.chargeRemark }}</div>
        <div v-if="scoped.row.fileAttach?.length">
          附件信息：
          <div v-for="(item, index) in scoped.row.fileAttach" :key="item.id">
            <el-link
              type="primary"
              href="javascript:void(0);"
              :underline="false"
              @click="handleFilePreview(item)"
            >
              {{ index + 1 }}、{{ item.fileRealName }}
            </el-link>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="普通货物办理" header-align="center">
      <template #default="scoped">
        <div>
          发送品类：
          <span :class="scoped.row.sendCategory ? 'success' : ''">
            {{ scoped.row.sendCategory }}
          </span>
        </div>
        <div>
          到达品类：
          <span :class="scoped.row.arriveCategory ? 'success' : ''">
            {{ scoped.row.arriveCategory }}
          </span>
        </div>
        <div>
          超限/超重：
          <span
            class="dt-item"
            :class="`${scoped.row.overrun ? 'success' : 'danger'}`"
          >
            {{ scoped.row.overrun ? "√超限" : "×超限" }}
          </span>
          <span
            class="dt-item"
            :class="`${scoped.row.overweight ? 'success' : 'danger'}`"
          >
            {{ scoped.row.overweight ? "√超重" : "×超重" }}
          </span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="集装箱办理" header-align="center">
      <template #default="scoped">
        <div>
          发送：
          <span
            v-for="item in GetContainerScope(scoped.row.containerSendHS)"
            v-if="scoped.row.containerSendHS"
            :key="item.value"
            class="dt-item"
            :class="item.class"
          >
            {{ item.value }}
          </span>
          <span v-else>-</span>
        </div>
        <div>
          到达：
          <span
            v-for="item in GetContainerScope(scoped.row.containerArriveHS)"
            v-if="scoped.row.containerArriveHS"
            :key="item.value"
            class="dt-item"
            :class="item.class"
          >
            {{ item.value }}
          </span>
          <span v-else>-</span>
        </div>
        <div>
          货物混装：
          <span
            class="dt-item"
            :class="`${
              scoped.row.containerMixedLoading ? 'success' : 'danger'
            }`"
          >
            {{ scoped.row.containerMixedLoading ? "是" : "否" }}
          </span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="危险品办理" header-align="center">
      <template #default="scoped">
        <div v-if="scoped.row.dangerSendFilling">
          发送灌装：
          <span class="success">
            {{ scoped.row.dangerSendFilling }}
          </span>
        </div>
        <div v-if="scoped.row.dangerSendNotFilling">
          发送非灌装：
          <span class="success">{{ scoped.row.dangerSendNotFilling }}</span>
        </div>
        <div v-if="scoped.row.dangerSendContainer">
          发送集装箱：
          <span class="success">{{ scoped.row.dangerSendContainer }}</span>
        </div>
        <div v-if="scoped.row.dangerArriveFilling">
          到达灌装：
          <span class="success">{{ scoped.row.dangerArriveFilling }}</span>
        </div>
        <div v-if="scoped.row.dangerArriveNotFilling">
          到达非灌装：
          <span class="success">{{ scoped.row.dangerArriveNotFilling }}</span>
        </div>
        <div v-if="scoped.row.dangerArriveContainer">
          到达集装箱：
          <span class="success">{{ scoped.row.dangerArriveContainer }}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="起重能力" header-align="center" width="120">
      <template #default="scoped">
        <div v-if="scoped.row.maxLiftingCapacity">
          最大：{{ scoped.row.maxLiftingCapacity }}
        </div>
        <div v-if="scoped.row.forkliftLC">
          叉车：{{ scoped.row.forkliftLC }}
        </div>
        <div v-if="scoped.row.container20LC">
          20尺集装箱：{{ scoped.row.container20LC }}
        </div>
        <div v-if="scoped.row.container40LC">
          40尺集装箱：{{ scoped.row.container40LC }}
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { FileAttach } from "@/utils/base-entity";
import { fileView } from "@/utils/fileView";
import { reactive, toRefs, defineComponent, PropType } from "vue";
import { RailWayPrivatelLine } from "../types";
import { useDetails } from "../useDetails";

export default defineComponent({
  props: {
    list: {
      type: Array as PropType<Array<RailWayPrivatelLine>>,
      default: () => []
    }
  },
  emits: ["edit"],
  setup(props, { emit }) {
    const state = reactive({});
    const { GetContainerScope } = useDetails(false);
    function handleEdit(row: RailWayPrivatelLine) {
      emit("edit", row);
    }
    const handleFilePreview = (file: FileAttach) => {
      const url = file?.filePath || "";
      const fileName = file?.fileRealName || "";
      const prevewUrl = url.endsWith(".")
        ? `${url.substring(0, url.length - 1)}${file.fileType}`
        : url;
      fileView(prevewUrl, fileName);
    };

    return {
      ...toRefs(state),
      GetContainerScope,
      handleEdit,
      handleFilePreview
    };
  }
});
</script>

<style lang="less" scoped>
@import "../style.less";
</style>
