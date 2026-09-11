<template>
  <span v-if="!items.length">{{ fallback || '-' }}</span>
  <template v-for="(item, index) in items" :key="`${item.code}-${index}`">
    <el-link
      :type="item.code ? 'primary' : 'info'"
      :underline="false"
      @click="item.code && emit('open', item)"
    >
      {{ item.name }}{{ index < items.length - 1 ? '，' : '' }}
    </el-link>
  </template>
  <div v-if="exclude" class="theme-danger">不含：{{ exclude }}</div>
</template>

<script setup lang="ts">
  import type { CodeName } from '../types'
  withDefaults(defineProps<{ items?: CodeName[]; fallback?: string; exclude?: string }>(), {
    items: () => [],
    fallback: '',
    exclude: ''
  })
  const emit = defineEmits<{ open: [station: CodeName] }>()
</script>
