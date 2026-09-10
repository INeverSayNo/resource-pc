<template>
  <div
    v-loading="baseState.mapLoading"
    class="main"
    :style="{ height: `${baseState.height}px` }"
  >
    <div class="search-box">
      <HistorySelect
        v-model:address="queryAddress"
        v-model:show-mask="showMask"
        :width="500"
        :current-location="currentLocation"
        placeholder="请输入站点名称/港口名称/地址搜索"
        @success="selectedAddress"
      ></HistorySelect>
      <div
        v-if="nearState.show"
        class="animate__animated animate__bounceInLeft"
      >
        <el-tabs v-model="baseState.activeName">
          <el-tab-pane label="铁路站点" name="railway" />
          <el-tab-pane label="水运港口" name="water" />
        </el-tabs>
        <div v-if="baseState.activeName === 'railway'" class="near-list">
          <div class="title">
            {{ nearState.nearText }}附近站点({{
              nearState.nearList?.length || 0
            }})
            <span
              class="fr theme-color fs-12"
              @click="nearState.showNearList = !nearState.showNearList"
            >
              <DAliIcon :name="nearState.showNearList ? 'arrow-up' : 'arrow-down'" />
              {{ nearState.showNearList ? "收起" : "展开" }}
            </span>
          </div>
          <div v-show="nearState.showNearList">
            <el-form suffix="" class="filter-wrap">
              <div class="filter-top">
                <el-form-item
                  label="办理品名"
                  class="filter-form-goods-item"
                  
                >
                  <RailwayGoods
                    v-model="filterState.goodsName"
                    placeholder="请输入品类/品名"
                    @change="handleGoodsChange"
                  ></RailwayGoods>
                </el-form-item>
                <el-form-item
                  label=""
                  
                  class="filter-form-type-item"
                >
                  <el-checkbox-group
                    v-model="stationTypeList"
                    @change="changeStationList"
                  >
                    <el-checkbox label="start" value="start">
                      筛选发货站
                    </el-checkbox>
                    <el-checkbox label="arrive" value="arrive">
                      筛选到货站
                    </el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </div>
              <el-form-item class="filter-form-bottom">
                <el-checkbox
                  v-model="filterState.hasGoodPricePolicy"
                  label="有优价"
                  
                />
                <el-checkbox
                  v-model="filterState.isContainer"
                  label="集装箱办理"
                  
                />
                <el-checkbox
                  v-model="filterState.isDangerous"
                  label="危险品办理"
                  
                />
                <el-button type="primary"  @click="filterStation">
                  筛选
                </el-button>
              </el-form-item>
            </el-form>
            <div
              v-loading="nearState.nearLoading || nearState.locating"
              class="content"
              :class="{
                'is-loading': nearState.nearLoading || nearState.locating
              }"
              :element-loading-text="
                nearState.locating ? '定位中...' : '数据加载中...'
              "
              element-loading-background="#F5F7FA"
              :style="{ marginTop: '12px' }"
            >
              <div
                v-for="(item, index) in nearState.nearList"
                :key="item.id"
                class="list"
                @click="handleSelectNearStationPort(item, 'railway')"
              >
                <div
                  class="station-name"
                  :style="{
                    color: stationLevelColorMap.get(
                      item.stationLevelMark || 'Todo'
                    )
                  }"
                >
                  <span>{{ index + 1 }}、{{ item.railwayStationName }}</span>
                  <span>({{ item.stationLevelName || "待开发站点" }})</span>
                  <span
                    class="distance fr"
                    :class="{ navigate: item.navigate }"
                  >
                    ({{ item.distance?.toFixed(2) }}公里)
                  </span>
                </div>
                <div style="width: 470px">
                  货场整车办理限制：
                  <span :class="renderBusinessLimit(item.businessLimit)">
                    {{ item.businessLimit }}
                  </span>
                </div>
                <div class="station-tags">
                  <span
                    v-for="(tag, tIndex) in item.tags"
                    :key="tIndex"
                    class="station-tag"
                    :class="tagColorMap.get(tag)"
                  >
                    {{ tag }}
                  </span>
                </div>
                <!-- 车站属性 -->
                <div>
                  <span
                    v-for="propertyItem in renderStationProperties(item)"
                    :key="propertyItem.value"
                    class="propertie-item mt-04"
                    :class="[propertyItem.class]"
                  >
                    {{ propertyItem.value }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <el-empty
            v-show="nearState.showNearList"
            v-if="
              !nearState.nearLoading &&
              !nearState.locating &&
              !nearState.nearList.length
            "
            :image-size="48"
          />
        </div>
        <div
          v-if="baseState.activeName === 'water'"
          class="near-list"
          :class="{ expand: nearState.showNearList }"
        >
          <div class="title">
            {{ nearState.nearText }}附近港口({{
              nearState.portNearList?.length || 0
            }})
            <span
              class="fr theme-color fs-12"
              @click="nearState.showNearList = !nearState.showNearList"
            >
              <DAliIcon :name="nearState.showNearList ? 'arrow-up' : 'arrow-down'" />
              {{ nearState.showNearList ? "收起" : "展开" }}
            </span>
          </div>
          <div
            v-show="nearState.showNearList"
            v-loading="nearState.nearLoading || nearState.locating"
            class="content"
            :class="{
              'is-loading': nearState.nearLoading || nearState.locating
            }"
            :element-loading-text="
              nearState.locating ? '定位中...' : '数据加载中...'
            "
            element-loading-background="#F5F7FA"
            :style="{ marginTop: '35px' }"
          >
            <div
              v-for="(item, index) in nearState.portNearList"
              :key="item._id"
              class="list"
              @click="handleSelectNearStationPort(item, 'waterway')"
            >
              <div
                class="station-name"
                :style="{
                  color: stationLevelColorMap.get(item.portScale || 'Todo')
                }"
              >
                <span>{{ index + 1 }}、{{ item.portAreaName }}</span>
                <span>({{ item.portType || "待开发港口" }})</span>
                <span class="distance fr" :class="{ navigate: item.navigate }">
                  ({{ item.distance?.toFixed(2) }}公里)
                </span>
              </div>
              <div style="width: 470px; color: #878787">
                备注：
                <span>
                  {{ item.portSpecification }}
                </span>
              </div>
              <div class="station-tags">
                <span
                  class="station-tag"
                  :class="tagColorPortMap.get(item.portType) || 'info'"
                >
                  {{ item.portType }}
                </span>
              </div>
            </div>
          </div>
          <el-empty
            v-show="nearState.showNearList"
            v-if="
              !nearState.nearLoading &&
              !nearState.locating &&
              !nearState.nearList.length
            "
            :image-size="48"
          />
        </div>
        <div
          v-if="nearState.show && showMask"
          class="history-select-mask"
        ></div>
      </div>
    </div>
    <div v-show="navigationState.mapRouteDescription" class="map-route">
      {{ navigationState.mapRouteDescription }}
    </div>
    <div v-if="cmsState.cmsList.length" class="notice">
      <div class="notice-title">
        重要通知(TOP{{ cmsState.cmsList.length }})
        <span class="bar fs-12" @click="handleCmsShow">查看更多</span>
        <span
          class="fr bar fs-12"
          @click="cmsState.cmsExpaned = !cmsState.cmsExpaned"
        >
          {{ cmsState.cmsExpaned ? "收起" : "展开" }}
          <DAliIcon :name="cmsState.cmsExpaned ? 'arrow-up' : 'arrow-down'" />
        </span>
      </div>
      <div
        v-for="(item, index) in cmsState.cmsList"
        v-show="cmsState.cmsExpaned"
        :key="item.id"
        class="w-clamp clamp-1"
        @click="handleCmsShow"
      >
        <span class="theme-color cu-pointer" @click.stop="handleCmsRead(item)">
          {{ index + 1 }}、
          <span v-if="item.businessName">[{{ item.businessName }}]</span>
          {{ item.title }}
        </span>
      </div>
    </div>
    <div :id="id" ref="containerRef" class="map-container"></div>
    <input id="mapAutoCompleteInput" style="display: none" />
  </div>
  <CmsDialog
    v-model="cmsState.showCms"
    :show-query="true"
    :business-id="cmsState.cmsId"
  ></CmsDialog>
  <CmsDtDialog></CmsDtDialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useMap } from "./useMap";
import { tagColorMap, stationLevelColorMap, tagColorPortMap } from "./store";
import CmsDialog from "@/views/resource/resource-cms/table-dialog.vue";
import CmsDtDialog from "@/views/resource/resource-cms/dt-dialog.vue";
import RailwayGoods from "@/components/Railway/goodsNew.vue";
import HistorySelect from "@/components/StationAddressSelect/historySelect.vue";
import {
  ChooseItem,
  IAddressState
} from "@/components/StationAddressSelect/type";
import { useRouter } from "vue-router";
import { DcDeep } from "@dczy/tie-tools";

export default defineComponent({
  components: {
    CmsDialog,
    CmsDtDialog,
    RailwayGoods,
    HistorySelect
  },
  setup(props, { emit }) {
    const id = `Map_container_dc_${new Date().getTime()}`;
    const routerAction = useRouter();

    // #region 铁路站点筛选
    const filterState = reactive({
      goodsName: "",
      goodsCode: "",
      stationType: "",
      isContainer: false,
      hasGoodPricePolicy: false,
      isDangerous: false
    });
    function handleGoodsChange({
      goodsCode,
      goodsName
    }: Record<"goodsName" | "goodsCode", string>) {
      filterState.goodsName = goodsName;
      filterState.goodsCode = goodsCode;
    }

    const stationTypeList = ref<string[]>([]);
    function changeStationList(payload: string[]) {
      const text = payload[payload.length - 1];
      stationTypeList.value = [text];
    }

    function filterStation() {
      const data = {
        ...DcDeep.clone(searchNearStationParams.value),
        ...filterState,
        goodsCode: filterState.goodsName ? filterState.goodsCode : ""
      };
      if (stationTypeList.value.filter(Boolean).length) {
        data.isSendStation = stationTypeList.value[0] === "start";
      } else {
        delete data?.isSendStation;
      }
      loadNearStation(data);
    }
    // #endregion

    const {
      containerRef,
      optionsState,
      baseState,
      nearState,
      loadNearStation,
      loadNearPort,
      handleSelectNearStationPort,
      renderStationProperties,
      cmsState,
      handleCmsRead,
      handleCmsShow,
      MapInstance,
      renderStation,
      currentLocation,
      stationPortList,
      addMarkerLable,
      addAddressMarker,
      searchNearStationParams,
      navigationState
    } = useMap(filterState);
    function renderBusinessLimit(val?: string) {
      return val?.indexOf("均不办理") !== -1 || val?.indexOf("不办理") !== -1
        ? "theme-danger"
        : val?.indexOf("仅办理") !== -1
        ? "theme-warning"
        : "";
    }

    const queryAddress = ref("");

    function selectedAddress(payload: ChooseItem) {
      filterState.goodsName = "";
      filterState.goodsCode = "";
      filterState.stationType = "start";
      filterState.isContainer = false;
      filterState.hasGoodPricePolicy = false;
      filterState.isDangerous = false;
      nearState.showNearList = true;
      const isRailwayOrWater = payload.typeId !== 2;
      const point = new BMapGL.Point(+payload.lng, +payload.lat);
      const pointId = isRailwayOrWater ? payload.id : "";
      const pointName = isRailwayOrWater ? payload.address : "";
      loadNearStation(point, payload.province, pointId, pointName);
      loadNearPort(point, payload.province, pointId, pointName);
      MapInstance.value?.setCenter(point, {
        callback: () => {
          renderStation();
          if (payload.typeId !== 2) {
            const result = findStationByPropertie("id", payload.id);
            if (result) {
              addMarkerLable([result as any], true);
            }
          } else {
            addAddressMarker(point, payload, routerAction);
          }
        }
      });
    }

    const showMask = ref(false);

    function findStationByPropertie(key: string, value: string) {
      let matchStationPort: Dashboard.PortItem | Dashboard.StationItem | null =
        null;
      for (let i = 0; i < stationPortList.value.length; i++) {
        for (let j = 0; j < stationPortList.value[i].cityList.length; j++) {
          const matchStation = stationPortList.value[i].cityList[
            j
          ].stationList.find((e) => e.station[key] === value);
          if (matchStation) {
            matchStationPort = matchStation;
            break;
          }
          const matchPort = stationPortList.value[i].cityList[j].portList.find(
            (e) => e.station[key] === value
          );
          if (matchPort) {
            matchStationPort = matchPort;
            break;
          }
        }
      }
      return matchStationPort;
    }

    return {
      id,
      containerRef,
      optionsState,
      baseState,
      nearState,
      navigationState,
      tagColorMap,
      stationLevelColorMap,
      tagColorPortMap,
      handleSelectNearStationPort,
      renderStationProperties,
      cmsState,
      handleCmsRead,
      handleCmsShow,
      renderBusinessLimit,
      queryAddress,
      selectedAddress,
      currentLocation,
      showMask,
      filterState,
      handleGoodsChange,
      filterStation,
      changeStationList,
      stationTypeList
    };
  }
});
</script>

<style lang="less">
@import "./style.less";

.propertie-item {
  padding: 0 5px;
  margin-right: 5px;
  border: 1px solid var(--theme-info);
  border-radius: 2px;
  display: inline-table;
  line-height: 16px;
  background-color: #fff !important;
  &.success {
    color: var(--theme-success) !important;
    border: 1px solid var(--theme-success) !important;
  }
  &.primary {
    color: var(--theme-color) !important;
    border: 1px solid var(--theme-color) !important;
  }
  &.warning {
    color: var(--theme-warning) !important;
    border: 1px solid var(--theme-warning) !important;
  }
  &.danger {
    color: var(--theme-info) !important;
    border: 1px solid var(--theme-info) !important;
  }
  &.info {
    color: var(--theme-info) !important;
    border: 1px solid var(--theme-info) !important;
  }
  &.no-border {
    border: 0px;
  }
  &.has-suffix {
    margin-right: 0;
  }
}
.mt-04 {
  margin-top: 0.4rem;
}
.history-select-mask {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  bottom: 0;
  top: 0;
  height: 100vh;
}
.filter-wrap {
  margin-top: 35px;
  box-shadow: 1px 1px 11px 4px #e0f3ff;
  background: #9bd1ff69;
  border-radius: 6px;
  padding: 11px 4px;
  margin-bottom: 16px;
}
.filter-top {
  display: flex;
  align-items: center;
}
.filter-form-goods-item {
  width: 14rem;
  margin-bottom: 0 !important;
}
.filter-form-type-item {
  margin-left: 10px;
  flex-grow: 1;
  margin-bottom: 0 !important;
  :deep(.el-radio__label) {
    padding-left: 4px;
  }
  :deep(.el-radio) {
    margin-right: 20px;
  }
}
.filter-form-type-item .el-radio__inner {
  border-radius: 0 !important;
}
.mb-0 {
  margin-bottom: 0;
}
.filter-form-bottom {
  margin-bottom: 0;
  :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 1.5rem;
  }
}

.filter-form-bottom .el-form-item__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
