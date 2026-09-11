<script lang="tsx">
import { computed, defineComponent, ref, PropType, watch } from "vue";
import {
  mainDetailsCols,
  detailsTableCols2
} from "@/views/railway/good-price-policy/tableSetting";
import DcHighlight from "@/components/Highlight/index.vue";
import { RailwayPolicyItemNew } from "../types";
import { getPolicyDetails } from "../../good-price-policy/api";
import TableColumn from "@/components/DCLayout/TableColumn.vue";
import DcGap from "@/components/Gap/index.vue";
import DynamicPolicyDetailItem from "./dynamicPolicyDetailItem.vue";
import { normalizePolicyDetails } from "../../good-price-policy/logic";
import type { PricePolicyResult } from "../../good-price-policy/types";

export default defineComponent({
  name: "PolicyDetailDialog",
  components: {
    DcHighlight,
    TableColumn,
    DcGap,
    DynamicPolicyDetailItem
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    policyDetail: {
      type: Object as PropType<RailwayPolicyItemNew>,
      default: () => ({})
    }
  },
  emits: ["update:visible", "showSenderInfo"],
  setup(props, { emit }) {
    const showDetails = computed({
      get: () => props.visible,
      set: (v) => emit("update:visible", v)
    });

    const showDtData = computed(() => {
      const { policyDetail } = props;
      const showData: any = [];
      if (mainDetailsCols && policyDetail) {
        for (const key in mainDetailsCols) {
          if (!mainDetailsCols[key].hidden) {
            const _key: any = mainDetailsCols[key].name;
            const span = parseInt(mainDetailsCols[key].span + "" || "1");
            let value = policyDetail[_key];
            if (mainDetailsCols[key]?.dtFormatter) {
              value = (mainDetailsCols[key] as any).dtFormatter(
                policyDetail[_key],
                policyDetail
              );
            } else {
              if (mainDetailsCols[key]?.formatter) {
                try {
                  value = (mainDetailsCols[key] as any).formatter(
                    policyDetail[_key],
                    policyDetail,
                    {}
                  );
                } catch (error) {
                  value = (mainDetailsCols[key] as any).formatter(
                    policyDetail,
                    key,
                    policyDetail[_key]
                  );
                }
              }
            }
            showData.push({
              name: mainDetailsCols[key].name,
              columnName: key,
              label: mainDetailsCols[key].label,
              value: value,
              icon: mainDetailsCols[key].icon || "",
              span: span,
              type: mainDetailsCols[key].type || "html",
              minWidth: mainDetailsCols[key].dtItemMinWidth || ""
            });
          }
        }

        return showData;
      } else {
        return [{ label: "数据错误", value: "", span: 1 }];
      }
    });

    const gethighlightText_detail = computed(() => {
      return (item) => {
        if (item.isHighlight) {
          const text = item.formatter
            ? item.formatter(item.value, item)
            : item.value;
          if (text) {
            const keys = [] as any;
            keys.push(text);
            return keys;
          } else return [];
        } else {
          return [];
        }
      };
    });

    const loading = ref(false);
    const detailInfo = ref<PricePolicyResult[]>([]);
    const getPolicyDetailById = async (payload: RailwayPolicyItemNew) => {
      if (!Reflect.has(payload || {}, "policyId")) return;
      loading.value = true;
      const [error, result] = await getPolicyDetails(props.policyDetail.policyId);
      if (!error) detailInfo.value = normalizePolicyDetails(result);
      loading.value = false;
    };
    const handleShowSendInfo = (senderName: string) => {
      // Emit an event to show sender info
      emit("showSenderInfo", senderName);
    }

    watch(() => props.policyDetail, getPolicyDetailById);

    return {
      showDetails,
      mainDetailsCols,
      showDtData,
      gethighlightText_detail,
      detailsTableCols2,
      loading,
      detailInfo,
      handleShowSendInfo
    };
  }
});
</script>
<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="优价详情"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="showDetails = false"
  >
    <el-descriptions
      v-if="mainDetailsCols && mainDetailsCols.length > 0"
      class="margin-top policy-detail-dialog-el-descriptions"
      :column="4"
      
      direction="horizontal"
      border
    >
      <template v-for="(item, index) in showDtData" :key="index">
        <el-descriptions-item :span="item.span">
          <template #label>
            <i v-if="item.icon" :class="item.icon" />
            {{ item.label }}
          </template>
          <div :style="item.minWidth ? `min-width:${item.minWidth}px` : ''">
            <span
              v-if="item.type === 'html'"
              class="html"
              v-html="
                item.formatter ? item.formatter(item.value, item) : item.value
              "
            />
            <div v-else-if="item.type === 'slot'" class="html">
              <DynamicPolicyDetailItem
                :item="item"
                :policy-detail="policyDetail"
                @show-sender-info="handleShowSendInfo"
              ></DynamicPolicyDetailItem>
            </div>
            <span v-else-if="item.type === 'img-upload'">
              <file-down-view
                v-for="(file, idx) in item.value"
                :key="idx"
                :text="file.name"
                :path="file.url"
                :down="true"
              />
            </span>
            <span v-else-if="item.isHighlight">
              <dc-highlight
                tag="span"
                :keys="gethighlightText_detail(item)"
                color="red"
              >
                {{
                  item.formatter ? item.formatter(item.value, item) : item.value
                }}
              </dc-highlight>
            </span>
            <span v-else>
              {{
                item.formatter ? item.formatter(item.value, item) : item.value
              }}
            </span>
          </div>
        </el-descriptions-item>
      </template>
    </el-descriptions>
    <div v-if="policyDetail.policyExs?.length" class="mb-10">
      <DcGap class="mt-05">保量信息</DcGap>
      <PolicyExTable :ex-list="policyDetail.policyExs"></PolicyExTable>
    </div>
    <DcGap class="mt-05">其他费用下浮明细</DcGap>
    <el-table
      v-loading="loading"
      :data="detailInfo"
      border
      stripe
      highlight-current-row
    >
      <el-table-column
        label="序号"
        align="center"
        width="60"
        type="index"
      ></el-table-column>
      <TableColumn :columns="detailsTableCols2">
        <template #coefficient="scoped">
          <span class="theme-danger">
            <DAliIcon
              class="fs-12"
              :name="(scoped.row.coefficient || 0) > 0 ? 'top' : 'bottom'"
            />
            {{ Math.abs(scoped.row.coefficient || 0) }}%
          </span>
        </template>
      </TableColumn>
    </el-table>
  </com-dialog>
</template>
<style lang="less">
.policy-detail-dialog-el-descriptions td.el-descriptions__label {
  width: 100px !important;
}
</style>
