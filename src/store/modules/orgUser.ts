import { defineStore } from 'pinia'
import { GetOrgUsers } from '@/api/orgUser'
import type { OrgUser } from '@/api/orgUser'
import { store } from '../index'

interface OrgUserState {
  users: OrgUser[]
  loaded: boolean
  loading: boolean
  generation: number
}

export const useOrgUserStore = defineStore('orgUser', {
  state: (): OrgUserState => ({
    users: [],
    loaded: false,
    loading: false,
    generation: 0
  }),
  actions: {
    async prefetch(generation: number): Promise<void> {
      this.loading = true
      const [error, data] = await GetOrgUsers()
      if (this.generation !== generation) return
      this.loading = false
      if (error || !data) return
      const users = Array.isArray(data.rows) ? data.rows : []
      this.users = users
      this.loaded = true
    },
    reset(generation?: number): void {
      this.users = []
      this.loaded = false
      this.loading = false
      this.generation = generation ?? this.generation + 1
    }
  },
  persist: false
})

export const useOrgUserStoreWithOut = () => useOrgUserStore(store)
