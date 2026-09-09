<template>
  <template v-for="(item, index) in columns" :key="index">
    <el-table-column
      v-if="!item.hidden"
      :show-overflow-tooltip="
        item.showOverflowTooltip ||
        typeof item.showOverflowTooltip === 'undefined'
      "
      v-bind="item"
      :prop="item.name"
      :label="item.label"
      :fixed="item.fixed"
      :width="item.width"
      :sortable="item.sortable"
      :formatter="item.formatter"
      :align="item.align"
      :class-name="item.classname"
    >
      <template v-if="item.children && item.children.length > 0" #default>
        <DcTableColumn :columns="item.children"></DcTableColumn>
      </template>
      <template v-else #default="scope">
        <template v-if="editCol && scope.row[editCol] && item.editOptions">
          <el-input
            v-if="
              item.editOptions.type === 'text' ||
              item.editOptions.type === 'number'
            "
            v-model="scope.row[item.name]"
            placeholder="请输入"
            :type="item.editOptions.type"
            v-bind="item.editOptions.props"
          />
        </template>
        <template v-else>
          <div
            v-if="item.type === 'html'"
            @click.self="(e) => triggerClick(e, scope.row)"
            v-html="
              item.formatter
                ? item.formatter(scope.row, scope.column, scope.row[item.name])
                : scope.row[item.name]
            "
          />
          <div v-else-if="item.type === 'img-upload'">
            <file-down-view
              v-for="(file, idx) in scope.row[item.name!]"
              :key="idx"
              :text="file.name"
              :path="file.url"
              :down="false"
            />
          </div>
          <span v-else-if="item.isHighlight">
            <dc-highlight
              tag="span"
              :keys="gethighlightText(item, scope)"
              :color="highlightcolor"
            >
              {{
                  item.formatter
                    ? item.formatter(
                        scope.row,
                        scope.column,
                        scope.row[item.name!]
                      )
                    : scope.row[item.name!]
              }}
            </dc-highlight>
          </span>
          <span v-else-if="item.type === 'slot'">
            <slot :name="item.name" v-bind="{ ...scope }"></slot>
          </span>
          <span v-else>
            {{
              item.formatter
                ? item.formatter(scope.row, scope.column, scope.row[item.name])
                : scope.row[item.name]
            }}
          </span>
        </template>
      </template>
    </el-table-column>
  </template>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent, PropType, computed } from "vue";
import { DCTableColumn } from "./store";
import DcHighlight from "@/components/Highlight/index.vue";

export default defineComponent({
  name: "DcTableColumn",
  components: {
    DcHighlight
  },
  props: {
    columns: {
      type: Array as PropType<Array<DCTableColumn>>,
      default: () => []
    },
    editCol: {
      type: String,
      default: () => ""
    },
    highlightcolor: {
      type: String,
      default: () => "red"
    }
  },
  emits: ["triggerClick"],
  setup(props, { emit }) {
    const state = reactive({});
    const triggerClick = (event: any, row: any) => {
      emit("triggerClick", event, row);
    };

    const gethighlightText = computed(() => {
      return (item, scope) => {
        if (item.isHighlight) {
          const text = item.formatter
            ? item.formatter(scope.row, scope.column, scope.row[item.name])
            : scope.row[item.name];
          if (text || text === 0) {
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
      ...toRefs(state),
      triggerClick,
      gethighlightText
    };
  }
});
</script>

<style lang="less" scoped></style>
