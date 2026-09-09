import { onMounted, ref } from "vue";
import { bd09towgs84 } from '@/utils/locationConvert';
import { TMapController } from '@/utils/useLoadTMap';

export default function useMap() {
  const TMapInstance = ref<T.Map>();
  const initTMap = () => {
    TMapInstance.value = new T.Map(window.TMapContainerId, {
      center: new T.LngLat(104.07534515783159, 30.583925544189523),
      zoom: 5
    });
  };

  const searchByTMap = (keywords: string): Promise<T.LocalSearchPoi[]> => {
    return new Promise((resolve) => {
      const local = new T.LocalSearch(TMapInstance.value!, {
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

  const getTMapAddrssWithPoint = (lng:number, lat: number) => {
    const [_lng, _lat] = bd09towgs84(lng, lat)
    const p = new T.LngLat(_lng, _lat)
    const geo = new T.Geocoder()
    return new Promise<T.GeoCoderResult>((resolve, _reject) => {
      geo.getLocation(
        p,
        (res) => {
          resolve(res)
        }
      )
    })
  }

  onMounted(() => TMapController.whenLoad(initTMap))
  return {
    searchByTMap,
    getTMapAddrssWithPoint
  }
}
