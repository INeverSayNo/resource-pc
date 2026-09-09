import L from "leaflet";
import "@maplibre/maplibre-gl-leaflet";
import { isMobile } from "./mapHelper";
import { StyleSpecification } from "maplibre-gl";

export default function useBaseLayerHelper() {
  const createBaseLayerOptions = (
    baseOptons: {
      layerName: string;
      paneName: string;
      maxZoom: number;
      minZoom: number;
      tileSize: number;
    },
    otherOptions?: Record<string, any>
  ) => {
    const { layerName, maxZoom, minZoom, tileSize, paneName } = baseOptons;
    const options = {
      layers: `osm:${layerName}`, // 使用图层组
      format: "image/png8",
      transparent: true,
      tileSize: isMobile ? 256 : 512,
      version: "1.1.0",
      maxZoom: maxZoom,
      minZoom: minZoom,
      crs: L.CRS.EPSG3857,
      keepBuffer: isMobile ? 1 : 8,
      updateInterval: isMobile ? 300 : 150,
      opacity: 1,
      updateWhenIdle: false, // 仅在平移停止后更新图层
      updateWhenZooming: false, // 在缩放过程中不更新图层
      pane: paneName, // 指定 Pane
      noWrap: false, // 禁止图层环绕
      width: isMobile ? 256 : 512,
      height: isMobile ? 256 : 512,
      quality: 100,
      detectRetina: true,
      dpi: 180,
      tiled: true,
      zoomOffset: -1
    };
    return Object.assign(options, otherOptions || {});
  };

  const createLayer = (layerUrl: string, options: Record<string, any>) => {
    const tileLayer = L.tileLayer.wms(layerUrl, options);
    return tileLayer;
  };

  const createTerrainLayer = (
    leafletMap: L.Map,
    options: {
      maplibreTextPane: string;
    }
  ) => {
    const { maplibreTextPane } = options;

    // 创建轻量级样式
    const lightweightStyle = {
      version: 8 as const,
      name: "Terrain Hillshade Style",
      sources: {
        "terrain-source": {
          type: "raster-dem",
          encoding: "mapbox",
          tiles: [
            "https://lcdata.tianditu.gov.cn/terrain-rgb_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=terrain-rgb&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=4bc562de1e6092cbc6755797acc32bd0"
          ],
          tileSize: 512,
          maxzoom: 12
        }
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": "rgba(0,0,0,0)"
          }
        },
        {
          id: "hillshade",
          type: "hillshade",
          source: "terrain-source",
          layout: {},
          paint: {
            "hillshade-illumination-direction": 335,
            "hillshade-exaggeration": 0.5,
            "hillshade-highlight-color": "#FFFFFF",
            "hillshade-shadow-color": "#000000",
            "hillshade-accent-color": "#000000"
          }
        }
      ]
    };

    leafletMap.createPane(maplibreTextPane);
    const maplibrePane = leafletMap.getPane(maplibreTextPane)!;
    maplibrePane.style.zIndex = "10003"; // 确保在最上层
    maplibrePane.style.pointerEvents = "none"; // 禁用鼠标事件，允许点击穿透

    const maplibreLayer = L.maplibreGL({
      style: lightweightStyle as unknown as StyleSpecification,
      pane: maplibreTextPane,
      antialias: false,
      preserveDrawingBuffer: false,
      fadeDuration: 0,
      maxTileCacheSize: 20,
      dedupFeatures: true,
      language: "zh-Hans",
      maxParallelImageRequests: 4, // 减少并行请求数
      crossSourceCollisions: false, // 关闭跨源碰撞检测
      trackResize: false, // 响应窗口调整大小
      transformRequest: (url: string, resourceType?: string) => {
        if (resourceType === "Tile") {
          return { url, priority: "low" };
        }
        return { url };
      }
    } as any);

    // 添加到地图
    maplibreLayer.addTo(leafletMap);
    // 获取底层的MapLibre地图实例并禁用交互
    const maplibreMap = maplibreLayer.getMaplibreMap();
    maplibreMap.boxZoom.disable();
    maplibreMap.scrollZoom.disable();
    maplibreMap.dragPan.disable();
    maplibreMap.dragRotate.disable();
    maplibreMap.keyboard.disable();
    maplibreMap.doubleClickZoom.disable();
    maplibreMap.touchZoomRotate.disable();

    return maplibreLayer;
  };

  return {
    createBaseLayerOptions,
    createLayer,
    createTerrainLayer
  };
}
