<template>
  <com-dialog
    :show-fullscreen="true"
    :model-value="showDetails"
    :width="1000"
    title="重要通知"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="showDetails = false"
    @opened="handleOpend"
  >
    <CmsTable
      ref="cmsTableRef"
      :query="{ businessId }"
      :show-query="showQuery"
      :height="400"
    />
  </com-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import CmsTable from "./cms-table.vue";
export default defineComponent({
  name: "",
  components: {
    CmsTable
  },
  props: {
    modelValue: {
      type: Boolean,
      default: () => false
    },
    businessId: {
      type: String,
      default: () => ""
    },
    showQuery: {
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
    const cmsTableRef = ref<InstanceType<typeof CmsTable>>();
    function handleOpend() {
      cmsTableRef.value?.handleSearch();
    }
    return {
      showDetails,
      cmsTableRef,
      handleOpend
    };
  }
});
</script>

<style></style>
