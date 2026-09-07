<script setup lang="ts">
  import pageError from '@/assets/svgs/404.svg'
  import { ElButton } from 'element-plus'

  const emit = defineEmits(['errorClick'])

  const btnClick = () => {
    emit('errorClick')
  }
</script>

<template>
  <div class="flex justify-center">
    <div class="text-center">
      <img width="350" :src="pageError" alt="" />
      <div class="text-14px text-[var(--el-color-info)]">抱歉，您访问的页面不存在。</div>
      <div class="mt-20px">
        <ElButton type="primary" @click="btnClick">返回首页</ElButton>
      </div>
    </div>
  </div>
</template>
