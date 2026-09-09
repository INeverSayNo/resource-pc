import { nextTick, ref, shallowRef, unref, watch, Ref } from "vue";
import L from "leaflet";
import useBaseLayerHelper from "./useBaseLayerHelper";
import type { IProps } from "./type";

type MapKey = "countryLabel" | "countryBounds" | "chinaProvinceBounds";

export default function useTerrainMap(
  MapInstance: Ref<L.Map | null>,
  props: IProps
) {
  const { createTerrainLayer, createBaseLayerOptions, createLayer } =
    useBaseLayerHelper();

  // #region 山影
  const terrainLayer = shallowRef<L.MaplibreGL | null>();

  function addTerrainLayer() {
    if (!MapInstance.value) return;

    terrainLayer.value = createTerrainLayer(unref(MapInstance)!, {
      maplibreTextPane: "maplibreTerrainPane"
    });
    addGlobalCountryLayer();
    addChinaProvinceLayer();
  }

  function removeTerrainLayer() {
    if (terrainLayer.value) {
      try {
        const mapboxMap = terrainLayer.value.getMaplibreMap();
        terrainLayer.value.remove();
        mapboxMap.remove();
        terrainLayer.value = null;
      } catch (e) {
        console.error("移除山影图层时出错:", e);
      }
    }
    removeGlobalCountryLayer();
    removeChinaProvinceBoundsLayer();
  }

  // #endregion

  const countryBoundsLayer = ref<L.TileLayer.WMS | null>(null);
  const countryLabelLayer = ref<L.TileLayer.WMS | null>(null);
  const chinaProvinceBoundsLayer = ref<L.TileLayer.WMS | null>(null);

  // #region 全球国家边境与名称
  async function addGlobalCountryLayer() {
    MapInstance.value!.createPane("countryBoundsPane");
    MapInstance.value!.createPane("countryLabelPane");

    const boundsOptions = createBaseLayerOptions({
      layerName: "global_country_line",
      paneName: "countryBoundsPane",
      maxZoom: 20,
      minZoom: 3,
      tileSize: 512
    });

    const boundsLayer = createLayer(
      "https://geo.daochen.com//geoserver/osm/wms",
      boundsOptions
    );

    countryBoundsLayer.value = boundsLayer;
    countryBoundsLayer.value.addTo(MapInstance.value!);

    MapInstance.value!.getPane("countryBoundsPane")!.style.zIndex = "10007";

    const labelOptions = createBaseLayerOptions({
      layerName: "global_country_poi",
      paneName: "countryLabelPane",
      maxZoom: 20,
      minZoom: 3,
      tileSize: 512
    });
    const labelLayer = createLayer(
      "https://geo.daochen.com//geoserver/osm/wms",
      labelOptions
    );
    countryLabelLayer.value = labelLayer;
    countryLabelLayer.value.addTo(MapInstance.value!);
    MapInstance.value!.getPane("countryLabelPane")!.style.zIndex = "10007";
  }

  function removeGlobalCountryLayer() {
    if (countryBoundsLayer.value) {
      MapInstance.value?.removeLayer(countryBoundsLayer.value as any);
      countryBoundsLayer.value = null;
    }
    if (countryLabelLayer.value) {
      MapInstance.value?.removeLayer(countryLabelLayer.value as any);
      countryLabelLayer.value = null;
    }
  }
  // #endregion

  // #region 中国省份边界
  async function addChinaProvinceLayer() {
    MapInstance.value!.createPane("chinaProvinceBoundsPane");

    const provinceOptions = createBaseLayerOptions({
      layerName: "china_province_line",
      paneName: "chinaProvinceBoundsPane",
      maxZoom: 20,
      minZoom: 3,
      tileSize: 512
    });

    const provinceLayer = createLayer(
      "https://geo.daochen.com/geoserver/osm/wms",
      provinceOptions
    );
    chinaProvinceBoundsLayer.value = provinceLayer;
    chinaProvinceBoundsLayer.value.addTo(MapInstance.value!);
    MapInstance.value!.getPane("chinaProvinceBoundsPane")!.style.zIndex =
      "10007";
  }

  function removeChinaProvinceBoundsLayer() {
    if (chinaProvinceBoundsLayer.value) {
      MapInstance.value?.removeLayer(chinaProvinceBoundsLayer.value as any);
      chinaProvinceBoundsLayer.value = null;
    }
  }
  // #endregion

  watch(
    [() => props.showTerrain, () => MapInstance.value],
    ([showTerrain, instance]) => {
      if (instance) {
        if (showTerrain) {
          nextTick(addTerrainLayer);
        } else {
          removeTerrainLayer();
        }
      }
    }
  );

  return {
    terrainLayer,
    addTerrainLayer,
    removeTerrainLayer
  };
}
