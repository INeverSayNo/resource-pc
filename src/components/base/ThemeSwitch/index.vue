<script setup lang="ts">
  import { ElSwitch } from 'element-plus'

  const isDark = defineModel<boolean>({ required: true })
</script>

<template>
  <ElSwitch
    v-model="isDark"
    inline-prompt
    active-text="☾"
    inactive-text="☀"
    aria-label="切换暗色模式"
  />
</template>
