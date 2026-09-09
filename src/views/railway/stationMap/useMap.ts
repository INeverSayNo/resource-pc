import { onMounted, ref, render, h, reactive, watch, unref } from "vue";
import localforage from "localforage";
import { MapStyle } from "./mapStyle";
import { CreateCustomControl } from "./createCustomControl";
import { wgs84tobd09 } from "@/utils/locationConvert";
import { deepClone, GetAddress } from "@/utils";
import DcIcon from "@/components/icon/index.vue";
import resourceCmsApi from "@/views/resource/resource-cms/api";
import { useCms } from "../../resource/resource-cms/useCms";

import {
  ContainerType,
  renderLevelColor,
  renderLevelText,
  tagColorMap,
  tagColorPortMap
} from "./store";
import {
  GetAllPort,
  GetAllStation,
  GetPortByCityName,
  GetStationByCityName,
  QueryDtoStationAsync,
  SearchNearPort,
  SearchNearStation
} from "./api";
import { Router, useRoute, useRouter } from "vue-router";
import { Message } from "@/components/Message";
import { getBMapAK } from "@/api/esbApi";
import { ElMessage } from "element-plus";
import type { MessageHandler } from 'element-plus'
import { useStatisticTrace } from "@/hooks/useStatisticTrace";
import { ChooseItem } from "@/components/StationAddressSelect/type";
import { mapRoute } from './useMapRoute';
import { start } from "nprogress";

import privateLineIcon from '@/assets/icons/img/locationMarker.png'
import containerIcon from '@/assets/icons/img/containerLocation1.png'
import normalIcon from '@/assets/icons/img/normalLocation.png'
import selfIcon from '@/assets/icons/img/selfLocation.png'
import portIcon from '@/assets/icons/img/wharfIcon.png'
import addressLocation from '@/assets/icons/img/addressLocation.png'

type FilterState = {
  goodsName: string;
  goodsCode: string;
  stationType: string;
  isContainer: boolean;
  hasGoodPricePolicy: boolean;
  isDangerous: boolean;
};

type NearState = {
  nearLoading: boolean;
  locating: boolean;
  nearListType: "railway" | "waterway";
  nearText: string;
  showNearList: boolean;
  show: boolean;
  nearList: Dashboard.RailwayStationDto[];
  portNearList: Dashboard.WaterPortStationDto[];
};

type MapRoute = ReturnType<typeof mapRoute>

export function useMap(filterState: FilterState) {
  const { SetTrace } = useStatisticTrace();
  SetTrace("$SELECT", "铁路版块", "铁路站点地图");

  const router = useRouter();
  const route = useRoute();
  const { name = "" } = route.query;
  const storage = localforage.createInstance({
    driver: localforage.INDEXEDDB,
    name: "dashboardStationMap",
    description: "站港地图"
  });
  const id = `Map_container_dc_${new Date().getTime()}`;
  const containerRef = ref<HTMLDivElement>();
  const MapInstance = ref<BMapGL.Map>();

  const optionsState = reactive({
    useDefineStyle: false,
    levelMark: "district" as "province" | "city" | "district",
    mapLoading: false
  });

  const baseState = reactive({
    mapLoading: false,
    height: 0,
    activeName: "railway" as "railway" | "water"
  });

  function calcHeight() {
    const wrap = document.querySelector(".el-scrollbar__wrap");

    baseState.height = (wrap?.clientHeight || 901) - 25;
  }

  // 图标点
  const markerIconState = reactive({
    normalIcon: null as BMapGL.Icon | null,
    privateLineBmpIcon: null as BMapGL.Icon | null,
    containerBmpIcon: null as BMapGL.Icon | null,
    portBmpIcon: null as BMapGL.Icon | null,
    addressIcon: null as BMapGL.Icon | null
  });

  const oldPrivateLineMarker = ref<BMapGL.Overlay[]>([]);

  // 当前用户详细位置
  const currentLocation = ref<
    Record<"lat" | "lng", string | number> & { province: string }
  >();

  // #region 导航功能
  const navigationState = reactive({
    startPoint: {
      name: "",
      point: null as BMapGL.Point | null
    },
    endPoint: {
      name: "",
      point: null as BMapGL.Point | null
    },
    routeAddress: "",
    mapAutoCompleteInput: null as BMapGL.Autocomplete | null,
    mapRouteOverlays: {
      polyLine: null as BMapGL.Polyline | null,
      start: null as BMapGL.Marker | null,
      end: null as BMapGL.Marker | null
    },
    mapAutoCompleteResult: [] as { value: string }[],
    mapAutoLoading: false,
    mapRouteDescription: "",
    existingRouteInfo: {
      polyLine: null as BMapGL.Polyline | null,
      marker: {
        start: null as BMapGL.Marker | null,
        end: null as BMapGL.Marker | null
      }
    }
  })
  const mRoute = mapRoute(navigationState, MapInstance);
  // #endregion
  function initMap() {
    if (!Reflect.get(window, "BMapGL") || !Reflect.get(BMapGL, "Map")) {
      setTimeout(() => {
        initMap();
      }, 200);
      return;
    }
    MapInstance.value = new BMapGL.Map(containerRef.value!, {
      enableRotate: false,
      enableTiltGestures: false,
      enableRotateGestures: false
    } as any);
    MapInstance.value.setMapStyleV2({ styleJson: MapStyle });
    const p = new BMapGL.Point(116.404, 39.915);
    MapInstance.value.centerAndZoom(p, 12);
    MapInstance.value.enableScrollWheelZoom();
    MapInstance.value.enableContinuousZoom();
    MapInstance.value.onzoomend = () => {
      const zoomLevel = parseInt(`${MapInstance.value?.getZoom()}`);
      if (zoomLevel <= 6) {
        optionsState.levelMark = "province";
        const labelOverlayIndex = addressMarkerList.value.findIndex(
          (e) => !Reflect.has(Reflect.get(e, '_config') || {}, 'icon')
        );
        if (labelOverlayIndex > -1) {
          MapInstance.value?.removeOverlay(
            addressMarkerList.value[labelOverlayIndex]
          );
          addressMarkerList.value.splice(labelOverlayIndex, 1);
        }
      } else if (zoomLevel >= 9) {
        optionsState.levelMark = "district";
      } else {
        optionsState.levelMark = "city";
      }
      renderStation(optionsState.levelMark !== "district");
    };
    MapInstance.value.ondragend = () => {
      renderStation(true, true);
    };
    window.addEventListener("resize", () => { });
    initMarkerIcon();
    CreateStyleControl();
    location();
    navigationState.mapAutoCompleteInput = new BMapGL.Autocomplete({
      location: MapInstance.value,
      input: "mapAutoCompleteInput",
      onSearchComplete: (result) => {
        navigationState.mapAutoCompleteResult = [];
        const cont = result.getNumPois();
        for (let i = 0; i < cont; i++) {
          const pos: any = result.getPoi(i);
          navigationState.mapAutoCompleteResult.push({
            value: `${pos.province}${pos.city}${pos.district}${pos.street}${pos.business}`
          });
        }
        navigationState.mapAutoLoading = false;
      }
    });
  }

  function location() {
    function myFun(result) {
      const cityName = result.name;
      MapInstance.value?.setCenter(cityName, {
        callback: () => {
          loadTempStationPort(cityName);
          if (stationPortList.value.length) {
            renderStation();
            renderRouteQueryStation();
          } else {
            events.value.push(renderStation);
            events.value.push(renderRouteQueryStation);
          }
          bmapLocation(false);
        }
      });
    }
    const myCity = new BMapGL.LocalCity();
    myCity.get(myFun);
  }
  function bmapLocation(showMessage = true) {
    ElMessage.closeAll();
    let messageInstance: MessageHandler;
    if (showMessage) {
      const el = document.createElement("div");
      render(
        h(DcIcon, {
          name: "cycle",
          width: 1.6,
          height: 1.6,
          class: "dashboard-customer-loading turn"
        }),
        el
      );
      el.innerHTML += "定位中，请稍后";
      messageInstance = ElMessage.success({
        message: `<div class="dashboard-map-location-loading-wrap">${el.innerHTML}</div>`,
        duration: 0,
        dangerouslyUseHTMLString: true,
        type: "success",
      });
    }
    const geolocation = new BMapGL.Geolocation();
    geolocation.getCurrentPosition(function (r) {
      messageInstance?.close();
      if (geolocation.getStatus() === BMAP_STATUS_SUCCESS) {
        MapInstance.value?.setCenter(r.point);
        renderStation();
        currentLocation.value = {
          lat: r.point.lat,
          lng: r.point.lng,
          province: r.address.province
        };
      } else {
        showMessage && Message.warning("定位失败，请重试");
        console.error("failed" + geolocation.getStatus());
      }
    });
  }

  // 创建地图控件
  function CreateStyleControl(y = 94) {
    const TempControl = CreateCustomControl();
    const control = new TempControl({
      anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
      text: "简",
      class: "theme-color",
      offset: new BMapGL.Size(10, y + 60),
      action: () => {
        MapInstance.value?.setMapStyleV2({
          styleJson: optionsState.useDefineStyle ? MapStyle : []
        });
        control.content!.innerHTML = optionsState.useDefineStyle ? "简" : "全";
        optionsState.useDefineStyle = !optionsState.useDefineStyle;
      }
    });
    // 返回当前定位
    const el = document.createElement("div");
    el.classList.add("dashboard-map-location-icon");
    render(h(DcIcon, { name: "location" }), el);
    const backController = new TempControl({
      anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
      content: el,
      offset: new BMapGL.Size(10, y + 10),
      class: "theme-color",
      action: () => {
        bmapLocation();
      }
    });

    MapInstance.value?.addControl(control);
    MapInstance.value?.addControl(backController);
  }

  function initMarkerIcon() {
    markerIconState.normalIcon = new BMapGL.Icon(
      normalIcon,
      new BMapGL.Size(30, 30)
    );
    markerIconState.privateLineBmpIcon = new BMapGL.Icon(
      privateLineIcon,
      new BMapGL.Size(18, 18)
    );
    markerIconState.portBmpIcon = new BMapGL.Icon(
      portIcon,
      new BMapGL.Size(25, 25)
    );
    markerIconState.containerBmpIcon = new BMapGL.Icon(
      containerIcon,
      new BMapGL.Size(30, 30)
    );
    markerIconState.addressIcon = new BMapGL.Icon(
      addressLocation,
      new BMapGL.Size(30, 30)
    );
  }

  function renderStation(isClearOverlays = true, isKeepNavgate = false) {
    if (isClearOverlays) {
      MapInstance.value?.clearOverlays();
      if (isKeepNavgate) {
        if (navigationState.mapRouteOverlays.polyLine) {
          MapInstance.value?.addOverlay(navigationState.mapRouteOverlays.polyLine);
        }
        if (navigationState.mapRouteOverlays.end) {
          MapInstance.value?.addOverlay(navigationState.mapRouteOverlays.end);
        }
        if (navigationState.mapRouteOverlays.start) {
          MapInstance.value?.addOverlay(navigationState.mapRouteOverlays.start);
        }
      }
    }
    if (addressMarkerList.value.length) {
      addressMarkerList.value.forEach((e) => MapInstance.value?.addOverlay(e));
    }

    const bounds = MapInstance.value?.getBounds();
    if (bounds) {
      const viewAreaProvinceList = stationPortList.value.filter((e) =>
        bounds.containsPoint(e.provinceLocation!)
      );

      if (["city", "province"].some((e) => e === optionsState.levelMark)) {
        if (optionsState.levelMark === "province") {
          viewAreaProvinceList.forEach((province) => {
            const importantStationList: Dashboard.StationItem[] = [];
            let portCount = 0;
            const stationCount = province.cityList.reduce((prev, next) => {
              prev += next.stationList.length;
              portCount += next.portList.length;
              importantStationList.push(
                ...next.stationList.filter(
                  (e) =>
                    e.station.stationLevelMark &&
                    ["Core", "Important"].includes(e.station.stationLevelMark)
                )
              );
              return prev;
            }, 0);
            if (
              province.provinceLocation &&
              province.provinceLocation.lat !== 0 &&
              province.provinceLocation.lng !== 0
            ) {
              addProvinceCityMarkerLabel(
                province.provinceName,
                province.provinceLocation!,
                stationCount,
                portCount,
                true,
                importantStationList
              );
            }
          });
        } else {
          viewAreaProvinceList.forEach((province) => {
            province.cityList.forEach((city) => {
              const importantStationList = city.stationList.filter(
                (e) =>
                  e.station.stationLevelMark &&
                  ["Core", "Important"].includes(e.station.stationLevelMark)
              );
              if (
                city.cityLocation &&
                city.cityLocation.lat !== 0 &&
                city.cityLocation.lng !== 0
              ) {
                addProvinceCityMarkerLabel(
                  city.cityName,
                  city.cityLocation!,
                  city.stationList.length,
                  city.portList.length,
                  false,
                  importantStationList
                );
              }
            });
          });
        }
      } else {
        const viewAreaPortList: Dashboard.PortItem[] = [];
        const viewAreaStationList = stationPortList.value.reduce(
          (prev, next) => {
            next.cityList.forEach((city) => {
              prev.push(
                ...city.stationList.filter((e) =>
                  bounds.containsPoint(e.station.formatLocation)
                )
              );
              viewAreaPortList.push(
                ...city.portList.filter((e) =>
                  bounds.containsPoint(e.station.formatLocation)
                )
              );
            });
            return prev;
          },
          [] as Dashboard.StationItem[]
        );
        addMarkerLable(viewAreaStationList);
        addMarkerLable(viewAreaPortList);
      }
    }
    if (navigationState.existingRouteInfo.polyLine) {
      MapInstance.value?.addOverlay(navigationState.existingRouteInfo.polyLine);
      MapInstance.value?.addOverlay(navigationState.existingRouteInfo.marker.start!);
      MapInstance.value?.addOverlay(navigationState.existingRouteInfo.marker.end!);
    }
  }

  function addMarkerLable(
    payload: Dashboard.StationItem[] | Dashboard.PortItem[],
    dispatch = false
  ) {
    for (const stationPortItem of payload) {
      const isStation = Reflect.has(
        stationPortItem.station,
        "railwayStationName"
      );
      const marker = new BMapGL.Marker(stationPortItem.station.formatLocation, {
        icon: isStation
          ? markerIconState.normalIcon!
          : markerIconState.portBmpIcon!
      });
      if (
        isStation &&
        checkStationHasContainer(stationPortItem as Dashboard.StationItem)
      ) {
        marker.setIcon(markerIconState.containerBmpIcon!);
      }

      const label = createLabel(
        stationPortItem.station.formatLocation,
        stationPortItem
      );
      MapInstance.value?.addOverlay(label);
      MapInstance.value?.addOverlay(marker);
      const markerAndLabelEvent = () => {
        oldPrivateLineMarker.value.forEach((y) =>
          MapInstance.value?.removeOverlay(y)
        );
        oldPrivateLineMarker.value.length = 0;

        let infoWindow: BMapGL.InfoWindow;
        if (isStation) {
          infoWindow = createInfoWindow(
            stationPortItem as Dashboard.StationItem,
            stationPortItem.station.formatLocation,
            router,
            filterState,
            nearState,
            mRoute,
            loadNearStation,
            loadNearPort
          );
          const privateLineMarker = createPrivateLineMark(
            stationPortItem.station.formatLocation,
            markerIconState,
            (stationPortItem as Dashboard.StationItem).zyxList
          );
          privateLineMarker?.forEach((y) => {
            oldPrivateLineMarker.value.push(y.marker, y.label, y.line);
            MapInstance.value?.addOverlay(y.marker);
            MapInstance.value?.addOverlay(y.label);
            MapInstance.value?.addOverlay(y.line);
            y.marker.addEventListener("click", () => {
              MapInstance.value?.openInfoWindow(y.infoWindow, y.point);
            });
          });
        } else {
          infoWindow = createPortInfoWindow(
            stationPortItem as Dashboard.PortItem,
            stationPortItem.station.formatLocation,
            router,
            filterState,
            nearState,
            mRoute,
            loadNearStation,
            loadNearPort
          );
        }
        MapInstance.value?.openInfoWindow(
          infoWindow,
          stationPortItem.station.formatLocation
        );
      };
      marker.addEventListener("click", markerAndLabelEvent);
      label.addEventListener("click", markerAndLabelEvent);
      if (dispatch) {
        markerAndLabelEvent();
      }
    }
  }

  // 缩放级别为省/地级市时渲染方法
  function addProvinceCityMarkerLabel(
    prefix: string,
    point: BMapGL.Point,
    stationCount: number,
    portCount: number,
    isProvince: boolean,
    importantStationList: Dashboard.StationItem[] = []
  ) {
    if (!isProvince) {
      addMarkerLable(importantStationList);
    }
    const marker = new BMapGL.Marker(point, {
      icon: markerIconState.normalIcon!
    });
    const wrap = document.createElement("p");
    wrap.innerHTML = `<span class="dashboard-city-province-count">${prefix}</span> <span class="dashboard-city-province-count">(站：${stationCount})</span>`;
    if (portCount) {
      wrap.innerHTML += ` <i class='dashboard-map-label-drivder'>/</i> <span class="dashboard-city-province-count">(港：${portCount})</span>`;
    }
    const label = createLabel(point, wrap);
    MapInstance.value?.addOverlay(label);
    MapInstance.value?.addOverlay(marker);
  }

  // #region 站点数据
  const events = ref<Function[]>([]);
  const stationPortList = ref<Dashboard.ProvinceItem[]>([]);
  function getAllStationPort() {
    storage.getItem("stationPortList").then((res) => {
      if (Array.isArray(res) && res.length) {
        stationPortList.value = res;
      }
    });
    Promise.all([GetAllStation(), GetAllPort()]).then((res) => {
      const [stationListRsp, portListRsp] = res;
      if (Array.isArray(stationListRsp) && stationListRsp.length) {
        const result = stationListRsp
          .filter(
            (e) =>
              Boolean(e.station.provinceName) &&
              Boolean(e.station.railwayLocation)
          )
          .reduce((prev, next) => {
            const [railwayLng, railwayLat] =
              next.station.railwayLocation.split(",");
            const [bdLng, bdLat] = wgs84tobd09(+railwayLng, +railwayLat);
            next.station["formatLocation"] = new BMapGL.Point(bdLng, bdLat);
            if (
              prev.every(
                (item) => item.provinceName !== next.station.provinceName
              )
            ) {
              const location = next.station.provinceLocation?.split(",");
              const point = location
                ? new BMapGL.Point(+location[0], +location[1])
                : null;
              prev.push({
                provinceName: next.station.provinceName,
                provinceLocation: point,
                cityList: [
                  {
                    cityName: next.station.cityName,
                    cityLocation: getCityLocation(
                      next.station.cityLocation,
                      next.station.address
                    ),
                    portList: [],
                    stationList: [next]
                  }
                ]
              });
            } else {
              const index = prev.findIndex(
                (item) => item.provinceName === next.station.provinceName
              );
              if (
                prev[index].cityList.every(
                  (item) => item.cityName !== next.station.cityName
                )
              ) {
                prev[index].cityList.push({
                  cityName: next.station.cityName,
                  cityLocation: getCityLocation(
                    next.station.cityLocation,
                    next.station.address
                  ),
                  portList: [],
                  stationList: [next]
                });
              } else {
                const cityIndex = prev[index].cityList.findIndex(
                  (item) => item.cityName === next.station.cityName
                );
                prev[index].cityList[cityIndex].stationList.push(next);
              }
            }
            return prev;
          }, [] as Dashboard.ProvinceItem[])
          .filter((e) => Boolean(e.provinceLocation));
        portListRsp.forEach((portItem) => {
          const [waterwayLat, waterwayLng] =
            portItem.station.portCoord.split("/");
          const [bdLng, bdLat] = wgs84tobd09(+waterwayLng, +waterwayLat);
          portItem.station["formatLocation"] = new BMapGL.Point(bdLng, bdLat);
          const provinceItem = result.find(
            (e) => e.provinceName === portItem.station.provinceName
          );
          if (provinceItem) {
            const cityItem = provinceItem?.cityList.find(
              (e) => e.cityName === portItem.station.cityName
            );
            if (cityItem) {
              if (!Reflect.has(cityItem, "portList")) {
                cityItem["portList"] = [portItem];
              } else {
                cityItem["portList"].push(portItem);
              }
            }
          }
        });
        storage.setItem("stationPortList", result);
        if (!stationPortList.value.length) {
          stationPortList.value = result;
        }
      }
    });
  }

  function renderRouteQueryStation() {
    if (name) {
      let matchStationPort: Dashboard.PortItem | Dashboard.StationItem | null =
        null;
      for (let i = 0; i < stationPortList.value.length; i++) {
        for (let j = 0; j < stationPortList.value[i].cityList.length; j++) {
          const matchStation = stationPortList.value[i].cityList[
            j
          ].stationList.find((e) => e.station.railwayStationName === name);
          if (matchStation) {
            matchStationPort = matchStation;
            break;
          }
        }
      }
      if (matchStationPort) {
        setTimeout(() => {
          MapInstance.value?.panTo(matchStationPort!.station!.formatLocation);
          addMarkerLable([matchStationPort] as any, true);
        }, 1000);
      }
    }
  }

  watch(
    [stationPortList, events],
    ([stations, es]) => {
      if (stationPortList.value.length && events.value.length) {
        events.value.forEach((e) => e());
        events.value.length = 0;
      }
    },
    {
      immediate: true,
      deep: true
    }
  );

  // #endregion

  // #region 附近站点/港口

  const nearState = reactive({
    nearLoading: false,
    locating: false,
    nearListType: "railway" as "railway" | "waterway",
    nearText: "",
    showNearList: false,
    show: false, // 是否显示附近站点港口
    nearList: [] as Dashboard.RailwayStationDto[],
    portNearList: [] as Dashboard.WaterPortStationDto[]
  });

  /**
   * 获取附近站点
   * @param point
   * @param provinceName 省份名称
   */

  const searchNearStationParams = ref<Dashboard.NearLocationPointParam>({});
  function loadNearStation(payload: object): void;
  // eslint-disable-next-line no-redeclare
  function loadNearStation(
    point: BMapGL.Point,
    provinceName?: string,
    stationId?: string,
    stationName?: string
  ): void;
  // eslint-disable-next-line no-redeclare
  function loadNearStation(
    payload: BMapGL.Point | object,
    provinceName?: string,
    stationId?: string,
    stationName?: string
  ) {
    nearState.show = true;

    let param = {} as Dashboard.NearLocationPointParam;
    if (Reflect.has(payload, "hasGoodPricePolicy")) {
      param = deepClone(payload);
    } else {
      param = {
        latitude: (payload as BMapGL.Point).lat,
        longitude: (payload as BMapGL.Point).lng,
        provinceName,
        stationId,
        stationName
      };
    }

    nearState.nearList = [];
    nearState.nearLoading = true;
    nearState.nearText = stationName ? `${stationName}站-` : "当前位置-";
    if (!provinceName && !Reflect.has(payload, "provinceName")) {
      const geoc = new BMapGL.Geocoder();
      const point = new BMapGL.Point(param.latitude!, param.longitude!);
      geoc.getLocation(point, (rs) => {
        param.provinceName = rs.addressComponents.province;
        searchNearStationParams.value = param;
        SearchNearStation(param)
          .then((res) => {
            nearState.nearList = res.data.sort((x, y) =>
              x.distance > y.distance ? 1 : -1
            );
          })
          .finally(() => {
            nearState.nearLoading = false;
          });
      });
    } else {
      searchNearStationParams.value = param;
      SearchNearStation(param)
        .then((res) => {
          nearState.nearList = res.data.sort((x, y) =>
            x.distance > y.distance ? 1 : -1
          );
        })
        .finally(() => {
          nearState.nearLoading = false;
        });
    }
  }
  /**
   * 获取附近港口
   * @param point
   * @param provinceName 省份名称
   */
  function loadNearPort(
    point: BMapGL.Point,
    provinceName?: string,
    stationId?: string,
    portName?: string
  ) {
    nearState.show = true;
    const param = {
      latitude: point.lat,
      longitude: point.lng,
      provinceName,
      stationId,
      portName
    };
    nearState.portNearList = [];
    nearState.nearLoading = true;
    nearState.nearText = portName ? `${portName}-` : "当前位置-";
    if (!provinceName) {
      const geoc = new BMapGL.Geocoder();
      geoc.getLocation(point, (rs) => {
        param.provinceName = rs.addressComponents.province;
        SearchNearPort(param)
          .then((res) => {
            nearState.portNearList = res.data;
          })
          .finally(() => {
            nearState.nearLoading = false;
          });
      });
    } else {
      nearState.nearLoading = true;
      SearchNearPort(param)
        .then((res) => {
          nearState.portNearList = res.data;
        })
        .finally(() => {
          nearState.nearLoading = false;
        });
    }
  }

  // 打开站点港口详情弹窗
  function handleSelectNearStationPort(
    payload: Dashboard.RailwayStationDto | Dashboard.WaterPortStationDto,
    type: "railway" | "waterway"
  ) {
    const id =
      type === "railway"
        ? (payload as Dashboard.RailwayStationDto).id
        : (payload as Dashboard.WaterPortStationDto)._id;
    let matchStationPort: Dashboard.PortItem | Dashboard.StationItem | null =
      null;
    for (let i = 0; i < stationPortList.value.length; i++) {
      for (let j = 0; j < stationPortList.value[i].cityList.length; j++) {
        const matchStation = stationPortList.value[i].cityList[
          j
        ].stationList.find((e) => e.station.id === id);
        if (matchStation) {
          matchStationPort = matchStation;
          break;
        }
        const matchPort = stationPortList.value[i].cityList[j].portList.find(
          (e) => e.station.id === id
        );
        if (matchPort) {
          matchStationPort = matchPort;
          break;
        }
      }
    }
    if (matchStationPort) {
      calcuteNavigationDistance(matchStationPort)
        .then((navgationDistance) => {
          if (navgationDistance != -1) {
            payload.distance = navgationDistance;
            payload.navigate = true;
          }
          MapInstance.value?.setCenter(matchStationPort!.station.formatLocation, {
            callback: () => {
              MapInstance.value?.setZoom(12);
              addMarkerLable([matchStationPort] as any, true);
            }
          });
        });
    }
  }

  // #endregion

  //#region 选择附近点，并继续导航距离计算
  function calcuteNavigationDistance(current: Dashboard.PortItem | Dashboard.StationItem) {
    return new Promise<number>((resolve) => {
      try {
        mRoute.clearMapRoute();
        if (!searchNearStationParams.value?.latitude || !searchNearStationParams.value?.longitude) {
          resolve(-1);
          return;
        }
        const currentLocation = unref(current.station.formatLocation);
        const startp = new BMapGL.Point(currentLocation.lng, currentLocation.lat);
        const arrivep = new BMapGL.Point(searchNearStationParams.value?.longitude, searchNearStationParams.value?.latitude);
        var transit = new BMapGL.DrivingRoute(MapInstance.value!, {
          renderOptions: {
            map: MapInstance.value!,
            autoViewport: false
          },
          onSearchComplete: (results) => {
            if (transit.getStatus() !== BMAP_STATUS_SUCCESS) {
              resolve(-1);
              return;
            }
            const plan = results.getPlan(0);
            const distance = plan.getDistance(false) as number / 1000.00;
            let destName = "";
            if (Reflect.has(current.station, "_id")) {
              destName = (current as Dashboard.PortItem).station.portAreaName
            } else {
              destName = (current as Dashboard.StationItem).station.railwayStationName;
            }
            const originName = searchNearStationParams.value?.stationName || "当前定位";
            let output = `${originName} 到 ${destName}`;
            output += " 总路程为：";
            output += plan.getDistance(true);
            output += " 约需要：";
            output += plan.getDuration(true); // 获取时间
            navigationState.mapRouteDescription = output;
            resolve(distance);
          },
          onPolylinesSet: (routes) => {
            navigationState.mapRouteOverlays.polyLine = routes[0].getPolyline();
          },
          onMarkersSet: (points) => {
            navigationState.mapRouteOverlays.start = points.find(
              (x) => x.title === "起点"
            )?.marker || null;
            navigationState.mapRouteOverlays.end = points.find(
              (x) => x.title === "终点"
            )?.marker || null
          }
        });
        transit.search(startp, arrivep);
      } catch (error) {
        resolve(-1);
      }
    })
  }
  //#endregion 

  // #region 重要通知
  const cmsState = reactive({
    cmsList: [] as Dashboard.CmsHeadDto[],
    cmsExpaned: true,
    showCms: false,
    cmsId: ""
  });
  const { handleRead } = useCms();
  function loadCmsList() {
    resourceCmsApi.Query({ page: 1, pageSize: 5 }).then((res) => {
      cmsState.cmsList = res.items || [];
    });
  }
  function handleCmsShow() {
    cmsState.cmsId = "";
    cmsState.showCms = true;
  }
  function handleCmsRead(item: Dashboard.CmsHeadDto) {
    handleRead(item);
  }

  // #endregion

  // #region 临时站点/港口数据

  function loadTempStationPort(cityName: string) {
    storage.getItem("stationPortList").then((res) => {
      if (!res) {
        Promise.all([
          GetStationByCityName(cityName),
          GetPortByCityName(cityName)
        ]).then((res) => {
          if (res) {
            const [stationList, portList] = res;
            addMarkerLable(
              stationList
                .filter((e) => e.station.railwayLocation)
                .map((e) => {
                  const [lng, lat] = e.station.railwayLocation.split(",");
                  return {
                    ...e,
                    station: {
                      ...e.station,
                      formatLocation: new BMapGL.Point(lng, lat)
                    }
                  };
                })
            );
            addMarkerLable(
              portList
                .filter((e) => e.station.portCoord)
                .map((e) => {
                  const [lat, lng] = e.station.portCoord.split(",");
                  return {
                    ...e,
                    station: {
                      ...e.station,
                      formatLocation: new BMapGL.Point(lng, lat)
                    }
                  };
                })
            );
          }
        });
      }
    });
  }
  // #endregion

  const addressMarkerList = ref<BMapGL.Overlay[]>([]);
  function addAddressMarker(
    point: BMapGL.Point,
    payload: ChooseItem,
    routerAction: Router
  ) {
    addressMarkerList.value.forEach((e) => MapInstance.value?.removeOverlay(e));
    const marker = new BMapGL.Marker(point, {
      icon: markerIconState.addressIcon!
    });
    const style: Partial<HTMLElement["style"]> = {
      fontSize: "14px",
      borderColor: "#ccc",
      lineHeight: "30px",
      borderRadius: "5px",
      padding: "0px 10px",
      zIndex: "9999 !important"
    };
    const wrapEl = document.createElement("div");
    const mainEl = document.createElement("div");
    mainEl.style.width = "260px";
    const titleEl = document.createElement("p");
    const addressTitle = document.createElement("span");
    const closeBtn = document.createElement("span");
    addressTitle.innerHTML = payload.address;
    render(h(DcIcon, { name: "red-close" }), closeBtn);
    titleEl.appendChild(addressTitle);
    titleEl.appendChild(closeBtn);
    const operateEl = document.createElement("div");
    const sendBtn = document.createElement("p");
    render(h(DcIcon, { name: "start" }), sendBtn);
    sendBtn.innerHTML +=
      "<span class='dashboard-send-there-label'>从这发货</span>";
    const arriveBtn = document.createElement("p");
    render(h(DcIcon, { name: "arrive" }), arriveBtn);
    arriveBtn.innerHTML +=
      "<span class='dashboard-arrive-there-label'>到货这里</span>";
    operateEl.appendChild(sendBtn).appendChild(arriveBtn);
    titleEl.style.display = "flex";
    titleEl.style.justifyContent = "space-between";
    titleEl.style.alignItems = "baseline";
    (titleEl.firstElementChild as HTMLSpanElement)!.style.maxWidth = "80%";
    (titleEl.firstElementChild as HTMLSpanElement).style.overflow = "hidden";
    (titleEl.firstElementChild as HTMLSpanElement).style.textOverflow =
      "ellipsis";
    (titleEl.firstElementChild as HTMLSpanElement).style.whiteSpace = "nowrap";
    (titleEl.firstElementChild as HTMLSpanElement).style.marginBottom = "10px";
    closeBtn.style.cursor = "pointer";
    sendBtn.style.marginRight = "10px";
    sendBtn.style.cursor = "pointer";
    arriveBtn.style.cursor = "pointer";
    operateEl.style.display = "flex";
    operateEl.style.alignItems = "center";
    operateEl.style.justifyContent = "flex-end";
    mainEl.appendChild(titleEl).appendChild(operateEl);
    wrapEl.appendChild(mainEl);

    const clickEvent = (type: "send" | "arrive") => {
      sessionStorage.setItem(
        "tgsSolutionQueryParams",
        JSON.stringify({
          value: payload.address,
          type: 2,
          lat: payload.lat,
          lng: payload.lng,
          goodsName: filterState.goodsName,
          goodsCode: filterState.goodsCode,
          adt: {
            province: payload.province,
            city: payload.city,
            district: payload.district,
            town: ""
          },
          isStart: type === "send"
        })
      );
      routerAction.push({
        path: "/resource-app/tgs-solution-query"
      });
    };

    const label = new BMapGL.Label(wrapEl.innerHTML, {
      position: point,
      offset: new BMapGL.Size(-136, -90)
    });
    label.setZIndex(9999);
    label.setStyle(style as any);

    label.addEventListener("click", (event) => {
      if (event.domEvent.target.innerHTML === "从这发货") {
        clickEvent("send");
      }
      if (event.domEvent.target.innerHTML === "到货这里") {
        clickEvent("arrive");
      }
      if (
        event.domEvent.target.innerHTML.indexOf("red-close") > -1 ||
        event.domEvent.target.parentElement.innerHTML.indexOf("red-close") > -1
      ) {
        // delete label
        MapInstance.value?.removeOverlay(label);
      }
    });

    marker.addEventListener("click", () => {
      MapInstance.value?.addOverlay(label);
    });

    addressMarkerList.value = [marker, label];
    MapInstance.value?.addOverlay(marker);
    MapInstance.value?.addOverlay(label);
  }

  function renderStationProperties(item: Dashboard.RailwayStationDto) {
    const result = [
      {
        value: `${item.stationaryUserNames?.length ? "√有驻站人员" : "×无驻站人员"
          }`,
        class: item.stationaryUserNames?.length ? "success" : "danger"
      },
      {
        value: `${item.hasPricePolicy ? "√有优价" : "×无优价"}`,
        class: item.hasPricePolicy ? "success" : "danger"
      },
      {
        value: `${item.hasPrivateLine ? "√有专用线" : "×无专用线"}`,
        class: item.hasPrivateLine ? "success" : "danger"
      },
      {
        value: `${item.isCrhExpress + "" === "true" ? "√" : "×"}高铁快运`,
        class: item.isCrhExpress + "" === "true" ? "success" : "danger"
      },
      {
        value: `${item.isHbExpress + "" === "true" ? "√" : "×"}行包快运`,
        class: item.isHbExpress + "" === "true" ? "success" : "danger"
      }
    ] as { value: string; class: string }[];
    result.sort((a) => {
      return a.class === "success" ? -1 : 1;
    });
    return result;
  }
  onMounted(() => {
    getAllStationPort();
    loadCmsList();
    window.onresize = calcHeight;
    window.initialize = function () {
      initMap();
    };
    getAK().then((ak) => {
      loadJs(
        "//api.map.baidu.com/api?v=1.0&type=webgl&callback=initialize",
        ak,
        () => {
          initMap();
          calcHeight();
        }
      );
    });
  });
  return {
    id,
    containerRef,
    optionsState,
    MapInstance,
    renderStation,
    initMap,
    stationPortList,
    addMarkerLable,
    baseState,
    nearState,
    loadNearStation,
    loadNearPort,
    handleSelectNearStationPort,
    renderStationProperties,
    cmsState,
    handleCmsShow,
    handleCmsRead,
    currentLocation,
    addAddressMarker,
    searchNearStationParams,
    navigationState
  };
}

function getCityLocation(
  cityLocationStr: string | null,
  stationLocation: string | null
) {
  if (cityLocationStr) {
    const [lng, lat] = cityLocationStr.split(",");
    return new BMapGL.Point(+lng, +lat);
  }
  if (stationLocation && stationLocation.startsWith("{")) {
    const formatLocation = JSON.parse(stationLocation);
    return new BMapGL.Point(formatLocation.lng, formatLocation.lat);
  }
}

/** 检查是否存在集装箱 */
function checkStationHasContainer(item: Dashboard.StationItem) {
  if (
    String(item.station.isContainer) === "true" ||
    item.station.containerArriveHS ||
    item.station.containerSendHS
  ) {
    return true;
  }
  if (!item.zyxList.length) return false;
  for (let i = 0; i < item.zyxList.length; i++) {
    const zyxItem = item.zyxList[i];
    if (zyxItem.containerArriveHS || zyxItem.containerSendHS) return true;
  }
}

/** 创建点标签 */
function createLabel(
  point: BMapGL.Point,
  data: Dashboard.StationItem | Dashboard.PortItem | HTMLDivElement
) {
  let name = "";
  let baseLenth = 0;
  if (Reflect.has(data, "station")) {
    baseLenth = 18;
    const isStation = Reflect.has(
      (data as Dashboard.PortItem | Dashboard.StationItem).station,
      "railwayStationName"
    );
    if (isStation) {
      name = `${renderLevelText(
        (data as Dashboard.StationItem).station.stationLevelMark || ""
      )}${(data as Dashboard.StationItem).station.railwayStationName}`;
    } else {
      name = `${renderLevelText(
        (data as Dashboard.PortItem).station.portScale
      )}${(data as Dashboard.PortItem).station.portAreaName}`;
    }
  } else {
    baseLenth = 10;
    name = (data as HTMLElement).innerHTML;
  }

  const namePath = Reflect.has(data, "station")
    ? getNameLength(name)
    : getNameLength((data as HTMLElement).innerText);

  const label = new BMapGL.Label(name, {
    position: point,
    offset: new BMapGL.Size(-(namePath * baseLenth) - 3, -45)
  });
  const style: Partial<HTMLElement["style"]> = {
    fontSize: "14px",
    borderColor: "#ccc",
    lineHeight: "30px",
    borderRadius: "5px",
    padding: "0px 10px"
  };
  if (Reflect.has(data, "station")) {
    style.color = renderLevelColor(
      (data as Dashboard.StationItem).station.stationLevelMark || ""
    );
  }
  label.setStyle(style as any);
  return label;
}

function getNameLength(name: string) {
  const anumLength =
    name.match(/[A-Za-z0-9]+/g)?.reduce((a, c) => {
      return a + c.length;
    }, 0) || 0;
  const startLength = name.match(/\★/g)?.length || 0;
  return (
    (name.length - anumLength - startLength) / 2 +
    anumLength / 4 +
    startLength / 3.3
  );
}

/** 创建信息窗 */
function createInfoWindow(
  data: Dashboard.StationItem,
  p: BMapGL.Point,
  routerAction: Router,
  filterState: FilterState,
  nearState: NearState,
  mapRoute: MapRoute,
  loadNearStation: (
    point: BMapGL.Point,
    provinceName?: string,
    stationId?: string,
    stationName?: string
  ) => void,
  loadNearPort: (
    point: BMapGL.Point,
    provinceName?: string,
    portId?: string,
    portName?: string
  ) => void
) {
  const title = `<b>${data.station.railwayStationName}(${data.station.railwayStationCode
    }/${data.station.railwayStationDbm
    })</b><span class='theme-danger mr-20 fr'>${data.station.rate.toFixed(
      2
    )}%</span>`;
  const opts = {
    title: title, // 信息窗口标题
    message: data.station.id
  };
  const textEl = document.createElement("div");
  textEl.style.padding = "5px";
  textEl.setAttribute("class", "station-map-content");
  const lastP = document.createElement("p");
  lastP.classList.add("tr", "dashboard-info-window-last-p");

  const near = document.createElement("a");
  near.href = "javascript:void(0);";
  render(h(DcIcon, { name: "near" }), near);
  near.innerHTML += "<span>附近站港</span>";
  near.classList.add("dashboard-operate-btn-text-wrap");
  near.addEventListener("click", () => {
    nearState.show = true;
    nearState.showNearList = true;
    nearState.nearListType = "railway";
    loadNearStation(
      p,
      data.station.provinceName,
      data.station.id,
      data.station.railwayStationName
    );
    loadNearPort(p, data.station.provinceName);
  });
  lastP.appendChild(near);

  const routeEl = document.createElement("a");
  routeEl.href = "javascript:void(0);";
  render(h(DcIcon, { name: "guide" }), routeEl);
  routeEl.innerHTML += "<span>到这里</span>";
  routeEl.classList.add("dashboard-operate-btn-text-wrap");
  lastP.appendChild(routeEl);

  routeEl.addEventListener("click", () => {
    mapRoute.renderRouteForm(data.station.railwayStationName, p, infoWindow);
  });

  const more = document.createElement("a");
  more.href = "javascript:void(0);";
  render(h(DcIcon, { name: "detail" }), more);
  more.innerHTML += "<span>详情</span>";
  more.classList.add("dashboard-operate-btn-text-wrap");
  more.addEventListener("click", () => {
    routerAction.push({
      path: "/resource-app/station-dt",
      query: { id: data.station.id, name: data.station.railwayStationName }
    });
  });
  lastP.appendChild(more);

  const sendThere = document.createElement("p");
  render(h(DcIcon, { name: "start", width: 1.2, height: 1.2 }), sendThere);
  sendThere.innerHTML +=
    "<span class='dashboard-send-there-label'>从这发货</span>";
  sendThere.classList.add("dashboard-send-there-wrap");
  const arriveThere = document.createElement("p");
  render(h(DcIcon, { name: "arrive", width: 1.2, height: 1.2 }), arriveThere);
  arriveThere.innerHTML +=
    "<span class='dashboard-arrive-there-label'>到货这里</span>";
  lastP.appendChild(sendThere);
  lastP.appendChild(arriveThere);

  function toQuerySolution(type: "start" | "arrive") {
    sessionStorage.setItem(
      "tgsSolutionQueryParams",
      JSON.stringify({
        value: data.station.railwayStationName,
        type: 1,
        lat: p.lat,
        lng: p.lng,
        goodsName: filterState.goodsName,
        goodsCode: filterState.goodsCode,
        adt: {
          province: data.station.provinceName,
          city: data.station.cityName,
          district: data.station.districtName,
          town: ""
        },
        isStart: type === "start"
      })
    );
    routerAction.push({
      path: "/resource-app/tgs-solution-query"
    });
  }

  sendThere.addEventListener("click", () => toQuerySolution("start"));
  arriveThere.addEventListener("click", () => toQuerySolution("arrive"));

  textEl.appendChild(lastP);
  const infoWindow = new BMapGL.InfoWindow(textEl, opts);
  let hasAddNotice = false;
  infoWindow.addEventListener("open", function () {
    infoWindow.setWidth(document.body.offsetWidth - 40);
    textEl.innerHTML = "";
    const loading = createLoadingEl();
    textEl.appendChild(loading);
    QueryDtoStationAsync({
      railwayStationDbm: data.station.railwayStationDbm,
      railwayStationCode: data.station.railwayStationCode,
      page: 1,
      pageSize: 1
    })
      .then((res) => {
        if (res?.items?.length) {
          const content = createStationEl(res.items[0]);
          textEl.appendChild(content);
          if (!hasAddNotice && res.items[0].cmsNum) {
            const noticeEl = createStationNoticeEl(res.items[0], routerAction);
            lastP.insertBefore(noticeEl, more);
            hasAddNotice = true;
          }
          textEl.appendChild(lastP);
          infoWindow.setHeight(textEl.offsetHeight + 5);
        }
      })
      .finally(() => {
        textEl.removeChild(loading);
      });
  });

  return infoWindow;
}

/** 创建港口站点信息窗 */
function createPortInfoWindow(
  data: Dashboard.PortItem,
  p: BMapGL.Point,
  routeAction: Router,
  filterState: FilterState,
  nearState: NearState,
  mapRoute: MapRoute,
  loadNearStation: (
    point: BMapGL.Point,
    provinceName?: string,
    stationId?: string,
    stationName?: string
  ) => void,
  loadNearPort: (
    point: BMapGL.Point,
    provinceName?: string,
    portId?: string,
    portName?: string
  ) => void
) {
  const title = `<b>${data.station.portAreaName}(${data.station.portName})</b>`;
  const opts = {
    title: title, // 信息窗口标题
    message: data.station.id
  };
  const textEl = document.createElement("div");
  textEl.style.padding = "5px";
  textEl.setAttribute("class", "station-map-content");
  const lastP = document.createElement("p");
  lastP.classList.add("tr", "dashboard-info-window-last-p");

  const near = document.createElement("a");
  near.href = "javascript:void(0);";
  near.innerText = "附近站港";
  near.style.marginRight = ".4rem";
  near.addEventListener("click", () => {
    nearState.show = true;
    nearState.showNearList = true;
    nearState.nearListType = "waterway";
    loadNearPort(
      p,
      data.station.provinceName,
      data.station._id,
      data.station.portAreaName
    );
    loadNearStation(p, data.station.provinceName);
  });
  lastP.appendChild(near);

  const routeEl = document.createElement("a");
  routeEl.href = "javascript:void(0);";
  routeEl.innerText = "到这里";
  routeEl.style.marginRight = "5px";
  lastP.appendChild(routeEl);

  routeEl.addEventListener("click", () => {
    mapRoute.renderRouteForm(data.station.portAreaName, p, infoWindow);
  });

  const more = document.createElement("a");
  more.href = "javascript:void(0);";
  more.innerText = "详情";

  more.addEventListener("click", () => {
    routeAction.push({
      path: "/resource-app/waterway-port-dt",
      query: { id: data.station.id }
    });
  });
  lastP.appendChild(more);

  const sendThere = document.createElement("p");
  render(h(DcIcon, { name: "start", width: 1.2, height: 1.2 }), sendThere);
  sendThere.innerHTML +=
    "<span class='dashboard-send-there-label'>从这发货</span>";
  sendThere.classList.add("dashboard-send-there-wrap");
  const arriveThere = document.createElement("p");
  render(h(DcIcon, { name: "arrive", width: 1.2, height: 1.2 }), arriveThere);
  arriveThere.innerHTML +=
    "<span class='dashboard-arrive-there-label'>到货这里</span>";
  lastP.appendChild(sendThere);
  lastP.appendChild(arriveThere);

  function toQuerySolution(type: "start" | "arrive") {
    const [province = "", city = "", district = ""] = (
      data.station?.portAddress || ""
    ).split(",");
    sessionStorage.setItem(
      "tgsSolutionQueryParams",
      JSON.stringify({
        value: data.station.portName,
        type: 3,
        lat: p.lat,
        lng: p.lng,
        goodsName: filterState.goodsName,
        goodsCode: filterState.goodsCode,
        adt: {
          province: data.station.provinceName || province,
          city: data.station.cityName || city,
          district: district,
          town: ""
        },
        isStart: type === "start"
      })
    );
    routeAction.push({
      path: "/resource-app/tgs-solution-query"
    });
  }

  sendThere.addEventListener("click", () => toQuerySolution("start"));
  arriveThere.addEventListener("click", () => toQuerySolution("arrive"));

  textEl.appendChild(lastP);
  const infoWindow = new BMapGL.InfoWindow(textEl, opts);
  infoWindow.addEventListener("open", function () {
    infoWindow.setWidth(document.body.offsetWidth - 40);
    textEl.innerHTML = "";
    const content = createPortEl(data.station, data.contact);
    textEl.appendChild(content);
    textEl.appendChild(lastP);
  });

  return infoWindow;
}

// #region  创建站点信息，地图窗口内容
function createStationEl(station: Dashboard.RailwayStationDto) {
  const div = document.createElement("div");
  const tags = document.createElement("div");
  station.tags?.forEach((x) => {
    const tag = document.createElement("span");
    tag.setAttribute("class", `station-tag ${tagColorMap.get(x)||'danger'}`);
    tag.innerText = x;
    tags.appendChild(tag);
  });
  div.appendChild(tags);
  let propertieStr = "";
  renderStationProperties(station).forEach((x) => {
    propertieStr += `<span class='propertie-item ${x.class || ""}'>${x.value
      }</span>`;
  });
  div.appendChild(createContentEl("车站属性", propertieStr));
  div.appendChild(
    createContentEl(
      "货场整车办理限制",
      station.businessLimit,
      renderBusinessLimt(station.businessLimit)
    )
  );
  div.appendChild(
    createContentEl("办理范围", station.scopeOfBusiness, "theme-success")
  );
  div.appendChild(createContentEl("所在城市", station.cityName));

  div.appendChild(
    createContentEl(
      "路局/车务段",
      `${station.railwayBureauName || ""}局 / ${station.railwayTrainName || ""}`
    )
  );
  const phone = station.principalPhone
    ? document.createElement("span")
    : undefined;
  if (phone) {
    phone.innerText = window.getPrivatePhone(station.principalPhone);
    phone.setAttribute("class", "theme-color");
    phone.addEventListener("touchend", () => {
      window.location.href = `tel:${station.principalPhone}`;
    });
  }

  div.appendChild(
    createContentEl(
      "区域/负责人",
      `${station.areaCompanyName || ""} / ${station.principalName || ""}`,
      "",
      phone
    )
  );

  return div;
}

function createLoadingEl(text = "加载中...") {
  const div = document.createElement("div");
  div.setAttribute("class", "define-loading");
  const icon = document.createElement("span");
  icon.setAttribute("class", "van-loading");
  const content = document.createElement("p");
  content.innerText = text;
  div.appendChild(icon);
  div.appendChild(content);
  return div;
}

function createStationNoticeEl(
  station: Dashboard.RailwayStationDto,
  routerAction: Router
) {
  const notice = document.createElement("a");
  notice.href = "javascript:void(0);";
  notice.innerText = `通知(${station.cmsNoReadNum}/${station.cmsNum})`;
  notice.style.marginRight = "5px";
  notice.addEventListener("touchend", () => {
    routerAction.push({
      path: "/resource-cms",
      query: { businessId: station.id }
    });
  });
  return notice;
}

function createContentEl(
  label: string,
  val: any,
  css?: string,
  el?: HTMLElement
) {
  const div = document.createElement("div");
  div.setAttribute("class", "item");
  const labelEl = document.createElement("span");
  labelEl.setAttribute("class", "label");
  labelEl.innerText = `${label}：`;
  const valEl = document.createElement("span");
  valEl.innerHTML = val || "";
  if (css) {
    valEl.setAttribute("class", css);
  }
  if (el) {
    valEl.appendChild(el);
  }
  div.appendChild(labelEl);
  div.appendChild(valEl);
  return div;
}

function renderBusinessLimt(limit: string) {
  return limit?.indexOf("不办理") !== -1
    ? "red"
    : limit?.indexOf("仅办理") !== -1
      ? "theme-warning"
      : limit?.indexOf("无限制") !== -1
        ? "theme-success"
        : "";
}

function renderStationProperties(item: Dashboard.RailwayStationDto) {
  const result = [
    {
      value: `${item.stationaryUserNames?.length ? "√有驻站人员" : "×无驻站人员"
        }`,
      class: item.stationaryUserNames?.length ? "success" : "danger"
    },
    {
      value: `${item.hasPricePolicy ? "√有优价" : "×无优价"}`,
      class: item.hasPricePolicy ? "success" : "danger"
    },
    {
      value: `${item.hasPrivateLine ? "√有专用线" : "×无专用线"}`,
      class: item.hasPrivateLine ? "success" : "danger"
    },
    {
      value: `${item.isCrhExpress + "" === "true" ? "√" : "×"}高铁快运`,
      class: item.isCrhExpress + "" === "true" ? "success" : "danger"
    },
    {
      value: `${item.isHbExpress + "" === "true" ? "√" : "×"}行包快运`,
      class: item.isHbExpress + "" === "true" ? "success" : "danger"
    }
  ] as { value: string; class: string }[];
  result.sort((a) => {
    return a.class === "success" ? -1 : 1;
  });
  return result;
}

/** 创建专用线标记 */
function createPrivateLineMark(
  center: BMapGL.Point,
  markerIconState: Record<string, BMapGL.Icon | null>,
  zyxList?: Dashboard.StationItem["zyxList"]
) {
  const lineCount =
    zyxList?.filter((x) => {
      const address = GetAddress(x.address || "");
      return !address?.lat || !address?.lng;
    })?.length || 0;
  const deg = -(lineCount > 0 ? 360 / lineCount : 15);
  return (
    zyxList?.map((x, index) => {
      const address = GetAddress(x.address || "");
      const point =
        address?.lat && address.lng
          ? new BMapGL.Point(parseFloat(address.lng), parseFloat(address.lat))
          : getCirclePoint(center, deg * index, 70000);
      const namePath = getNameLength(x.name);
      const label = new BMapGL.Label(x.name, {
        position: point,
        offset: new BMapGL.Size(-(namePath * 12), -30)
      });

      const hasContainer = x.containerArriveHS || x.containerSendHS;
      const marker = new BMapGL.Marker(point, {
        icon: hasContainer
          ? markerIconState.containerBmpIcon!
          : markerIconState.privateLineBmpIcon!
      });
      const line = new BMapGL.Polyline([center, point], {
        strokeStyle: "dashed",
        strokeColor: "#ed6a0c"
      });
      const infoWindow = createPrivateLineInfoWindow(x);
      return {
        point,
        label,
        marker,
        station: x.stationId,
        line,
        infoWindow
      };
    }) || []
  );
}

/** 创建专用线信息窗 */
function createPrivateLineInfoWindow(
  data: Dashboard.StationItem["zyxList"][number]
) {
  const title = `专用线信息`;
  const opts = {
    width: 250, // 信息窗口宽度
    title: title, // 信息窗口标题
    message: data.id
  };
  let text = `<h4 class='fw-b'>${data.name}(${data.num})</h4>`;
  text += `<p><span class=\'map-window-label\'>联系方式：</span>${data.contacts || ""
    }${data.phone || ""}</p>`;
  text += `<p><span class=\'map-window-label\'>取送车里程：</span>${data.transferMileage}米</p>`;

  text += `<p>
  ${data.sendCategory
      ? "<div  class='w-clamp clamp-3'><span class='map-window-label'>普货发送：</span>" +
      data.sendCategory +
      "</div>"
      : ""
    }
  ${data.arriveCategory
      ? "<div class='w-clamp clamp-3'><span class='map-window-label'>普货到达：</span>" +
      data.arriveCategory +
      " </div> "
      : ""
    }
      ${data.containerSendHS
      ? "<span class='map-window-label'>集装箱发送：</span>" +
      renderContainerValue(data.containerSendHS) +
      "<br>"
      : ""
    }
      ${data.containerArriveHS
      ? "<span class='map-window-label'>集装箱到达：</span>" +
      renderContainerValue(data.containerArriveHS) +
      "<br>"
      : ""
    }
  </p>`;
  text += `<p>地址：${GetAddress(data.address || "")?.address || ""}</p>`;

  const textEl = document.createElement("div");
  textEl.style.padding = "5px";
  textEl.style.overflowY = "auto";
  textEl.innerHTML = text;
  const lastP = document.createElement("p");
  lastP.classList.add("tr");

  textEl.appendChild(lastP);

  const infoWindow = new BMapGL.InfoWindow(textEl, opts);
  infoWindow.addEventListener("open", () => {
    infoWindow.setWidth(document.body.offsetWidth - 40);
  });
  return infoWindow;
}
function getCirclePoint(point: BMapGL.Point, deg: number, circleR: number) {
  const cirx = point.lat;
  const ciry = point.lng;
  const r = circleR / 6378137;
  const diffy =
    (Math.round(Math.sin((deg * Math.PI) / 180) * 100000000000) /
      100000000000) *
    r;
  const diffx =
    (Math.round(Math.cos((deg * Math.PI) / 180) * 100000000000) /
      100000000000) *
    r;

  if (deg <= 90) {
    return new BMapGL.Point(ciry + diffy, cirx - diffx);
  }
  if (deg > 90 && deg <= 180) {
    return new BMapGL.Point(ciry + diffy, cirx + diffx);
  }
  if (deg > 180 && deg <= 270) {
    return new BMapGL.Point(ciry - diffy, cirx + diffx);
  }
  if (deg > 270 && deg <= 360) {
    return new BMapGL.Point(ciry - diffy, cirx - diffx);
  }
  return new BMapGL.Point(ciry + diffy, cirx + diffx);
}

function renderContainerValue(val: string) {
  if (val) {
    const colAry = val.split(",") || [];
    return colAry
      .map((x) => {
        return ContainerType.find((y) => y.field === x)?.label || "";
      })
      .filter((x) => x)
      .join(",");
  }
  return "";
}
// #endregion

function createPortEl(
  station: Dashboard.PortItem["station"],
  contact: Dashboard.PortItem["contact"]
) {
  const div = document.createElement("div");
  const tags = document.createElement("div");
  const tag = document.createElement("span");
  tag.setAttribute(
    "class",
    `station-tag ${tagColorPortMap.get(station.portType)}`
  );
  tag.innerText = station.portType;
  tags.appendChild(tag);
  div.appendChild(tags);
  const phone = station.areaUserTel
    ? document.createElement("span")
    : undefined;
  if (phone) {
    phone.innerText = window.getPrivatePhone(station.areaUserTel);
    phone.setAttribute("class", "theme-color");
    phone.addEventListener("touchend", () => {
      window.location.href = `tel:${station.areaUserTel}`;
    });
  }
  div.appendChild(
    createContentEl("备注", station.portSpecification, "theme-success")
  );
  div.appendChild(
    createContentEl(
      "区域/负责人",
      `${station.areaName || ""} / ${station.areaUserName || ""}`,
      "",
      phone
    )
  );
  if (contact.length > 0) {
    const phones =
      contact !== null && contact !== undefined
        ? document.createElement("span")
        : undefined;
    let users = "";
    if (phones) {
      phones.innerText = window.getPrivatePhone(contact[0].contactTel);
      phones.setAttribute("class", "theme-color");
      phones.addEventListener("touchend", () => {
        window.location.href = `tel:${contact[0].contactTel}`;
      });
      users = contact[0].contact;

      div.appendChild(
        createContentEl("港口联系人", `${users || ""}`, "", phones)
      );
    }
  } else {
    div.appendChild(createContentEl("港口联系人", ""));
  }
  return div;
}

/** 动态加载js */
function loadJs(url: string, ak: string, callback?: Function) {
  const src = document.getElementById("DcBmapScript");
  if (checkJsIsLoad(url) || src) {
    if (callback) callback();
    return;
  }

  const script = document.createElement("script");
  script.onload = () => {
    if (callback) callback();
  };
  script.src = `${url}&ak=${ak}`;
  script.id = "DcBmapScript";
  document.head.appendChild(script);
}

// 获取地图AK
const getAK = (): Promise<string> => {
  return new Promise((resolve) => {
    getBMapAK()
      .then((res) => {
        resolve(res);
      })
      .catch(() => {
        resolve("QfsfdSaTbBV1RneMR2h0awHUoAQv0vbI");
      });
  });
};

/**
 * 检查是否已经加载
 */
function checkJsIsLoad(url: string) {
  const urls = document.querySelectorAll("script");
  let hasLoad = false;
  if (urls) {
    for (let i = 0; i < urls.length; i++) {
      const r = urls[i];
      if (r.src === url) {
        hasLoad = true;
        break;
      }
    }
  }
  return hasLoad;
}
