<template>
  <svg :class="svgClass" aria-hidden="true" v-on="$attrs">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'

  interface Props {
    icon?: string
    className?: string
  }

  defineOptions({
    name: 'SvgIcon'
  })

  const props = withDefaults(defineProps<Props>(), {
    icon: '',
    className: ''
  })

  const iconName = computed((): string => `#icon-${props.icon}`)
  const svgClass = computed((): string => {
    if (props.className) {
      return 'svg-icon ' + props.className
    } else {
      return 'svg-icon'
    }
  })
</script>

<style scoped>
  .svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
</style>
