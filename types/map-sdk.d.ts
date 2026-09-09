/// <reference path="../node_modules/@dczy/tie-tools/other-types/bmapgl/index.d.ts" />
/// <reference path="../node_modules/@dczy/tie-tools/other-types/tianditu/index.d.ts" />

declare global {
  interface Window {
    TMapContainerId: string
    initialize?: () => void
  }
}

export {}
