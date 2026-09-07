import type { App } from 'vue'
import { createMonitor } from '@dczy/tie-monitor/core'
import type { MonitorClient, MonitorTransport } from '@dczy/tie-monitor/core'
import { createLegacyTransport } from '@dczy/tie-monitor/legacy'
import { createMonitorVuePlugin } from '@dczy/tie-monitor/vue'
import { TRACE_URL } from '@/request/config'

export { useAnalyticsTrack, useMonitor } from '@dczy/tie-monitor/vue'

export const createAppMonitor = (
  transports: MonitorTransport[] = [createLegacyTransport({ endpoint: TRACE_URL })]
): MonitorClient =>
  createMonitor({
    enabled: true,
    application: '渠道资源系统',
    project: 'resource',
    platform: 'web',
    captureErrors: false,
    allowAnonymous: false,
    sensitiveQueryKeys: [
      'token',
      'access_token',
      'authorization',
      'code',
      't',
      'isoa',
      'name',
      'pwd'
    ],
    getUser: () => null,
    transports
  })

export const monitor = createAppMonitor()

export const setupMonitor = (app: App<Element>): void => {
  app.use(createMonitorVuePlugin({ monitor }))
}
