declare module 'vue' {
  export interface GlobalComponents {
    Icon: (typeof import('@/components/base'))['Icon']
  }
}

export {}
