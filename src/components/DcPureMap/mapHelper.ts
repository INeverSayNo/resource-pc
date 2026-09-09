import L, { GeoJSONOptions } from "leaflet";
import { ComputedRef, Ref, unref } from "vue";
import geojsonvt from "geojson-vt";
import { bd09towgs84 } from "./utils";

interface Address {
  address: string;
  lat: string;
  lng: string;
}

export const PointStyle: Record<string, string> = {
  padding: ".4rem .6rem",
  border: "none",
  borderRadius: "6px",
  backdropFilter: "blur(8px)",
  backgroundColor: "#87ceeb45",
  color: "#00b4fe",
  fontSize: "12px",
  width: "max-content",
  marginLeft: "20px",
  marginTop: "-8px"
};

export const stationServices = [
  {
    key: "isContainerHandle",
    name: "集"
  },
  {
    key: "isDangerousHandle",
    name: "危"
  }
];

// 路局基色
export const railwayBureauArea = new Map<
  string,
  Record<"bureauColor" | "lineColor", string>
>([
  ["西安局", { bureauColor: "rgba(0, 169, 115, 0.5)", lineColor: "red" }],
  ["哈尔滨局", { bureauColor: "rgba(115, 9, 170, 0.5)", lineColor: "#efb336" }],
  ["兰州局", { bureauColor: "rgba(149, 164, 120, 0.5)", lineColor: "#3c53ff" }],
  ["郑州局", { bureauColor: "rgba(116, 192, 162, 0.5)", lineColor: "#07c160" }],
  ["昆明局", { bureauColor: "rgba(110, 123, 176, 0.5)", lineColor: "red" }],
  ["北京局", { bureauColor: "rgba(134, 110, 176, 0.5)", lineColor: "red" }],
  ["沈阳局", { bureauColor: "rgba(251, 155, 36, 0.5)", lineColor: "#07c160" }],
  ["太原局", { bureauColor: "rgba(99, 44, 153, 0.5)", lineColor: "#3c53ff" }],
  ["南宁局", { bureauColor: "rgba(120, 167, 196, 0.5)", lineColor: "#3c53ff" }],
  ["成都局", { bureauColor: "rgba(56, 56, 74, 0.5)", lineColor: "#07c160" }],
  [
    "乌鲁木齐局",
    { bureauColor: "rgba(255, 184, 153, 0.5)", lineColor: "#07c160" }
  ],
  [
    "呼和浩特局",
    { bureauColor: "rgba(245, 61, 101, 0.5)", lineColor: "#efb336" }
  ],
  ["青藏公司", { bureauColor: "rgba(154, 24, 68, 0.5)", lineColor: "red" }],
  ["济南局", { bureauColor: "rgba(250, 161, 57, 0.5)", lineColor: "#efb336" }],
  ["上海局", { bureauColor: "rgba(25, 176, 118, 0.5)", lineColor: "red" }],
  ["武汉局", { bureauColor: "rgba(64, 219, 217, 0.5)", lineColor: "#3c53ff" }],
  [
    "广铁（集团）公司",
    { bureauColor: "rgba(18, 64, 171, 0.5)", lineColor: "#efb336" }
  ],
  ["南昌局", { bureauColor: "rgba(255, 90, 64, 0.5)", lineColor: "#07c160" }]
]);

export const provinceArea = [
  {
    key: "川",
    value: "#fdd6a1bd"
  },
  {
    key: "湘",
    value: "#fdd6a1bd"
  },
  {
    key: "闽",
    value: "#fdd6a1bd"
  },
  {
    key: "豫",
    value: "#fdd6a1bd"
  },
  {
    key: "宁",
    value: "#fdd6a1bd"
  },
  {
    key: "新",
    value: "#fdd6a1bd"
  },
  {
    key: "沪",
    value: "#fdd6a1bd"
  },
  {
    key: "青",
    value: "#abc6ffbd"
  },
  {
    key: "渝",
    value: "#abc6ffbd"
  },
  {
    key: "辽",
    value: "#abc6ffbd"
  },
  {
    key: "藏",
    value: "#a1bfffbd"
  },
  {
    key: "桂",
    value: "#a1bfffbd"
  },
  {
    key: "陕",
    value: "#a1bfffbd"
  },
  {
    key: "赣",
    value: "#a1bfffbd"
  },
  {
    key: "冀",
    value: "#a1bfffbd"
  },
  {
    key: "吉",
    value: "#a1bfffbd"
  },
  {
    key: "苏",
    value: "#a1bfffbd"
  },
  {
    key: "甘",
    value: "#a0ffd2bd"
  },
  {
    key: "黑",
    value: "#a0ffd2bd"
  },
  {
    key: "晋",
    value: "#a0ffd2bd"
  },
  {
    key: "津",
    value: "#a0ffd2bd"
  },
  {
    key: "皖",
    value: "#a0ffd2bd"
  },
  {
    key: "黔",
    value: "#a0ffd2bd"
  },
  {
    key: "台湾省",
    value: "#a0ffd2bd"
  },
  {
    key: "云",
    value: "#f2ff9dbd"
  },
  {
    key: "粤",
    value: "#f2ff9dbd"
  },
  {
    key: "浙",
    value: "#f2ff9dbd"
  },
  {
    key: "鄂",
    value: "#f2ff9dbd"
  },
  {
    key: "鲁",
    value: "#f2ff9dbd"
  },
  {
    key: "京",
    value: "#f2ff9dbd"
  },
  {
    key: "内蒙古",
    value: "#f2ff9dbd"
  },
  {
    key: "琼",
    value: "#f2ff9dbd"
  }
];

// 创建地图标记和标签
export default function mapHelper(MapInstance: ComputedRef<L.Map | undefined>) {
  function setCenterMarkLabel(
    point: L.LatLng,
    name: string,
    iconPath: string,
    zoomLevel = 17,
    needCenter = true
  ) {
    needCenter && MapInstance.value?.setView(point, zoomLevel);
    const marker = L.marker(point, {
      icon: L.icon({
        iconUrl: iconPath,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(MapInstance.value!);
    const labelEl = document.createElement("p");
    Object.assign(labelEl.style, PointStyle);
    labelEl.innerHTML = name;

    const labelMarker = createLabelMarker(
      point.lat,
      point.lng,
      labelEl,
      "z-1005"
    ).addTo(MapInstance.value!);
    return {
      marker,
      labelMarker
    };
  }

  function createDOM(payload: string[], lat: number, lng: number) {
    const div = document.createElement("div");
    div.style.position = "relative";
    div.style.minWidth = "2rem";
    div.style.backgroundColor = "#fff";
    div.style.color = "#333";
    div.style.padding = "2px";
    div.style.whiteSpace = "nowrap";
    div.style.userSelect = "none";
    div.style.fontSize = "12px";
    div.style.borderRadius = "10px";
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.flexDirection = "column";
    div.style.padding = ".2rem";
    div.style.borderRadius = "4em";
    div.style.boxShadow =
      "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px";

    const tagWrap = document.createElement("div");
    payload.forEach((e) => {
      const el = document.createElement("span");
      el.innerHTML = e;
      el.style.background = "#e55e34";
      el.style.color = "#fff";
      el.style.borderRadius = "50%";
      el.style.width = "1.6rem";
      el.style.height = "1.6rem";
      el.style.display = "inline-flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.boxSizing = "border-box";
      tagWrap.appendChild(el);
    });
    tagWrap.style.display = "flex";
    tagWrap.style.gap = ".4rem";
    div.appendChild(tagWrap);
    var arrow = document.createElement("div");
    arrow.style.position = "absolute";
    arrow.style.bottom = "-1.2rem";
    arrow.style.left = "50%";
    arrow.style.transform = "translateX(-50%)";
    arrow.style.width = "0";
    arrow.style.height = "0";
    arrow.style.borderColor = "white transparent transparent transparent";
    arrow.style.borderStyle = "solid";
    arrow.style.borderWidth = "10px";
    arrow.style.overflow = "hidden";
    div.appendChild(arrow);
    const size = payload.length * 50;
    const Icon = L.divIcon({
      className: "",
      html: div,
      iconSize: [size, size],
      iconAnchor: [size / 2, 50]
    });

    const marker = L.marker([lat, lng], {
      icon: Icon
    });

    return marker;
  }
  return {
    setCenterMarkLabel,
    createDOM
  };
}

export function createLabelMarker(
  lat: number,
  lng: number,
  label: string | HTMLElement,
  className?: string
) {
  return L.marker([lat, lng], {
    icon: new L.DivIcon({
      className: className || "",
      html: label
    })
  });
}

export function removeAllMapLayer(MapInstance: Ref<L.Map | undefined>) {
  unref(MapInstance)?.eachLayer((layer) => {
    if (
      Reflect.has(layer, "_url") ||
      layer["options"]?.pane?.startsWith("maplibre")
    ) {
      return;
    }
    unref(MapInstance)?.removeLayer(layer);
  });
}

// 绘制IconMarker
export function createDcIconMarker(
  lat: number,
  lng: number,
  iconPath: string,
  iconSize?: [number, number]
) {
  const locationIcon = L.icon({
    iconUrl: iconPath,
    iconSize: iconSize ? iconSize : [20, 20],
    iconAnchor: iconSize ? [iconSize[0] / 2, iconSize[1] / 2] : [10, 10]
  });

  return L.marker([lat, lng], {
    icon: locationIcon
  });
}

export const getTMapAddrssWithPoint = (lng: number, lat: number) => {
  const [_lng, _lat] = bd09towgs84(lng, lat);
  const p = new T.LngLat(_lng, _lat);
  const geo = new T.Geocoder();
  return new Promise<T.GeoCoderResult>((resolve, _reject) => {
    geo.getLocation(p, (res) => {
      resolve(res);
    });
  });
};

export const searchByTMap = (
  keywords: string,
  mapInstance: T.Map
): Promise<T.LocalSearchPoi[]> => {
  return new Promise((resolve) => {
    const local = new T.LocalSearch(mapInstance, {
      pageCapacity: 10,
      onSearchComplete: (res) => {
        if (Array.isArray(res.pois) && res.pois.length) {
          // 普通搜索
          resolve(
            res.pois
              .filter((e) => e.lonlat && e.name && e.address)
              .reduce((prev, next) => {
                if (prev?.every((e) => e.name !== next.name)) {
                  prev.push(next);
                }
                return prev;
              }, [] as T.LocalSearchPoi[])
          );
        } else if (res.resultType === 3) {
          // 行政区省
          const area = res.getArea();
          resolve([
            {
              name: area.name,
              address: area.name,
              lonlat: area.lonlat,
              phone: "",
              poiType: ""
            }
          ]);
        } else {
          resolve([]);
        }
      }
    });
    local.search(keywords, 1);
  });
};

export const createPulseStyle = () => {
  if (document.getElementById("leaflet-pulse-style")) return;

  const style = document.createElement("style");
  style.id = "leaflet-pulse-style";
  style.type = "text/css";
  style.innerHTML = `
    /* SVG 脉冲动画 */
    .pulse-circle {
      animation: svgPulse 1.5s infinite;
      transform-origin: center center;
      transform-box: fill-box; /* 确保在SVG上正常工作 */
    }

    /* 适合SVG路径的关键帧动画 */
    @keyframes svgPulse {
      0% {
        opacity: 0.8;
        transform: scale(0.5);
        fill-opacity: 0.8;
      }

      100% {
        opacity: 0;
        transform: scale(2.5);
        fill-opacity: 0;
      }
    }

    /* 手动添加光晕效果 */
    .pulse-circle-glow {
      filter: drop-shadow(0 0 5px #3461dd) drop-shadow(0 0 10px #3461dd);
    }
.leaflet-interactive {
  z-index: 1;
}

  `;
  document.getElementsByTagName("head")[0].appendChild(style);
};

export const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

export const isIOS = () => {
  const u = navigator.userAgent;
  const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  return isiOS;
};
