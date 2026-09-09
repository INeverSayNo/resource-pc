import { defineStore } from 'pinia'
import { store } from '@/store'
import type { FeatureAuthority } from '@/api/login'

export type feature = FeatureAuthority

export const useFunPermissionStore = defineStore('funPermission', {
  state: () => ({
    cachedPermission: new Map<string, FeatureAuthority[]>()
  }),
  actions: {
    setPermission(controllerName: string, features: FeatureAuthority[]): void {
      this.cachedPermission.set(controllerName, features)
    },
    reset(): void {
      this.cachedPermission.clear()
    }
  }
})

export const useFunPermissionStoreWithOut = () => useFunPermissionStore(store)
