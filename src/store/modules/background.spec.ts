import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const dictionaryApi = vi.hoisted(() => ({ getAllDictionaries: vi.fn() }))
const orgUserApi = vi.hoisted(() => ({ getOrgUsers: vi.fn() }))

vi.mock('@/api/dictionary', () => dictionaryApi)
vi.mock('@/api/orgUser', () => orgUserApi)

import { useDictionaryStore } from './dictionary'
import { useOrgUserStore } from './orgUser'

describe('login background data generation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('discards a dictionary response from an old account generation', async () => {
    let resolveRequest!: (value: [null, Record<string, unknown>]) => void
    dictionaryApi.getAllDictionaries.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )
    const dictionaryStore = useDictionaryStore()
    dictionaryStore.reset(1)
    const pending = dictionaryStore.loadAll(1)

    dictionaryStore.reset(2)
    resolveRequest([null, { stale: true }])
    const [error] = await pending

    expect(error).toBeInstanceOf(Error)
    expect(dictionaryStore.filters).toEqual({})
    expect(dictionaryStore.loaded).toBe(false)
  })

  it('discards an organization-user response from an old account generation', async () => {
    let resolveRequest!: (value: [null, { rows: Array<{ id: string }> }]) => void
    orgUserApi.getOrgUsers.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )
    const orgUserStore = useOrgUserStore()
    orgUserStore.reset(1)
    const pending = orgUserStore.prefetch(1)

    orgUserStore.reset(2)
    resolveRequest([null, { rows: [{ id: 'stale-user' }] }])
    const [error] = await pending

    expect(error).toBeInstanceOf(Error)
    expect(orgUserStore.users).toEqual([])
    expect(orgUserStore.loaded).toBe(false)
  })
})
