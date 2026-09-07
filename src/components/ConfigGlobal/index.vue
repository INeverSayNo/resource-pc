<script setup lang="ts">
  import { watch } from 'vue'
  import { ElConfigProvider } from 'element-plus'
  import zhCn from 'element-plus/es/locale/lang/zh-cn'
  import { useWindowSize } from '@vueuse/core'
  import { useAppStore } from '@/store/modules/app'

  const appStore = useAppStore()

  const { width } = useWindowSize()

  // 监听窗口变化
  watch(
    () => width.value,
    (width: number) => {
      if (width < 768) {
        if (!appStore.mobile) {
          appStore.mobile = true
          appStore.collapse = true
        }
      } else {
        if (appStore.mobile) {
          appStore.mobile = false
        }
      }
    },
    {
      immediate: true
    }
  )
</script>

<template>
  <ElConfigProvider namespace="el" :locale="zhCn" :message="{ max: 1 }">
    <slot></slot>
  </ElConfigProvider>
</template>
