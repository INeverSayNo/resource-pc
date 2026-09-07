import { defineStore } from 'pinia'
import { getOrgUsers } from '@/api/orgUser'
import type { OrgUser } from '@/api/orgUser'
import type { ApiError, ApiResult } from '@/request'
import { store } from '../index'

interface OrgUserState {
  users: OrgUser[]
  loaded: boolean
  loading: boolean
  error: ApiError | null
  generation: number
}

export const useOrgUserStore = defineStore('orgUser', {
  state: (): OrgUserState => ({
    users: [],
    loaded: false,
    loading: false,
    error: null,
    generation: 0
  }),
  actions: {
    async prefetch(generation: number): Promise<ApiResult<OrgUser[]>> {
      this.loading = true
      const [error, data] = await getOrgUsers()
      if (this.generation !== generation) return [new Error('组织用户请求已失效'), null]
      this.loading = false
      this.error = error
      if (error || !data) return [error || new Error('组织用户加载失败'), null]
      const users = Array.isArray(data.rows) ? data.rows : []
      this.users = users
      this.loaded = true
      return [null, users]
    },
    reset(generation?: number): void {
      this.users = []
      this.loaded = false
      this.loading = false
      this.error = null
      this.generation = generation ?? this.generation + 1
    }
  },
  persist: false
})

export const useOrgUserStoreWithOut = () => useOrgUserStore(store)
