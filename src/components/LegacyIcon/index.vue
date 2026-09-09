<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name: string }>()

const paths: Record<string, string> = {
  plus: 'M12 5v14M5 12h14',
  delete: 'M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5',
  edit: 'M4 20h4L19 9l-4-4L4 16v4m9-13 4 4',
  search: 'm21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  view: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  download: 'M12 3v12m-5-5 5 5 5-5M5 21h14',
  upload: 'M12 21V9m-5 5 5-5 5 5M5 3h14',
  close: 'M6 6l12 12M18 6 6 18',
  'circle-close': 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 8l8 8m0-8-8 8',
  'circle-check': 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-4-10 3 3 5-6',
  'arrow-left': 'm15 18-6-6 6-6',
  'arrow-right': 'm9 18 6-6-6-6',
  'arrow-down': 'm6 9 6 6 6-6',
  'arrow-up': 'm6 15 6-6 6 6',
  bottom: 'M12 4v14m-5-5 5 5 5-5',
  top: 'M12 20V6m-5 5 5-5 5 5',
  'top-right': 'M8 4h12v12M20 4 8 16',
  'bottom-left': 'M16 20H4V8M4 20 16 8',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  menu: 'M4 6h16M4 12h16M4 18h16',
  's-operation': 'M4 6h16M4 12h16M4 18h16M8 4v4m8 2v4m-8 2v4',
  'copy-document': 'M8 8h11v13H8V8Zm-3 8H3V3h11v2',
  'zoom-in': 'm21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM11 7v8M7 11h8'
}

const path = computed(() => paths[props.name] || paths.more)
</script>

<template>
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path :d="path" />
  </svg>
</template>

<style scoped>
svg {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}
</style>
