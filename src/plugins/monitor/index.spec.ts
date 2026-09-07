import { describe, expect, it, vi } from 'vitest'
import type { MonitorEvent, MonitorTransport } from '@dczy/tie-monitor/core'
import type { App } from 'vue'

vi.mock('@/request/config', () => ({ TRACE_URL: 'https://trace.example.com' }))

import { createAppMonitor, setupMonitor } from './index'

describe('monitor plugin configuration', () => {
  it('registers the Vue monitor plugin on the application', () => {
    const app = { use: vi.fn() } as unknown as App<Element>
    setupMonitor(app)
    expect(app.use).toHaveBeenCalledTimes(1)
  })

  it('uses the legacy-compatible event transport without leaking credentials', async () => {
    const events: MonitorEvent[] = []
    const transport: MonitorTransport = {
      name: 'test',
      send: vi.fn((event: MonitorEvent) => {
        events.push(event)
      })
    }
    const client = createAppMonitor([transport])
    await client.init()
    client.setUser({ id: 'user-1', erp_userid: 'user-1' })
    await client.track('$LoginSuccess', { module: 'login', auth_source: 'password' })

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      event: '$LoginSuccess',
      application: '渠道资源系统',
      project: 'resource',
      user: { id: 'user-1', erp_userid: 'user-1' }
    })
    const serializedEvent = JSON.stringify(events[0])
    expect(serializedEvent).not.toContain('secret')
    expect(serializedEvent).not.toContain('access_token')
    expect(serializedEvent).not.toContain('oa-password')
  })
})
