declare module 'vue' {
  export interface GlobalComponents {
    DAliIcon: typeof import('@/components/SvgIcon/AliIcon')
    ComDialog: (typeof import('@/components/ComDialog/index.vue'))['default']
    DLegacyIcon: (typeof import('@/components/LegacyIcon/index.vue'))['default']
  }

  export interface ComponentCustomProperties {
    getPrivatePhone: (value: string | number) => string
    createPrivatePhone: (value: string | number) => Element
  }
}

export {}
