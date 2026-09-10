import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia, storeToRefs } from 'pinia'
vi.mock('@/request/config', () => ({
  ApplicationId: 'resource',
  ABPBASE_URL: 'https://api.example.com',
  CRYPT_TYPE: 1,
  GATEWAY_URL: 'https://api.example.com',
  LOGIN_CLIENT_ID: 'client',
  LOGIN_CLIENT_SECRET: 'secret',
  LOGIN_URL: 'https://login.example.com',
  PATH_URL: 'https://api.example.com',
  TRACE_URL: 'https://trace.example.com',
  USE_CRY_PTO: false,
  SYSTEM_BASE_DATA_URL: 'https://api.example.com'
}))

import { useUserStore } from '@/store/modules/user'
import { store as appStore } from '@/store'
import { useWaterwayStationStore } from './index'

describe('waterway station store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('keeps refs reactive and de-duplicates ports by the legacy _id field', () => {
    const stationStore = useWaterwayStationStore()
    const { currentStation, stationList } = storeToRefs(stationStore)
    const port = { _id: 'port-1', Id: 'port-1', PortAreaName: '测试港区' } as any

    stationStore.push(port)
    stationStore.push({ ...port, PortAreaName: '重复港区' })
    stationStore.setCurrent(port)

    expect(stationList.value).toHaveLength(1)
    expect(currentStation.value.PortAreaName).toBe('测试港区')

    stationStore.setCurrent({ ...port, PortAreaName: '更新后的港区' })
    expect(currentStation.value.PortAreaName).toBe('更新后的港区')
  })

  it('clears only temporary port state', () => {
    const stationStore = useWaterwayStationStore()
    stationStore.push({ _id: 'port-1' } as any)
    stationStore.setCurrent({ _id: 'port-1' } as any)

    stationStore.reset()

    expect(stationStore.stationList).toEqual([])
    expect(stationStore.currentStation).toEqual({})
  })

  it('is reset by the shared session cleanup used by logout', () => {
    setActivePinia(appStore)
    const stationStore = useWaterwayStationStore()
    const userStore = useUserStore()
    stationStore.reset()
    stationStore.push({ _id: 'port-1' } as any)
    stationStore.setCurrent({ _id: 'port-1' } as any)
    userStore.$patch({ token: 'token', userInfo: { sub: 'user-1' } as any })

    userStore.clearSession()

    expect(stationStore.stationList).toEqual([])
    expect(stationStore.currentStation).toEqual({})
  })
})
