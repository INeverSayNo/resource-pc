import { h, nextTick, Ref, unref } from "vue";
import { ElMessageBox } from "element-plus";
import { Message } from "@/components/Message"; 

export function mapRoute(state: Dashboard.NavigationState, mapInstance: Ref<BMapGL.Map | undefined>) {
  function renderRouteForm(name: string, point: BMapGL.Point, infowWindow:BMapGL.InfoWindow) {
    ElMessageBox({
      title: "请输入起点",
      message: h(
        "div",
        {
          class: "def-messagebox"
        },
        [
          h("div", [
            h("span", "起点地址："),
            h("input", {
              placeholder: "请输入起点地址",
              value: state.routeAddress,
              autocomplete: "on",
              onChange: (e: Event) => {
                state.routeAddress = (e.target as HTMLInputElement).value;
              },
              onInput: (e: Event) => {
                addressSerach(e);
              },
              onClick: (e: Event) => {
                (e.target as HTMLInputElement).select();
                addressSerach(e);
              }
            })
          ]),
          h("div", `终点(车站)：${name}站`),
          h("div", { class: "dashboard-search-panel", style: "display: none;" })         
        ]
      )
    }).then(() => {
      if (state.routeAddress) {
        const geoc = new BMapGL.Geocoder();
        if (
          state.routeAddress === state.startPoint?.name &&
          state.startPoint.point
        ) {
          state.endPoint = {
            name: name,
            point
          };
          drawRoute(state.startPoint.point, point, infowWindow);
        } else {
          geoc.getPoint(
            state.routeAddress,
            (p: BMapGL.Point) => {
              state.endPoint = {
                name: name,
                point
              };
              state.startPoint = {
                name: state.routeAddress!,
                point: p
              };
              drawRoute(p, point, infowWindow);
            },
            ""
          );
        }
      } else {
        Message.warning("起点或终点坐标解析失败，请重试");
      }
    }).catch((e) => { 
      console.log(e);
    });
  }

  function addressSerach(e) {
    const p = (e.target as HTMLInputElement).getBoundingClientRect();
    const el = document.getElementsByClassName("dashboard-search-panel");
    if (el.length) { 
      state.mapAutoCompleteInput?.search(e.target.value);
      mapSearch2(e.target.value, (res) => {
        el[0].innerHTML = "";
        if (res.length) {
          el[0].setAttribute(
            "style",
            `top:${p.top + p.height}px;left:${p.left}px;display:block;`
          );
        } else {
          el[0].setAttribute("style", `display:none;`);
        }
        res.forEach((x) => {
          const p = document.createElement("p");
          p.innerHTML = x.value;
          p.addEventListener("click", () => {
            e.target.value = x.value;
            state.routeAddress = x.value;
            el[0].setAttribute("style", `display:none;`);
          });
          el[0].appendChild(p);
        });
      }) 
    }
  }

  function drawRoute(start: BMapGL.Point, end: BMapGL.Point, infowWindow:BMapGL.InfoWindow | null) {
    clearMapRoute();
    const startp = new BMapGL.Point(unref(start).lng, unref(start).lat);
    const arrivep = new BMapGL.Point(unref(end).lng, unref(end).lat);
    const transit = new BMapGL.DrivingRoute(mapInstance.value!, {
      renderOptions: { map: mapInstance.value! },
      onSearchComplete: (results) => {
        if (transit.getStatus() !== BMAP_STATUS_SUCCESS) {
          return;
        }
        let output = `${state.startPoint?.name} 到 ${state.endPoint?.name}`;
        const plan = results.getPlan(0);
        output += " 总路程为：";
        output += plan.getDistance(true);
        output += " 约需要：";
        output += plan.getDuration(true); // 获取时间
        state.mapRouteDescription = output;
      },
      onPolylinesSet: (routes) => {
        state.mapRouteOverlays.polyLine = routes[0].getPolyline();
        state.existingRouteInfo.polyLine = routes[0].getPolyline();
      },
      onMarkersSet: (points: any) => {
        state.mapRouteOverlays.start = points.find(
          (x) => x.title === "起点"
        )?.marker;
  
        state.mapRouteOverlays.end = points.find(
          (x) => x.title === "终点"
        )?.marker;
        state.existingRouteInfo.marker = {
          start: points.find((x) => x.title === "起点")?.marker,
          end: points.find((x) => x.title === "终点")?.marker
        };

        if (state.mapRouteOverlays.end) {
          state.mapRouteOverlays.end.addEventListener("click", () => {
            if (infowWindow) {
              mapInstance.value?.openInfoWindow(infowWindow, end);
            }
          })
        }
      }
    });
    
    transit.search(startp, arrivep);
  }
  function clearMapRoute() {
    if (state.mapRouteOverlays.polyLine) {
      mapInstance.value?.removeOverlay(state.mapRouteOverlays?.polyLine);
      state.mapRouteOverlays.polyLine = null;
    }
    if (state.mapRouteOverlays.start) {
      mapInstance.value?.removeOverlay(state.mapRouteOverlays?.start);
      state.mapRouteOverlays.start = null;
    }
    if (state.mapRouteOverlays.end) {
      mapInstance.value?.removeOverlay(state.mapRouteOverlays?.end);
      state.mapRouteOverlays.end = null;
    }
  }
  function mapSearch(keywords: string, cb: (arg: any) => void) {
    const map = mapInstance.value;
    if (map) {
      const local = new BMapGL.LocalSearch(map, {
        onSearchComplete: (results) => {
          if (local.getStatus() === BMAP_STATUS_SUCCESS) {
            const result: any[] = [];
            const r = results;
            for (let i = 0, j = r.getNumPois(); i < j; i++) {
              const p = r.getPoi(i);
              if (p) {
                result.push({
                  value: p.address,
                  point: p.point
                });
              }
            }
            cb(result);
            return;
          }
          cb([]);
        }
      });
      local.search(keywords);
    }
  }
  function mapSearch2(keywords:string, cb:(args:any)=>void) {
    state.mapAutoLoading = true;
    state.mapAutoCompleteInput?.search(keywords); 
    const interval = setInterval(() => {
      if (!state.mapAutoLoading) { 
        cb(state.mapAutoCompleteResult);
        clearInterval(interval)
      }
    }, 1)
  }
  return {
    clearMapRoute,
    renderRouteForm,
    mapSearch,
    mapSearch2,
    drawRoute
  };
}
