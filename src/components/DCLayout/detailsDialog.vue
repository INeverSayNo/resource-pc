<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    :title="title"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="showDetails = false"
  >
    <div v-loading="loading">
      <el-descriptions
        v-if="columns && columns.length > 0"
        class="margin-top"
        :column="columnNum"
        :direction="direction"
        border
      >
        <template v-for="(item, index) in showDtData" :key="index">
          <el-descriptions-item :span="item.span">
            <template #label>
              <i v-if="item.icon" :class="item.icon" />
              {{ item.label }}
            </template>
            <span
              v-if="item.type === 'html'"
              class="html"
              v-html="
                item.formatter ? item.formatter(item.value, item) : item.value
              "
            />
            <span v-else-if="item.type === 'slot'" class="html">
              <slot :name="`${item.name}`"></slot>
            </span>
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
                :color="highlightcolor"
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
          </el-descriptions-item>
        </template>
      </el-descriptions>
      <slot name="detailsExtented" />
    </div>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </com-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { DCTableColumn } from "./store";
export default defineComponent({
  name: "",
  props: {
    modelValue: {
      type: Boolean,
      default: () => false
    },
    title: {
      type: String,
      default: () => "详情信息查看"
    },
    data: {
      type: Object,
      default: () => {}
    },
    columns: {
      type: Array as PropType<Array<DCTableColumn>>,
      default: () => []
    },
    columnNum: {
      type: Number,
      default: () => 3
    },
    direction: {
      type: String,
      default: () => "horizontal"
    },
    highlightcolor: {
      type: String,
      default: () => "red"
    },
    loading: {
      type: Boolean,
      default: () => false
    }
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const showDetails = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      }
    });

    const showDtData = computed(() => {
      const { columns, data } = props;
      const showData: any = [];
      if (columns && data) {
        for (const key in columns) {
          const col = columns[key];
          if (!col.hidden) {
            const span = col.span || 1;
            let value = data[col.name!];
            if (col.dtFormatter) {
              value = col.dtFormatter(data[col.name!], data);
            } else {
              if (col.formatter) {
                value = col.formatter(data, null, data[col.name!]);
              }
            }
            showData.push({
              name: col.name,
              columnName: key,
              label: col.label,
              value: value,
              icon: col.icon || "",
              span: span,
              type: col.type || "html"
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

    return {
      showDetails,
      showDtData,
      gethighlightText_detail
    };
  }
});
</script>

<style scoped>
:deep(.el-descriptions__label.is-bordered-label) {
  width: 100px !important;
}
:deep(.el-descriptions__content) {
  min-width: 100px !important;
}
</style>
