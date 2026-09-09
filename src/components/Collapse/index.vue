<script setup lang="ts">
  import { useAppStore } from '@/store/modules/app'
  const prefixCls = 'v-collapse'

  withDefaults(defineProps<{ color?: string }>(), { color: '' })

  const appStore = useAppStore()

  const toggleCollapse = () => {
    appStore.collapse = !appStore.collapse
  }
</script>

<template>
  <button
    :class="prefixCls"
    type="button"
    :aria-label="appStore.collapse ? '展开导航菜单' : '收起导航菜单'"
    @click="toggleCollapse"
  >
    <DAliIcon
      :size="18"
      :name="appStore.collapse ? 'menu-open' : 'menu'"
      :color="color"
      class="cursor-pointer"
    />
  </button>
</template>

<style scoped>
  .v-collapse {
    background: transparent;
    border: 0;
  }
</style>
