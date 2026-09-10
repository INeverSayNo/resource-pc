import { defineStore } from 'pinia'
import { store } from '@/store'
import type { WaterwayStationDto } from '../types'

interface WaterwayStationState {
  currentStation: WaterwayStationDto
  stationList: WaterwayStationDto[]
}

export const useWaterwayStationStore = defineStore('waterwayStation', {
  state: (): WaterwayStationState => ({
    currentStation: {} as WaterwayStationDto,
    stationList: []
  }),
  actions: {
    setCurrent(payload: WaterwayStationDto): void {
      this.currentStation = payload
    },
    push(payload: WaterwayStationDto): void {
      const id = payload._id || payload.Id
      if (!id || !this.stationList.some((item) => (item._id || item.Id) === id)) {
        this.stationList.push(payload)
      }
    },
    reset(): void {
      this.$reset()
    }
  }
})

export const useWaterwayStationStoreWithOut = () => useWaterwayStationStore(store)
