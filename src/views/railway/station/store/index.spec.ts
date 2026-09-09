import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { useRailwayStationStore } from './index'

describe('railway station store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('keeps refs reactive and de-duplicates stations', () => {
    const stationStore = useRailwayStationStore()
    const { currentStation, stationList } = storeToRefs(stationStore)
    const station = { id: 'station-1', railwayStationName: '测试站' } as any

    stationStore.push(station)
    stationStore.push({ ...station })
    stationStore.setCurrent(station)

    expect(stationList.value).toHaveLength(1)
    expect(currentStation.value.id).toBe('station-1')
  })

  it('clears temporary business state', () => {
    const stationStore = useRailwayStationStore()
    stationStore.push({ id: 'station-1' } as any)
    stationStore.setEquipmentList([{ id: 'equipment-1' } as any])
    stationStore.reset()

    expect(stationStore.stationList).toEqual([])
    expect(stationStore.equipmentList).toEqual([])
    expect(stationStore.currentStation).toEqual({})
  })
})
