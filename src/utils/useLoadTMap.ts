export class TMapController {
  static isLoad = false;
  static eventList = new Set<Function>();
  static async insertTMapEle() {
    (window as any).resourceTMapInit = () => {
      console.log("test");

      this.isLoad = true;
      this.executeCallbacks();
    };
    const src = document.getElementById("DcResourceTMapScript");
    if (src) {
      return;
    }
    const script = document.createElement("script");
    script.id = "DcResourceTMapScript";
    script.type = "text/javascript";
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=4bc562de1e6092cbc6755797acc32bd0`;
    script.onload = async () => {
      this.createTMapEl();
      this.isLoad = true;
      this.executeCallbacks();
      const point = await this.getGeoLocation();
      const res = await this.getDetailLocation(point!);
    };
    document.head.appendChild(script);
  }
  private static createTMapEl() {
    const el = document.createElement("div");
    el.id = "DcResourceTMap";
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.left = "0";
    el.style.zIndex = "-1";
    el.style.pointerEvents = "none";
    el.style.opacity = "0";
    document.body.appendChild(el);
    window["TMapContainerId"] = el.id;
  }
  static whenLoad(fn = () => {}) {
    this.isLoad ? fn() : this.eventList.add(fn);
  }

  static async getGeoLocation(): Promise<T.LngLat> {
    return new Promise((resolve, reject) => {
      if (isIOS()) {
        navigator.geolocation.getCurrentPosition(
          (data) => {
            resolve(new T.LngLat(data.coords.longitude, data.coords.latitude));
          },
          undefined,
          { enableHighAccuracy: true }
        );
      } else {
        const lo = new T.Geolocation();
        lo.getCurrentPosition(function (e) {
          if (e.lnglat) {
            resolve(e.lnglat);
          }
        });
      }
    });
  }

  static async getDetailLocation(lnglat: T.LngLat): Promise<T.GeoCoderResult> {
    return new Promise((resolve, reject) => {
      const geo = new T.Geocoder();
      geo.getLocation(lnglat, function (e) {
        resolve(e);
      });
    });
  }

  static executeCallbacks() {
    this.eventList.forEach((fn) => fn());
    this.eventList.clear();
  }
}

function isIOS() {
  const u = navigator.userAgent;
  const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  return isiOS;
}
