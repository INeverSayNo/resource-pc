<script setup lang="ts">
  import { useTagsViewStore } from '@/store/modules/tagsView'
  // import Footer from '@/components/Footer/index.vue'
  import { computed } from 'vue'
  const tagsViewStore = useTagsViewStore()

  const cachedViews = computed(() => tagsViewStore.cachedViews)
</script>

<template>
  <section :class="['box-border  w-full bg-[var(--app-content-bg-color)]']">
    <router-view>
      <template #default="{ Component, route }">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </template>
    </router-view>
  </section>
  <!-- <Footer v-if="appConfig.ui.footer" /> -->
</template>
