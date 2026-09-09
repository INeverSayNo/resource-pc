<template>
  <div ref="scrollRef" class="notify-bar">
    <svg-icon icon-class="notice" style="margin-top: 4px"></svg-icon>
    <div class="item">
      <div v-for="item in options" :key="item" class="bar">{{ item }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, ref, onMounted, watch } from "vue";
export default {
  props: {
    autoScroll: {
      type: Boolean,
      default: () => true
    },
    delay: {
      type: Number,
      default: () => 2000
    },
    options: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  setup(props) {
    const scrollRef = ref<HTMLDivElement>();
    const currentIndex = ref(0);
    function scorll() {
      const el = scrollRef.value?.querySelector(".item");
      const first = scrollRef.value?.querySelector(".bar");
      if (el) {
        if (currentIndex.value > props.options.length - 1) {
          currentIndex.value = 0;
          (el as HTMLElement).style.transitionDuration = "0ms";
          (first as HTMLElement).style.transitionDuration = "500ms";
          (first as HTMLElement).style.transform = `translateY(0px)`;
        } else {
          (first as HTMLElement).style.transitionDuration = "";
          (first as HTMLElement).style.transform = "";
          (el as HTMLElement).style.transitionDuration = "500ms";
        }
        (el as HTMLElement).style.transform = `translateY(${
          -25 * currentIndex.value
        }px)`;
        currentIndex.value += 1;
      }
    }
    watch(
      () => props.options,
      (val) => {
        if (val.length > 1 && props.autoScroll) {
          currentIndex.value = 0;
          setInterval(() => {
            scorll();
          }, props.delay);
        }
      },
      { immediate: true, deep: true }
    );
    onMounted(() => {});
    return {
      scrollRef
    };
  }
};
</script>

<style lang="less" scoped>
.notify-bar {
  display: inline-flex;
  background-color: #fffbe8;
  color: #ed6a0c;
  border-radius: 5px;
  line-height: 25px;
  height: 25px;
  overflow: hidden;
  padding: 0 10px;
  .item {
    transition-duration: 500ms;
    font-size: 14px;
    .bar {
      display: inline-table;
      width: calc(100% - 20px);
      padding: 0 10px 0 10px;
    }
  }
}
</style>
