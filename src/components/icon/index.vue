<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "DcIcon",
  props: {
    name: {
      type: String as PropType<string>,
      required: true
    },
    width: {
      type: Number as PropType<number>,
      default: 1
    },
    height: {
      type: Number as PropType<number>,
      default: 1
    }
  },
  setup(props) {}
});
</script>
<template>
  <svg
    class="dc-mobile-icon"
    aria-hidden="true"
    :width="width + 'rem'"
    :height="height + 'rem'"
  >
    <use :xlink:href="'#dc-mobile-icon-'+name"></use>
  </svg>
</template>
