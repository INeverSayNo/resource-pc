<template>
  <div
    ref="gapRef"
    class="gap"
    :class="[type, position, { 'no-bg': !isBackground }]"
  >
    <slot />
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import type { PropType } from "vue";

type GapType = "success" | "warning" | "info" | "error";
type PositionType = "top" | "left" | "right" | "bottom";
export default defineComponent({
  name: "Gap",
  props: {
    type: {
      type: String as PropType<GapType>,
      default: "info"
    },
    isBackground: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    radiusSize: {
      type: Number as PropType<number>,
      default: 4
    },
    radiusWidth: {
      type: Number as PropType<number>,
      default: 5
    },
    position: {
      type: String as PropType<PositionType>,
      default: "left"
    }
  },
  setup(props, ctx) {
    const gapRef = ref<HTMLDivElement>();
    onMounted(() => {
      gapRef.value!.style.borderRadius = `${props.radiusSize}px`;
      gapRef.value!.style.borderLeftWidth = `${props.radiusWidth}px`;
    });
    return {
      gapRef
    };
  }
});
</script>
<style lang="less" scoped>
.gap {
  padding: 8px 16px;
}
.left {
  border-left: 5px solid;
}
.right {
  border-right: 5px solid;
}
.top {
  border-top: 5px solid;
}
.bottom {
  border-bottom: 5px solid;
}
.no-bg {
  background-color: transparent !important;
}
.info {
  background-color: #409eff1a;
  border-color: #409eff;
}

.error {
  background-color: #f56c6c1a;
  border-color: #f56c6c;
}

.success {
  background-color: #b3e19d40;
  border-color: #67c23a;
}

.warning {
  background-color: #f3d19e42;
  border-color: #e6a23c;
}
</style>
