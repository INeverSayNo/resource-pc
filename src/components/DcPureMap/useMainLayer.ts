import { ref, Ref } from "vue";
import L from "leaflet";
import useBaseLayerHelper from "./useBaseLayerHelper";
import { isIOS, isMobile } from "./mapHelper";
import type { IEmits, IProps } from "./type";

export default function useMainLayer(
  props: IProps,
  emits: IEmits,
  MapInstance: Ref<L.Map | null>
) {
  const layerGroup = ref<Map<string, L.Layer>>(new Map());

  const { createBaseLayerOptions, createLayer } = useBaseLayerHelper();

  // 高缩放图层 10 ~ 18
  const addHighMainLayer = () => {
    const layerGroupName = isMobile
      ? isIOS()
        ? "osm_group_map_ios_new"
        : "osm_group_map_android_new"
      : "osm_group_map_pc";
    const maskOptions = createBaseLayerOptions(
      {
        layerName: "osm_group_map_mask",
        paneName: "tilePane",
        maxZoom: props.maxZoom || 18,
        minZoom: 9,
        tileSize: 512
      },
      {
        // 其他选项
        bounds: L.latLngBounds([3, 73], [54, 136]),
        tilematrixset: "EPSG:4326x2",
        format_options: `dpi:${(window.devicePixelRatio * 96, 100)}`,
        keepBuffer: isMobile ? 1 : 8,
        opacity: 0,
        env: "text-rendering:QUALITY;antialiasing:true;fontSizeScaling:0.8"
      }
    );

    createLayer(
      "https://geo.daochen.com/geoserver/osm/wms?tilematrixset=EPSG:4326x2",
      maskOptions
    ).addTo(MapInstance.value!);

    const mainOptions = createBaseLayerOptions(
      {
        layerName: layerGroupName,
        paneName: "geoserverPane",
        maxZoom: props.maxZoom || 18,
        minZoom: 9,
        tileSize: 512
      },
      {
        bounds: L.latLngBounds([3, 73], [54, 136]),
        tilematrixset: "EPSG:4326x2",
        format_options: `dpi:${Math.min(window.devicePixelRatio * 96, 100)}`,
        tiled: true,
        env: `text-rendering:QUALITY;antialiasing:true`,
        updateWhenIdle: !isMobile,
        updateWhenZooming: !isMobile,
        noWrap: true,
        opacity: 1,
        keepBuffer: isMobile ? 1 : 8
      }
    );
    const geoserverLayer = createLayer(
      "https://geo.daochen.com/geoserver/osm/wms?tilematrixset=EPSG:4326x2",
      mainOptions
    );
    geoserverLayer.addTo(MapInstance.value!);
    layerGroup.value.set("geoserverLayer", geoserverLayer);
  };

  // 低缩放图层 3 ~ 10
  const addLowMainLayer = () => {
    const options = createBaseLayerOptions({
      layerName: "osm_normal_map_test",
      paneName: "normalMapPane",
      maxZoom: 10,
      minZoom: 3,
      tileSize: 512
    });

    const layer = createLayer(
      "https://geo.daochen.com//geoserver/osm/wms",
      options
    );

    layer.addTo(MapInstance.value!);
    layerGroup.value.set("normalMapLayer", layer);
  };

  // 水域
  const addOtherLayer = () => {
    const waterLayerOptions = createBaseLayerOptions(
      {
        layerName: "global_water_china_changejiang_huanghe",
        paneName: "waterPane",
        maxZoom: 20,
        minZoom: 0,
        tileSize: 512
      },
      {
        keepBuffer: isMobile ? 1 : 8,
        env: "paint-mode:FLAT"
      }
    );

    const waterLayer = createLayer(
      "https://geo.daochen.com/geoserver/osm/wms",
      waterLayerOptions
    );

    waterLayer.addTo(MapInstance.value!);
  };

  const addMainGroupLayer = () => {
    MapInstance.value?.createPane("geoserverPane");
    MapInstance.value?.createPane("tilePane");
    MapInstance.value?.createPane("waterPane");
    MapInstance.value?.createPane("normalMapPane");

    addLowMainLayer();
    addHighMainLayer();
    addOtherLayer();
    MapInstance.value!.getPane("waterPane")!.style.zIndex = "12";
    MapInstance.value!.getPane("geoserverPane")!.style.zIndex = "7";
    MapInstance.value!.getPane("tilePane")!.style.zIndex = "6";
    MapInstance.value!.getPane("normalMapPane")!.style.zIndex = "11";
  };
  return {
    addMainGroupLayer
  };
}
