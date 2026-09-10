const baseUrl = `https://gateway.dczhiyun.com/geo/geoserver/osm/wms`

export default function useCreateCustomLayer() {
  const createLayerUrl = (
    baseOptons: {
      layerName: string
      paneName: string
      maxZoom: number
      minZoom: number
    },
    otherOptions?: Record<string, any>
  ) => {
    const { layerName, maxZoom, minZoom, paneName } = baseOptons
    // WMS 请求参数（仅保留 GeoServer 识别的参数）
    const options: Record<string, any> = {
      layers: `osm:${layerName}`,
      service: 'WMS',
      request: 'GetMap',
      format: 'image/png8',
      transparent: true,
      version: '1.1.0',
      srs: 'EPSG:3857',
      width: 1024,
      height: 1024,
      tiled: true,
      FORMAT_OPTIONS: 'dpi:180'
    }
    const urlSearchParams = new URLSearchParams()
    for (const key in options) {
      urlSearchParams.append(key, options[key])
    }

    if (otherOptions && typeof otherOptions === 'object') {
      for (const key in otherOptions) {
        urlSearchParams.append(key, otherOptions[key])
      }
    }

    const tileUrl = `${baseUrl}?${urlSearchParams.toString()}`
    return tileUrl
  }

  return {
    createLayerUrl
  }
}
