declare module 'vue' {
  export interface GlobalComponents {
    DAliIcon: typeof import('@/components/SvgIcon/AliIcon')
    ComDialog: (typeof import('@/components/ComDialog/index.vue'))['default']
  }
}

export {}
