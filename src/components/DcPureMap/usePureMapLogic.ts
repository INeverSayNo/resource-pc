import L from "leaflet";
import { nextTick, onMounted, ref, shallowRef } from "vue";
import useMainLayer from "./useMainLayer";
import useRailwayLayerLogic from "./useRailwayLayerLogic";
import useTerrainMap from "./useTerrainMap";
import type { IProps, IEmits } from "./type";
(L.Marker.prototype as any)._animateZoom = function (opt: {
  zoom: number;
  center: L.LatLng;
}) {
  if (!this._map) {
    return;
  }
  const pos = this._map
    ._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center)
    .round();
  this._setPos(pos);
};

export default function usePureMapLogic(props: IProps, emits: IEmits) {
  const MapId = props.mapId || "dc-pure-map";
  const MapInstance = shallowRef<L.Map | null>(null);

  const { addMainGroupLayer } = useMainLayer(props, emits, MapInstance);
  const {
    addRailwayBureauLayer,
    addRailwayLineLayer,
    removeRailwayLineLayer,
    removeRailwayBureauLayer,
    removeRailwayPointLayer
  } = useRailwayLayerLogic(props, emits, MapInstance);
  useTerrainMap(MapInstance, props);
  const initMap = async (center?: L.LatLng, zoomLevel?: number) => {
    MapInstance.value = new L.Map(MapId, {
      center: center || [39.91210293174053, 116.40334681632915],
      zoom: zoomLevel || 13,
      maxZoom: props.maxZoom,
      minZoom: props.minZoom,
      zoomControl: false,
      attributionControl: props.showAttribution,
      preferCanvas: true,
      renderer: L.canvas()
    });
    setControlAttr();
    addMainGroupLayer();
    setEvents();
    await nextTick();
    emits("init");
  };

  const setControlAttr = () => {
    const attribution = MapInstance.value?.attributionControl;
    if (!attribution) return;
    if (props.useLargeCopyright) {
      const copyrightContainer = (attribution as any).getContainer();
      copyrightContainer!.parentElement!.style.right = "12px";
      copyrightContainer!.parentElement!.style.padding = "10px 20px";
      copyrightContainer!.parentElement!.style.backgroundColor = "#ffffffcc";
      copyrightContainer!.style.background = "transparent !important";
    }

    attribution.setPrefix(
      `<a href="https://www.daochen.com" style="font-size:${
        props.useLargeCopyright ? "38" : "12"
      }px" target="_blank">${props.copyright || "©道臣物流集团有限公司"}</a>`
    );
  };

  const isProgrammaticMove = ref(false);

  // 添加一个计时器变量，用于管理标志位重置
  let programmaticMoveTimer: ReturnType<typeof setTimeout> | null = null;
  const setEvents = () => {
    let moveEndTimer: NodeJS.Timeout | null = null;
    let zoomEndRecently = false;

    MapInstance.value?.on("zoomend", () => {
      zoomEndRecently = true;
      setTimeout(() => {
        zoomEndRecently = false;
      }, 50);
      emits("zoomEnd");

      console.group("缩放层级");
      console.log("当前缩放层级:", MapInstance.value?.getZoom());
      console.groupEnd();
    });
    MapInstance.value?.on("load", () => {
      emits("init");
    });
    MapInstance.value?.on("movestart", () => {
      
    });

    MapInstance.value?.on("click", (e) => {
      emits("click", e.latlng);
    });

    MapInstance.value?.on("moveend", (e) => {
      if (moveEndTimer) clearTimeout(moveEndTimer);

      moveEndTimer = setTimeout(() => {
        if (!zoomEndRecently) {
          if (isProgrammaticMove.value) {
            emits("programmaticMoveEnd");
          } else {
            emits("moveEnd");
          }
        }
      }, 20);
    });
  };

  function setMapCenter(lat: number, lng: number, zoomLevel?: number) {
    MapInstance.value?.panTo([lat, lng]);
    isProgrammaticMove.value = true;

    if (programmaticMoveTimer) {
      clearTimeout(programmaticMoveTimer);
    }

    MapInstance.value?.setView(
      [lat, lng],
      zoomLevel || MapInstance.value.getZoom()
    );

    programmaticMoveTimer = setTimeout(() => {
      isProgrammaticMove.value = false;
      programmaticMoveTimer = null;
    }, 500);
  }

  const reload = async (center?: L.LatLng, zoomLevel?: number) => {
    try {
      destoryMap();
      await nextTick();
      await initMap(center, zoomLevel);
    } catch (error) {
      console.error("Error reloading map:", error);
    }
  };

  const destoryMap = () => {
    if (MapInstance.value) {
      try {
        removeEvents();
        removeAllLayers();
        MapInstance.value.remove();
        MapInstance.value = null;
      } catch (error) {
        console.error("Error destroying map:", error);
      }
    }
  };

  const removeAllLayers = () => {
    if (!MapInstance.value) return;
    try {
      MapInstance.value.eachLayer((layer) => {
        if (
          layer instanceof L.TileLayer ||
          layer instanceof L.TileLayer.WMS ||
          layer instanceof L.LayerGroup
        ) {
          MapInstance.value!.removeLayer(layer);
        }
      });
    } catch (error) {
      console.error("Error removing layers:", error);
    }
  };

  const removeEvents = () => {
    if (!MapInstance.value) return;
    try {
      removeRailwayLineLayer();
      removeRailwayBureauLayer();
      removeRailwayPointLayer();
      MapInstance.value.off("zoomend");
      MapInstance.value.off("load");
      MapInstance.value.off("moveend");
      MapInstance.value.off("movestart");
      MapInstance.value.off("click");

      // 清理计时器
      if (programmaticMoveTimer) {
        clearTimeout(programmaticMoveTimer);
        programmaticMoveTimer = null;
      }
    } catch (error) {
      console.error("Error removing events:", error);
    }
  };

  onMounted(initMap);
  return {
    MapId,
    MapInstance,
    initMap,
    setMapCenter,
    addRailwayBureauLayer,
    addRailwayLineLayer,
    removeRailwayLineLayer,
    removeRailwayBureauLayer,
    reload
  };
}
