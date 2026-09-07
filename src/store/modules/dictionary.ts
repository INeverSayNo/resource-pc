import { defineStore } from 'pinia'
import { getAllDictionaries } from '@/api/dictionary'
import type { ApiError, ApiResult } from '@/request'
import { store } from '../index'

interface DictionaryState {
  filters: Record<string, unknown>
  loaded: boolean
  loading: boolean
  error: ApiError | null
  generation: number
}

export const useDictionaryStore = defineStore('dictionary', {
  state: (): DictionaryState => ({
    filters: {},
    loaded: false,
    loading: false,
    error: null,
    generation: 0
  }),
  actions: {
    async loadAll(generation: number): Promise<ApiResult<Record<string, unknown>>> {
      this.loading = true
      const [error, data] = await getAllDictionaries()
      if (this.generation !== generation) return [new Error('字典请求已失效'), null]
      this.loading = false
      this.error = error
      if (error || !data) return [error || new Error('字典加载失败'), null]
      this.filters = data
      this.loaded = true
      return [null, data]
    },
    reset(generation?: number): void {
      this.filters = {}
      this.loaded = false
      this.loading = false
      this.error = null
      this.generation = generation ?? this.generation + 1
    }
  },
  persist: false
})

export const useDictionaryStoreWithOut = () => useDictionaryStore(store)
