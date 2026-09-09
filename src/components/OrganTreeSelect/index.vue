<template>
  <tree-select
    ref="trees"
    v-model:value="selectId"
    :data="oranData"
    clearable
    :default-props="defaultProps"
    placeholder="请选择机构"
    @change="handleSelectChange"
  />
</template>
<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  reactive,
  watch,
  watchEffect,
  computed,
  nextTick
} from "vue";
import TreeSelect from "@/components/TreeSelect/index.vue";
import { getOrganizationTree } from '@/api/organization'

export default defineComponent({
  name: "OrganTreeSelect",
  components: {
    TreeSelect
  },
  props: {
    host: {
      type: String,
      default: () => ""
    },
    isAccessControl: {
      type: Boolean,
      default: () => true
    },
    isFilterIsUsing: {
      type: Boolean,
      default: () => true
    },
    isOA: {
      type: Boolean,
      default: () => false
    },
    includeFunctional: {
      type: Boolean,
      default: () => false
    },
    modelValue: {
      type: [String, Array],
      default: () => ""
    }
  },
  emits: ["update:modelValue", "setLabel", "change"],
  setup(props: any, ctx: any) {
    const oranData = ref<any>([]);
    const trees = ref<any>(null);
    // const selectId = ref<any>("");
    // watchEffect(() => {
    //   selectId.value = props.value;
    // });

    const selectId = computed({
      get: () => {
        return props.modelValue;
      },
      set: (val) => {
        ctx.emit("update:modelValue", val);
      }
    });
    watch(
      () => props.modeValue,
      (val) => {
        trees.value.setDefaultValue(val);
      }
    );

    // const orgId = ref<any>(null);
    const defaultProps = reactive({
      parent: "parentid", // 父级唯一标识
      value: "id", // 唯一标识
      label: "text", // 标签显示
      children: "children" // 子级
    });
    onMounted(async () => {
      const [error, response] = await getOrganizationTree(
        {
          isAccessControl: props.isAccessControl,
          isFilterIsUsing: props.isFilterIsUsing,
          isOA: props.isOA,
          includeFunctional: props.includeFunctional
        },
        props.host || undefined
      )
      if (error || !response) return
      const tree = JSON.parse(response)
      oranData.value = tree?.children?.[0]?.children || []
    });
    const handleSelectChange = (val: any, data: any) => {
      nextTick(() => {
        ctx.emit("change", val, data);
      });
    };
    return { oranData, defaultProps, selectId, trees, handleSelectChange };
  }
});
</script>
