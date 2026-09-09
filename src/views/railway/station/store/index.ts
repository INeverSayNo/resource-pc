import { defineStore } from 'pinia'
import { store } from '@/store'
import type { EquipmentItem } from '../../equipment/type'
import type { WarehouseItem } from '../../warehouse/type'
import type { RailWayPrivatelLine, RailwayStationDto } from '../types'

interface RailwayStationState {
  currentStation: RailwayStationDto
  stationList: RailwayStationDto[]
  privateLineList: RailWayPrivatelLine[]
  equipmentList: EquipmentItem[]
  warehouseList: WarehouseItem[]
}

export const useRailwayStationStore = defineStore('railwayStation', {
  state: (): RailwayStationState => ({
    currentStation: {} as RailwayStationDto,
    stationList: [],
    privateLineList: [],
    equipmentList: [],
    warehouseList: []
  }),
  actions: {
    setCurrent(payload: RailwayStationDto): void {
      this.currentStation = payload
    },
    push(payload: RailwayStationDto): void {
      if (!this.stationList.some((item) => item.id === payload.id)) this.stationList.push(payload)
    },
    setPrivateLineList(payload: RailWayPrivatelLine[]): void {
      this.privateLineList = payload
    },
    setEquipmentList(payload: EquipmentItem[]): void {
      this.equipmentList = payload
    },
    setWarehouseList(payload: WarehouseItem[]): void {
      this.warehouseList = payload
    },
    reset(): void {
      this.$reset()
    }
  }
})

export const useRailwayStationStoreWithOut = () => useRailwayStationStore(store)

