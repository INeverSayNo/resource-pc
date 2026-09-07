import { defineStore } from 'pinia'
import { getAllDictionaries } from '@/api/dictionary'
import { store } from '../index'

interface DictionaryState {
  filters: Record<string, unknown>
  loaded: boolean
  loading: boolean
  generation: number
}

export const useDictionaryStore = defineStore('dictionary', {
  state: (): DictionaryState => ({
    filters: {},
    loaded: false,
    loading: false,
    generation: 0
  }),
  actions: {
    async loadAll(generation: number): Promise<void> {
      this.loading = true
      const [error, data] = await getAllDictionaries()
      if (this.generation !== generation) return
      this.loading = false
      if (error || !data) return
      const nested = data.data
      this.filters =
        typeof nested === 'object' && nested !== null && !Array.isArray(nested)
          ? (nested as Record<string, unknown>)
          : data
      this.loaded = true
    },
    reset(generation?: number): void {
      this.filters = {}
      this.loaded = false
      this.loading = false
      this.generation = generation ?? this.generation + 1
    }
  },
  persist: false
})

export const useDictionaryStoreWithOut = () => useDictionaryStore(store)
