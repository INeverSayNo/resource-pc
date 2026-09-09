<script lang="ts">
import {
  computed,
  defineComponent,
  onActivated,
  onMounted,
  PropType,
  reactive,
  ref,
  watch
} from "vue";
import {
  clearSearchRecords,
  getSearchRecords,
  getStationPorts,
  createSearchRecord
} from '@/api/railway/address'
import DcIcon from "@/components/icon/index.vue";
import { IAddressState, SearchRecordResponse } from "./type";
import { ElMessageBox } from "element-plus";
import { guid, useClickAway } from "@/utils";
import { SearchRecordTypeEnum, TransportTypeEnum } from "./enum";
import useMap from "./useMap";
import { useRouter } from "vue-router";
import {
  SearchNearPort,
  SearchNearStation
} from "@/views/railway/stationMap/api";
import { wgs84tobd09 } from "@/utils/locationConvert";

type UnionRecommendState =
  | SearchRecordResponse["hotStation"]
  | Dashboard.RailwayStationDto
  | SearchRecordResponse["hotPort"]
  | Dashboard.WaterPortStationDto
  | null;

export default defineComponent({
  name: "HistorySelect",
  components: {
    DcIcon
  },
  props: {
    address: {
      type: String,
      default: ""
    },
    width: {
      type: Number as PropType<number>,
      default: 300
    },
    stationType: {
      type: String,
      default: "all"
    },
    currentLocation: {
      type: Object as PropType<
        Record<"lat" | "lng", string | number> & { province: string }
      >,
      default: () => null
    },
    mapContainerId: {
      type: String,
      default: () => guid()
    },
    showMask: {
      type: Boolean,
      default: false
    }
  },
  emits: ["update:address", "choose", "success", "update:showMask"],
  setup(props, { emit, attrs }) {
    const routerAction = useRouter();

    const modelAddress = computed({
      get: () => props.address,
      set: (v) => emit("update:address", v)
    });

    const showHistoryCard = computed({
      get: () => props.showMask,
      set: (v) => emit("update:showMask", v)
    });

    const { searchByTMap, getTMapAddrssWithPoint } = useMap();

    // #region 推荐站点/港口 & 历史记录
    const searchRecordList = ref<SearchRecordResponse["recordList"]>([]);
    const searchHistoryLoading = ref(false);
    const recommendState = reactive({
      hotStation: null as SearchRecordResponse["hotStation"] | null,
      minDistanceStation: null as Dashboard.RailwayStationDto | null,
      hotPort: null as SearchRecordResponse["hotPort"] | null,
      minDistancePort: null as Dashboard.WaterPortStationDto | null
    });
    async function getSearchRecord() {
      searchHistoryLoading.value = true;
      const [error, response] = await getSearchRecords()
      searchHistoryLoading.value = false
      if (error || !response?.isSuccessful || !response.data) return
      const { hotPort, hotStation, recordList } = response.data
      recommendState.hotPort = hotPort
      recommendState.hotStation = hotStation
      searchRecordList.value = recordList
    }
    // 点击推荐站点/港口事件
    function handleRecommendClick(
      type: "railway" | "waterway",
      recommendType: "hot" | "distance",
      data: UnionRecommendState
    ) {
      if (!data) return;
      if (recommendType === "hot") {
        toQuerySolution(data as any, "start", true);
        return;
      }
      let payload: any = {};
      if (type === "railway") {
        const value = data as Dashboard.RailwayStationDto;
        const [lng, lat] = value.railwayLocation.split(",");
        payload = {
          province: value.provinceName,
          lat,
          lng,
          city: value.cityName,
          district: value.districtName,
          typeId: 1,
          address: value.railwayStationName,
          id: value.id
        };
      } else {
        const value = data as Dashboard.WaterPortStationDto;
        const [lat, lng] = value.portCoord.split("/");
        const [province, city, district] = value.portAddress.split(",");
        payload = {
          province,
          lat,
          lng,
          city,
          district,
          typeId: 3,
          address: value.portAreaName,
          id: value._id
        };
      }
      emit("success", payload);
      showHistoryCard.value = false;
    }

    const getDifferentTypeStation = computed(
      () => (isStation: boolean, type: "distance" | "hot") => {
        if (isStation) {
          if (type === "hot") {
            return recommendState.hotStation
              ? { name: recommendState.hotStation.value }
              : { name: "获取中..." };
          }
          return recommendState.minDistanceStation
            ? { name: recommendState.minDistanceStation?.railwayStationName }
            : { name: "获取中..." };
        }
        if (type === "hot") {
          return recommendState.hotPort
            ? { name: recommendState.hotPort.value }
            : { name: "获取中..." };
        }
        return recommendState.minDistancePort
          ? { name: recommendState.minDistancePort.portAreaName }
          : { name: "获取中..." };
      }
    );

    function removeRecords() {
      ElMessageBox.confirm("确定要清空搜索记录吗？", "温馨提示", {
        confirmButtonText: "确定",
        cancelButtonText: "我再想想",
        showClose: false
      }).then(async () => {
        const [error] = await clearSearchRecords()
        if (error) return
        getSearchRecord();
      });
    }

    let stopHandle = () => {};
    stopHandle = watch(
      () => props.currentLocation,
      (v) => {
        if (v) {
          console.log(v);
          getNearStationPort({
            longitude: v.lng,
            latitude: v.lat,
            provinceName: v.province
          });
          stopHandle();
        }
      }
    );

    function getNearStationPort(params) {
      Promise.all([SearchNearStation(params), SearchNearPort(params)]).then(
        (res) => {
          console.log(res);
          const [stationRsp, portRsp] = res;
          if (
            stationRsp.isSuccessful &&
            Array.isArray(stationRsp.data) &&
            stationRsp.data.length
          ) {
            stationRsp.data.sort((a, b) => a.distance - b.distance);
            recommendState.minDistanceStation = stationRsp.data[0];
          }
          if (
            portRsp.isSuccessful &&
            Array.isArray(portRsp.data) &&
            portRsp.data.length
          ) {
            portRsp.data.sort((a, b) => a.distance - b.distance);
            recommendState.minDistancePort = portRsp.data[0];
          }
        }
      );
    }

    // #endregion

    // el-autocomplete

    async function querySearchAsync(keywords: string, cb: Function) {
      if (keywords) {
        const result: Array<any> = [];
        const stationList = await queryStations(keywords);
        result.push(
          ...stationList.map((e) => {
            const [lat, lng] = e.latlng.split(",");
            return {
              value: e.name,
              _id: e.id,
              lat,
              lng,
              type: e.tgsPointTypeId,
              typeName: e.tgsPointTypeName,
              adt: {
                province: e.province,
                city: e.city,
                district: e.district,
                town: ""
              }
            };
          })
        );

        if (props.stationType !== "all") {
          cb(result);
          return;
        }
        const pois = await searchByTMap(keywords);
        if (!pois.length) {
          cb(result);
          return;
        }

        for await (const item of pois) {
          const [lng, lat] = item.lonlat.split(",");
          const [bd_lng, bd_lat] = wgs84tobd09(+lng, +lat);
          const adt = await getTMapAddrssWithPoint(+lng, +lat);
          const appendTitle = item?.poiType === "102" ? "(公交站)" : "";
          result.push({
            value: item.name + `${appendTitle}`,
            lat: bd_lat,
            lng: bd_lng,
            typeId: TransportTypeEnum.Enum.highway.id,
            typeName: "地址",
            _id: guid(),
            adt: {
              province: adt?.addressComponent?.province ?? "",
              city: adt?.addressComponent?.city ?? "",
              district: adt?.addressComponent?.county ?? "",
              town: adt?.addressComponent?.town ?? ""
            }
          });
        }
        cb(result);
        return;
      }
      cb([]);
    }

    async function queryStations(keywords: string) {
      try {
        const [error, result] = await getStationPorts(keywords)
        if (error || !result) return []
        if (props.stationType === "railway") {
          return result.filter(
            (e) => e.tgsPointTypeId === TransportTypeEnum.Enum.Railway.id
          );
        }
        if (props.stationType === "waterway") {
          return result.filter(
            (e) => e.tgsPointTypeId === TransportTypeEnum.Enum.Waterway.id
          );
        }
        return result;
      } catch (error) {
        return [];
      }
    }
    async function handleChangeAddress(payload: {
      value: string;
      lat: number;
      lng: number;
      type: number;
      typeName: string;
      _id: string;
      adt: IAddressState["adt"];
    }) {
      const data = {
        province: payload.adt.province,
        lat: payload.lat,
        lng: payload.lng,
        city: payload.adt.city,
        district: payload.adt.district,
        typeId: payload.type,
        address: payload.value,
        id: payload._id
      };
      showHistoryCard.value = false;
      emit("success", data);
      showHistoryCard.value = false;
      try {
        const payload = {
          recordType: data.typeId,
          value: data.address,
          valueId: data.id,
          latlng: data.lat + "," + data.lng,
          province: data.province,
          city: data.city,
          district: data.district
        };
        const [error] = await createSearchRecord(payload)
        if (error) return
      } catch (error) {
        console.log(error);
      }
    }
    function getJoinCity(payload: string[]) {
      return payload.filter(Boolean).join("-");
    }

    // 历史记录点击事件
    function toQuerySolution(
      item: SearchRecordResponse["recordList"][0],
      type: "start" | "arrive",
      chooseAddress = false
    ) {
      // 仅选择地址
      const [lat, lng] = item.latlng.split(",");
      if (chooseAddress) {
        const payload = {
          province: item.province,
          lat,
          lng,
          city: item.city,
          district: item.district,
          typeId: item.recordType,
          address: item.value,
          id: item.valueId
        };
        emit("success", payload);
        showHistoryCard.value = false;
      } else {
        // 从这发货 & 到货这里
        sessionStorage.setItem(
          "tgsSolutionQueryParams",
          JSON.stringify({
            value: item.value,
            type: item.recordType,
            lat: lat,
            lng: lng,
            adt: {
              province: item.province,
              city: item.city,
              district: item.district,
              town: ""
            },
            isStart: type === "start"
          })
        );
        routerAction.push({
          path: "/resource-app/tgs-solution-query"
        });
      }
    }

    function getIcon(id: string) {
      return SearchRecordTypeEnum.getSelf(+id)?.icon || "record-address";
    }

    const historySerachContentRef = ref<HTMLDivElement | null>(null);
    onMounted(() => {
      useClickAway(historySerachContentRef, () => {
        showHistoryCard.value = false;
      });
    });
    watch(showHistoryCard, (v) => {
      if (v) {
        getSearchRecord();
      }
    });
    return {
      modelAddress,
      showHistoryCard,
      attrs,
      recommendState,
      handleRecommendClick,
      getDifferentTypeStation,
      removeRecords,
      searchRecordList,
      getIcon,
      searchHistoryLoading,
      toQuerySolution,
      historySerachContentRef,
      querySearchAsync,
      handleChangeAddress,
      getJoinCity
    };
  }
});
</script>
<template>
  <div ref="historySerachContentRef" class="history-search-content">
    <el-autocomplete
      v-model="modelAddress"
      type="search"
      v-bind="attrs"
      :style="{ width: `${width}px` }"
      :trigger-on-focus="false"
      :fetch-suggestions="querySearchAsync"
      @select="handleChangeAddress"
      @focus="showHistoryCard = true"
    >
      <template #default="{ item }">
        <p class="suggest-record-item">
          <DcIcon :name="getIcon(item.type)" style="min-width: 1rem"></DcIcon>
          <span>{{ item.value }}</span>
          <span class="location-desc">
            {{ getJoinCity([item.adt?.city, item.adt?.district]) }}
          </span>
        </p>
      </template>
    </el-autocomplete>
    <div
      class="history-serach-content-main"
      :style="{ top: '36.2px', left: 0 }"
    >
      <el-card v-show="showHistoryCard">
        <div>
          <div class="recommend-area">
            <div class="recommend-area-railway">
              <div class="recommend-area-railway-left-icon">
                <DcIcon name="railway" />
              </div>
              <div class="recommend-area-railway-right-content">
                <p
                  class="recommend-area-hot flex items-center"
                  @click="
                    handleRecommendClick(
                      'railway',
                      'hot',
                      recommendState.hotStation
                    )
                  "
                >
                  <span class="history-overflow-text-label">热门：</span>
                  <span class="history-overflow-text">
                    {{ getDifferentTypeStation(true, "hot").name }}
                  </span>
                  <DcIcon name="hot" class="recommend-area-hot-icon" />
                </p>
                <el-divider dashed style="margin: 0.6rem 0" />
                <p
                  class="flex items-center"
                  @click="
                    handleRecommendClick(
                      'railway',
                      'distance',
                      recommendState.minDistanceStation
                    )
                  "
                >
                  <span class="history-overflow-text-label">最近：</span>
                  <span class="history-overflow-text">
                    {{ getDifferentTypeStation(true, "distance").name }}
                  </span>
                </p>
              </div>
            </div>

            <div class="recommend-area-waterway">
              <div class="recommend-area-waterway-left-icon">
                <DcIcon name="record-port" />
              </div>
              <div class="recommend-area-waterway-right-content">
                <p
                  class="recommend-area-hot flex items-center"
                  @click="
                    handleRecommendClick(
                      'waterway',
                      'hot',
                      recommendState.hotPort
                    )
                  "
                >
                  <span class="history-overflow-text-label">热门：</span>
                  <span class="history-overflow-text">
                    {{ getDifferentTypeStation(false, "hot").name }}
                  </span>
                  <DcIcon name="hot" class="recommend-area-hot-icon" />
                </p>
                <el-divider border-style="dashed" style="margin: 0.6rem 0" />
                <p
                  class="flex items-center"
                  @click="
                    handleRecommendClick(
                      'waterway',
                      'distance',
                      recommendState.minDistancePort
                    )
                  "
                >
                  <span class="history-overflow-text-label">最近：</span>
                  <span class="history-overflow-text">
                    {{ getDifferentTypeStation(false, "distance").name }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="scroll-content">
            <div class="search-record fs-14">
              <div class="search-record-title">
                <p>
                  <span>搜索记录</span>
                </p>
                <p class="search-record-remove" @click="removeRecords">
                  <DcIcon name="remove" />
                  <span>清空</span>
                </p>
              </div>
              <div v-if="searchRecordList.length">
                <template v-for="item in searchRecordList" :key="item.id">
                  <div class="history-item">
                    <p @click="toQuerySolution(item, 'start', true)">
                      <DcIcon
                        :name="getIcon(`${item.recordType}`)"
                        class="history-select-record-icon"
                      />
                      <span class="history-item-value">
                        <i class="history-item-value-detail">
                          {{ item.value }}
                        </i>
                        <i class="history-city-district">
                          {{ item.city }}/{{ item.district }}
                        </i>
                      </span>
                    </p>
                    <p class="history-item-btns">
                      <el-button
                        type="primary"
                        size="small"
                        @click.prevent.stop="toQuerySolution(item, 'start')"
                      >
                        从这发货
                      </el-button>
                      <el-button
                        type="warning"
                        size="small"
                        @click.prevent.stop="toQuerySolution(item, 'arrive')"
                      >
                        到货这里
                      </el-button>
                    </p>
                  </div>
                </template>
              </div>
              <div v-else class="history-select-no-data">
                <DcIcon name="purple-no-data" :width="6" :height="6" />
                <span>{{ searchHistoryLoading ? "获取中" : "暂无数据" }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>
<style lang="less" scoped>
.history-search-content {
  position: relative;
  :deep(.el-card__body) {
    padding: 16px !important;
  }
}
.history-serach-content-main {
  position: absolute;
  width: 100%;
  z-index: 999;
}
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.search-container {
  position: relative;
  z-index: 99;
}
.recommend-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.recommend-item {
  display: flex;
  flex-direction: column;
  text-align: center;
  min-width: 30%;
  background: white;
  padding: 0.4rem 0;
  border-radius: 6px;
  position: relative;
}
.hot {
  position: absolute;
  top: -8px;
  right: -8px;
}
.scroll-content {
  max-height: 40rem;
  overflow-y: auto;
  overflow-x: hidden;
  &::-webkit-scrollbar {
    width: 4px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(71, 181, 255, 0.3);
  }
}
.search-record {
  background: white;
  padding: 0.6rem 0;
  border-radius: 4px;
  height: 90%;
  &-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.6rem;
  }
  &-remove {
    display: flex;
    align-items: flex-end;
    cursor: pointer;
    & > :last-child {
      margin-left: 0.2rem;
      color: #a4a4a4;
    }
  }
}
.fc-gray-6 {
  color: var(--van-gray-6);
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem;
  border-radius: 6px;
  &:hover {
    background: #e1f1ff;
    cursor: pointer;
  }
  & > p {
    display: flex;
    align-items: center;
    &:first-child {
      width: 52%;
      overflow: hidden;
    }
  }
  &-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
  }
  &-address {
    color: #969799;
    font-size: 12px;
    margin-left: 0.2rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &-btns {
    & > button {
      padding: 0.2rem 0.6rem !important;
      height: 22px !important;
    }
    & > :last-child {
      margin-left: 0.4rem;
    }
  }
}
.math-record-list {
  background: white;
  position: absolute;
  max-height: 18rem;
  left: 0;
  right: 0;
  z-index: 999;
  overflow: auto;
  padding: 0.6rem;
  min-height: 10rem;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}
.match-record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  & > div:first-child {
    display: flex;
    align-items: center;
    max-width: 80%;
    & > :nth-child(2) {
      margin: 0 0.2rem;
      max-width: 70%;
      overflow: hidden;
      display: inline-block;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    & > :last-child {
      color: var(--van-gray-6);
    }
  }
}
.loading-wrap {
  width: 80%;
  height: 10rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  #matchRecordLoading {
    width: 100%;
    height: 80%;
  }
  & > :last-child {
    color: var(--van-gray-5);
  }
}
.empty-match-record {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &-tips {
    color: var(--van-gray-6);
  }
}

.history-select-record-icon {
  min-width: 1rem;
  min-height: 1rem;
}

.recommend-area-railway,
.recommend-area-waterway {
  display: flex;
  align-items: center;
  background: #cfe9ff;
  color: white;
  font-size: 14px;
  border-radius: 6px;
  font-size: 14px;
  width: 48%;
  &-left-icon {
    padding: 0 0.6rem;
    color: #289bff;
    font-size: 14px;
  }
  &-right-content {
    background: #60a9ff;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    padding: 0.6rem 0.6rem;
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
    box-shadow: -6px 0px 11px 0px #4b9eff61;
    flex-grow: 1;
    color: #ffffff;
    max-width: 75%;
  }
}
.recommend-area-hot {
  position: relative;
  &-icon {
    position: absolute;
    right: -12px;
    top: -8px;
  }
}

.history-overflow-text {
  width: 64%;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 0.2rem;
  cursor: pointer;
  user-select: none;
}
.history-overflow-text-label {
  padding-top: 0.2rem;
  cursor: pointer;
  user-select: none;
}
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.history-select-no-data {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 4rem;
  & > span {
    color: #c7c7c7;
    user-select: none;
  }
}
.history-city-district {
  font-style: normal;
  color: #969799;
}
.history-item-value-detail {
  font-style: normal;
  margin: 0 0.4rem;
}
.search-content-tips {
  font-size: 12px;
  color: #a8a8a8;
}
.divider {
  border-top: 1px dashed #d5d3d3;
  margin-top: 0.6rem;
}
.suggest-record-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  & > :first-child {
    margin-right: 8px;
  }
}
.location-desc {
  font-size: 10px;
  margin-left: 0.4rem;
  color: #999;
}
</style>
