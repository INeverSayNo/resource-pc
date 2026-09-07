<script setup lang="ts">
  import { ElInput } from 'element-plus'
  import ContentWrap from '@/components/ContentWrap/index.vue'
  import { ref } from 'vue'

  defineOptions({
    name: 'Menu12'
  })

  const text = ref('')
</script>

<template>
  <ContentWrap title="多级菜单缓存">
    <div class="flex items-center">菜单1-2：<ElInput v-model="text" class="pl-20px" /></div>
  </ContentWrap>
</template>
