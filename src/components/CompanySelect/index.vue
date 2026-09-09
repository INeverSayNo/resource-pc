<template>
  <el-select
    v-model="companyId"
    v-bind="$attrs"
    clearable
    :filterable="filter"
    @change="companyChange"
  >
    <el-option
      v-for="item in companyItems"
      :key="item.name"
      :label="item.name"
      :value="item.organizationId"
    />
  </el-select>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { getCompanyChoices } from '@/api/organization'

export default defineComponent({
  name: "CompanySelect",
  props: {
    host: {
      type: String,
      default: () => ""
    },
    modelValue: {
      type: [String || Number || Object || Array],
      default: () => null
    },
    isAccessControl: {
      type: Boolean,
      default: () => false
    },
    filter: {
      type: Boolean,
      default: () => true
    }
  },
  emits: ["update:modelValue", "change"],
  setup(props, ctx) {
    const companyItems = ref<any>([]);
    const companyId = computed({
      get: () => props.modelValue,
      set: (val) => {
        ctx.emit("update:modelValue", val);
      }
    });
    const filter = ref<any>(props.filter);
    onMounted(async () => {
      const [error, response] = await getCompanyChoices(props.isAccessControl, props.host || undefined)
      if (!error && Array.isArray(response)) companyItems.value = response
    });

    const companyChange = (value: any) => {
      companyId.value = value;
      ctx.emit(
        "change",
        value,
        companyItems.value.find((it: any) => it.organizationId === value)
      );
    };
    // eslint-disable-next-line vue/no-dupe-keys
    return { companyItems, companyId, companyChange, filter };
  }
});
</script>
