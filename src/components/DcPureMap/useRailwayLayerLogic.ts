import { nextTick, shallowRef, watch, Ref } from "vue";
import L from "leaflet";
import type { IProps, IEmits } from "./type";
import { isMobile } from "./mapHelper";
import useBaseLayerHelper from "./useBaseLayerHelper";

export default function useRailwayLayerLogic(
  props: IProps,
  emits: IEmits,
  mapInstance: Ref<L.Map | null>
) {
  const { createBaseLayerOptions, createLayer } = useBaseLayerHelper();
  const railwayLineLayer = shallowRef<L.TileLayer.WMS | null>(null);
  const railwayBureauLayer = shallowRef<L.TileLayer.WMS | null>(null);
  const railwayBureauLabelLayer = shallowRef<L.TileLayer.WMS | null>(null);
  const railwayPointLayer = shallowRef<L.TileLayer.WMS | null>(null);

  // #region 路线
  const addRailwayLineLayer = async (lineName = "") => {
    if (!mapInstance.value) return;

    if (lineName && railwayLineLayer.value) {
      removeRailwayLineLayer();
    }

    await nextTick();
    mapInstance.value!.createPane("railwayLinePane");

    const lineOptions = createBaseLayerOptions(
      {
        layerName: lineName ? "dc_railway_line_select" : "dc_railway_line",
        paneName: "railwayLinePane",
        maxZoom: props.maxZoom || 18,
        minZoom: props.minZoom || 3,
        tileSize: 512
      },
      {
        cql_filter: lineName ? `line_name like '%,${lineName},%'` : "",
        styles: isMobile ? "dc_railway_line_new" : ""
      }
    );
    railwayLineLayer.value = createLayer(
      "https://geo.daochen.com/geoserver/osm/wms",
      lineOptions
    );
    railwayLineLayer.value.addTo(mapInstance.value);
    mapInstance.value!.getPane("railwayLinePane")!.style.zIndex = "1001";
    emits("init");
  };

  const railwayLineClickEvent = (evt: L.LeafletMouseEvent) => {
    if (
      !railwayLineLayer.value ||
      !mapInstance.value ||
      props.showRailwayBureau
    ) {
      return;
    }
    const latlng = evt.latlng;
    const point = mapInstance.value.latLngToContainerPoint(latlng);
    const size = mapInstance.value.getSize();

    const params = {
      request: "GetFeatureInfo",
      service: "WMS",
      version: "1.1.1",
      layers: "osm:dc_railway_line",
      query_layers: "osm:dc_railway_line",
      feature_count: 10,
      info_format: "application/json",
      srs: "EPSG:4326",
      width: size.x,
      height: size.y,
      x: Math.round(point.x),
      y: Math.round(point.y),
      bbox: mapInstance.value.getBounds().toBBoxString()
    };

    const url = `https://geo.daochen.com/geoserver/osm/wms?${Object.entries(
      params
    )
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&")}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data && data.features && data.features.length > 0) {
          emits("railwayLineClick", data.features[0].properties);
        }
      })
      .catch((error) => {
        console.error("获取WMS要素数据失败:", error);
      });
  };

  const removeRailwayLineLayer = () => {
    if (railwayLineLayer.value) {
      if (mapInstance.value?.hasLayer(railwayLineLayer.value)) {
        mapInstance.value.removeLayer(railwayLineLayer.value);
        railwayLineLayer.value = null;
      }
    }
  };

  // #endregion

  // #region 路局
  const addRailwayBureauLayer = async (bureanName = "") => {
    if (!mapInstance.value) return;
    if (bureanName && railwayBureauLayer.value) {
      removeRailwayBureauLayer();
    }

    await nextTick();
    mapInstance.value!.createPane("railwayBureauPane");

    const bureauOptions = createBaseLayerOptions(
      {
        layerName: bureanName
          ? "dc_railway_bureau_select"
          : "dc_railway_bureau",
        paneName: "railwayBureauPane",
        maxZoom: props.maxZoom || 18,
        minZoom: props.minZoom || 3,
        tileSize: 512
      },
      {
        cql_filter: bureanName ? `name = '${bureanName}'` : ""
      }
    );
    railwayBureauLayer.value = createLayer(
      "https://geo.daochen.com/geoserver/osm/wms",
      bureauOptions
    );
    railwayBureauLayer.value.addTo(mapInstance.value);
    mapInstance.value!.getPane("railwayBureauPane")!.style.zIndex = "1001";

    mapInstance.value.createPane("railwayBureauLabelPane");
    const bureauLabelOptions = createBaseLayerOptions(
      {
        layerName: "dc_railway_bureau_label",
        paneName: "railwayBureauPane",
        maxZoom: props.maxZoom || 18,
        minZoom: props.minZoom || 3,
        tileSize: 512
      },
      {
        styles: isMobile ? "dc_railway_bureau_label_new" : "",
        cql_filter: bureanName ? `name = '${bureanName}'` : ""
      }
    );

    railwayBureauLabelLayer.value = createLayer(
      "https://geo.daochen.com/geoserver/osm/wms",
      bureauLabelOptions
    );
    railwayBureauLabelLayer.value.addTo(mapInstance.value);
    mapInstance.value!.getPane("railwayBureauPane")!.style.zIndex = "1002";
  };

  const railwayBureauClickEvent = (evt: L.LeafletMouseEvent) => {
    if (!railwayBureauLayer.value || !mapInstance.value) return;
    evt.originalEvent.stopPropagation();
    const latlng = evt.latlng;
    const point = mapInstance.value.latLngToContainerPoint(latlng);
    const size = mapInstance.value.getSize();

    const params = {
      request: "GetFeatureInfo",
      service: "WMS",
      version: "1.1.1",
      layers: "osm:dc_railway_bureau",
      query_layers: "osm:dc_railway_bureau",
      feature_count: 10,
      info_format: "application/json",
      srs: "EPSG:4326",
      width: size.x,
      height: size.y,
      x: Math.round(point.x),
      y: Math.round(point.y),
      bbox: mapInstance.value.getBounds().toBBoxString()
    };

    const url = `https://geo.daochen.com/geoserver/osm/wms?${Object.entries(
      params
    )
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&")}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.features && data.features.length > 0) {
          const [feature] = data.features;
          emits("railwayBureauClick", {
            ...feature.properties,
            id: feature.id.split(".")[1]
          });
        }
      })
      .catch((error) => {
        console.error("获取WMS要素数据失败:", error);
      });
  };

  const removeRailwayBureauLayer = () => {
    if (railwayBureauLayer.value) {
      if (mapInstance.value?.hasLayer(railwayBureauLayer.value)) {
        mapInstance.value.removeLayer(railwayBureauLayer.value);
        railwayBureauLayer.value = null;
      }
    }
    if (railwayBureauLabelLayer.value) {
      if (mapInstance.value?.hasLayer(railwayBureauLabelLayer.value)) {
        mapInstance.value.removeLayer(railwayBureauLabelLayer.value);
        railwayBureauLabelLayer.value = null;
      }
    }
  };

  // #endregion

  // #region 站点
  const addRailwayPointLayer = async () => {
    if (!mapInstance.value) return;

    mapInstance.value!.createPane("railwayPointPane");

    const pointOptions = createBaseLayerOptions(
      {
        layerName: "dc_railway_point",
        paneName: "railwayPointPane",
        maxZoom: props.maxZoom || 18,
        minZoom: props.minZoom || 3,
        tileSize: 512
      },
      {
        styles: isMobile ? "osm:dc_railway_point_new" : ""
      }
    );

    railwayPointLayer.value = createLayer(
      "https://geo.daochen.com/geoserver/osm/wms",
      pointOptions
    );
    railwayPointLayer.value.addTo(mapInstance.value);
    mapInstance.value!.getPane("railwayPointPane")!.style.zIndex = "1002";
  };

  const removeRailwayPointLayer = () => {
    if (railwayPointLayer.value) {
      if (mapInstance.value?.hasLayer(railwayPointLayer.value)) {
        mapInstance.value.removeLayer(railwayPointLayer.value);
        railwayPointLayer.value = null;
      }
    }
  };

  const railwayPointClickEvent = (evt: L.LeafletMouseEvent) => {
    if (!railwayPointLayer.value || !mapInstance.value) return;
    const latlng = evt.latlng;
    const point = mapInstance.value.latLngToContainerPoint(latlng);
    const size = mapInstance.value.getSize();
    const zoomLevel = mapInstance.value.getZoom();
    let buffer = 5; // 默认较小的范围

    if (zoomLevel <= 6) {
      buffer = 15; // 低缩放级别，稍大的范围
    } else if (zoomLevel <= 10) {
      buffer = 10; // 中等缩放级别
    } else {
      buffer = 5; // 高缩放级别，精确点击
    }
    const params = {
      request: "GetFeatureInfo",
      service: "WMS",
      version: "1.1.1",
      layers: "osm:dc_railway_point",
      query_layers: "osm:dc_railway_point",
      feature_count: 10,
      info_format: "application/json",
      srs: "EPSG:4326",
      width: size.x,
      height: size.y,
      buffer: buffer,
      x: Math.round(point.x),
      y: Math.round(point.y),
      bbox: mapInstance.value.getBounds().toBBoxString()
    };

    const url = `https://geo.daochen.com/geoserver/osm/wms?${Object.entries(
      params
    )
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&")}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.features && data.features.length > 0) {
          const [feature] = data.features;
          console.log(data);

          emits("railwayPointClick", {
            ...feature.properties,
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            id: feature.id.split(".")[1]
          });
          return data;
        } else {
          const adjustedParams = {
            ...params,
            x: Math.round(point.x - 20)
          };
          const adjustedUrl = `https://geo.daochen.com/geoserver/osm/wms?${Object.entries(
            adjustedParams
          )
            .map(
              ([key, value]) => `${key}=${encodeURIComponent(String(value))}`
            )
            .join("&")}`;
          return fetch(adjustedUrl);
        }
      })
      .then((response) => {
        return typeof response === "object" ? response : response?.json();
      })
      .then((data) => {
        if (data && data.features && data.features.length > 0) {
          const [feature] = data.features;
          emits("railwayPointClick", {
            ...feature.properties,
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
            id: feature.id.split(".")[1]
          });
        } else {
          railwayLineClickEvent(evt);
        }
      })
      .catch((error) => {
        console.error("获取WMS要素数据失败:", error);
      });
  };

  const railwayLayerClickEvent = () => {
    mapInstance.value?.addEventListener("click", (e) => {
      if (railwayBureauLayer.value) {
        railwayBureauClickEvent(e);
      } else if (railwayPointLayer.value) {
        railwayPointClickEvent(e);
      }
    });
  };

  watch(
    [
      () => props.showRailwayLine,
      () => props.showRailwayBureau,
      () => mapInstance.value
    ],
    ([showLine, showBureau, instance]) => {
      if (instance) {
        if (showLine) {
          if (!railwayLineLayer.value) addRailwayLineLayer();
        } else {
          removeRailwayLineLayer();
        }
        if (showBureau) {
          if (!railwayBureauLayer.value) addRailwayBureauLayer();
        } else {
          removeRailwayBureauLayer();
        }
        railwayLayerClickEvent();
      }
    }
  );

  watch(
    [() => props.showRailwayStation, () => mapInstance.value],
    ([showStation, instance]) => {
      if (instance) {
        if (showStation) {
          nextTick(addRailwayPointLayer);
        } else {
          removeRailwayPointLayer();
        }
      }
    }
  );

  // #endregion

  return {
    removeRailwayLineLayer,
    railwayLineClickEvent,
    addRailwayLineLayer,
    addRailwayBureauLayer,
    removeRailwayBureauLayer,
    railwayBureauClickEvent,
    addRailwayPointLayer,
    removeRailwayPointLayer,
    railwayPointClickEvent
  };
}
