<template>
  <div class="station-detail-page-wrap">
    <div class="station-details thin-line-scroll">
      <div
        class="title"
        :style="{
          color: stationLevelColorMap.get(data?.station.stationLevelMark || 'Todo')
        }"
      >
        <DAliIcon
          name="railway"
          width="26"
          height="26"
          :color="stationLevelColorMap.get(data?.station.stationLevelMark || 'Todo')"
        ></DAliIcon>
        {{ data?.station.railwayStationName }}
        <span class="theme-danger fs-12"> </span>
        <span class="theme-warning fs-12"> </span>
      </div>
      <div class="station-base-tag">
        <span class="fs-12 station-base-tag-title">站点属性</span>
        <el-tag
          v-for="(item, index) in getStationTag"
          :key="index"
          plain
          class="define mr-5px fw-bold"
          :type="item?.isShow ? 'primary' : item?.isRight ? 'success' : 'info'"
        >
          {{ item?.isExist ? (item.isRight ? '√' : '×') : '' }}{{ item.name }}
        </el-tag>
      </div>

      <el-row>
        <el-col :span="24" class="station-base-tag">
          <span class="label fs-12 station-base-tag-title">办理范围</span>
          <el-tag
            v-for="(item, index) in getBusinessScope"
            :key="index"
            plain
            class="define mr-5px fw-bold"
            :type="item.class == 'success' ? 'success' : 'info'"
          >
            {{ item.value }}
          </el-tag>
        </el-col>
        <el-col
          v-if="data?.station?.scopeOfBusiness.includes('货场')"
          :span="24"
          class="station-base-tag"
        >
          <span class="label fs-12 station-base-tag-title">货场办理</span>
          <el-tag v-if="data.station?.businessLimit" plain class="mr-5px" type="primary">
            <span>{{ data.station?.businessLimit }}</span>
          </el-tag>
          <el-tag
            v-for="(item, index) in getYardAndZyxLimit(true)"
            :key="index"
            plain
            class="define ml-5px fw-bold"
            :type="item.class == 'success' ? 'success' : 'info'"
          >
            {{ item.value }}
          </el-tag>
        </el-col>
        <el-col
          v-if="data?.station?.scopeOfBusiness.includes('专用线')"
          :span="24"
          class="station-base-tag"
        >
          <span class="label fs-12 station-base-tag-title">专用线办理</span>
          <el-tag
            v-for="(item, index) in getYardAndZyxLimit(false)"
            :key="index"
            plain
            class="define mr-5px fw-bold"
            :type="item.class == 'success' ? 'success' : 'info'"
          >
            {{ item.value }}
          </el-tag>
        </el-col>
      </el-row>

      <CmsInfo :station-id="data?.station?.id"></CmsInfo>

      <BaseInfo
        :station="data?.station"
        :stationary-users="data?.stationaryUsers"
        @reload="loadData"
      ></BaseInfo>
      <Contact :station-id="stationId" :contacts="data?.contactList" @reload="loadData"></Contact>
      <Yard :yard="data?.yard" @reload="loadData"></Yard>
      <PrivateLine
        :list="data?.zyxList"
        :station-id="stationId"
        :allow-add="permissionNew"
        @reload="loadData"
      ></PrivateLine>
      <StopLimit :station-id="stationId" :list="data?.stopList" @reload="loadData"></StopLimit>
      <SupplierEx
        
        :list="data?.supplier"
        :station-id="stationId"
        :loading="supplierLoading"
        :station-name="data?.station?.railwayStationName"
        @reload="loadData"
      ></SupplierEx>
      <GoodPricePolicy
        :list="data?.goodPricePolicy"
        :station-id="data?.station?.id"
        :station-name="data?.station?.railwayStationName"
        @reload="loadData"
      ></GoodPricePolicy>

      <Warehouse
        :station-id="data?.station?.id"
        :station-name="data?.station.railwayStationName"
      ></Warehouse>
      <Equipment
        :station-id="data?.station?.id"
        :station-name="data?.station?.railwayStationName"
      ></Equipment>
      <ChangeTicket
        :station-id="data?.station?.id"
        :station-name="data?.station.railwayStationName"
      ></ChangeTicket>
      <StationHighwayDispatch
        :station-name="stationName"
        @reload="loadData"
      ></StationHighwayDispatch>

      <!-- <VisitRecord
        :station-id="stationId"
        :station-name="data?.station?.railwayStationName"
      ></VisitRecord> -->
    </div>
    <div class="station-detail-aside-content thin-line-scroll">
      <SinglerStationMap
        :station-name="data?.station.railwayStationName"
        :center-latlng="getStationPosition(data?.station)"
      ></SinglerStationMap>
      <StationVr
        v-show="showVrEl"
        :station-id="stationId"
        :station-name="data?.station.railwayStationName"
      />
      <SitePhotoNew :station-id="stationId" :station-name="data?.station.railwayStationName" />
    </div>
  </div>
</template>

<script lang="ts">
  import { toRefs, defineComponent, ref, onMounted, nextTick, computed, onActivated } from 'vue'
  import { useDetails } from './useDetails'
  import BaseInfo from './components/baseinfo.vue'
  import SinglerStationMap from './components/singleStationMapNew.vue'
  import Contact from './components/contact.vue'
  import StopLimit from './components/stopLimit.vue'
  import Yard from './components/yard.vue'
  import PrivateLine from './components/privateLine.vue'
  import SupplierEx from './components/supplierEx.vue'
  import Warehouse from '../warehouse/conciseList.vue'
  import Equipment from '../equipment/conciseList.vue'
  import ChangeTicket from '../changeTicket/conciseList.vue'
  import StationHighwayDispatch from './components/stationHighwayDispatch.vue'
  import GoodPricePolicy from './components/goodPricePolicy.vue'
  import VisitRecord from './components/visitRecord.vue'
  import CmsInfo from './components/cmsInfo.vue'
  import SitePhotoNew from '../sitePhoto/index.vue'
  import StationVr from '../stationVr/index.vue'
  import { publicAssetUrl } from '@/utils/publicAsset'
  import { tagColorMap, stationLevelColorMap } from './store'
  import { useRoute } from 'vue-router'
  import { RailWayStation } from './types'

  const pMap = new Map<string, string>([
    ['IsStationNormalBusiness', '普货整车'],
    ['IsStationContainerBusinessSend', '集装箱发送'],
    ['IsStationContainerBusinessArrival', '集装箱到达'],
    ['IsStationDangerousBusinessSend', '危险品办理'],
    ['IsStationDangerousBusinessArrival', '危险品办理']
  ])
  const zMap = new Map<string, string>([
    ['IsPrivateLineNormalBusinessSend', '普货整车'],
    ['IsPrivateLineNormalBusinessArrival', '普货整车'],
    ['IsPrivateLineContainerBusinessSend', '集装箱发送'],
    ['IsPrivateLineContainerBusinessArrival', '集装箱到达'],
    ['IsPrivateLineDangerousBusinessSend', '危险品办理'],
    ['IsPrivateLineDangerousBusinessArrival', '危险品办理']
  ])

  export default defineComponent({
    components: {
      BaseInfo,
      Contact,
      StopLimit,
      Yard,
      PrivateLine,
      SupplierEx,
      Warehouse,
      ChangeTicket,
      StationHighwayDispatch,
      SinglerStationMap,
      GoodPricePolicy,
      VisitRecord,
      CmsInfo,
      SitePhotoNew,
      StationVr,
      Equipment
    },
    setup() {
      const { state, loadData, getStationTag } = useDetails()

      const route = useRoute()
      const { name } = route.query as Record<'name', string>
      const showVrEl = ref(false)
      async function beforeLoadVr(folderName: string) {
        if (!folderName) return false
        const response = await fetch(publicAssetUrl(`vtour/${folderName}/tour.xml`))
        return response.ok && (await response.text()).startsWith('<krpano')
      }

      const getStationPosition = (payload?: RailWayStation) => {
        if (!payload) {
          return {
            lat: 39.912272644256625,
            lng: 116.38738248680114
          }
        }
        const [stationLng, stationLat] = (payload.railwayLocation || '').split(',')
        if (stationLng && stationLat) {
          return {
            lat: stationLat,
            lng: stationLng
          }
        }
        const { lat, lng } = payload.AddressFormat || {}
        return {
          lat: lat || 39.912272644256625,
          lng: lng || 116.38738248680114
        }
      }
      onMounted(() => {
        beforeLoadVr(name).then((res) => {
          showVrEl.value = res
        })
      })

      const getBusinessScope = computed(() => {
        if (!Reflect.has(state.data?.station || {}, 'scopeOfBusiness')) return []

        const scope = state.data?.station?.scopeOfBusiness || '货场，专用线'
        return [
          {
            value: `${scope.includes('货场') ? '√货场' : '×货场'}`,
            class: scope.includes('货场') ? 'success' : 'danger'
          },
          {
            value: `${scope.includes('专用线') ? '√专用线' : '×专用线'}`,
            class: scope.includes('专用线') ? 'success' : 'danger'
          }
        ].sort((a, b) => {
          if (a.class === 'success' && b.class !== 'success') return -1
          if (a.class !== 'success' && b.class === 'success') return 1
          return 0
        })
      })

      const getYardAndZyxLimit = computed(() => (isYard: boolean) => {
        if (
          !Reflect.has(state.data?.station || {}, 'stationBusinessLimit') ||
          !state.data?.station.stationBusinessLimit
        ) {
          return []
        }
        try {
          const limits = JSON.parse(state.data?.station.stationBusinessLimit ?? '{}')
          const data: Record<'value' | 'class', string>[] = []
          Object.keys(limits).forEach((key) => {
            const label = isYard ? pMap.get(key) : zMap.get(key)
            if (!label) return null
            const current = data.find((x) => x.value.endsWith(label))
            if (current) {
              if (current.value.startsWith('×') && limits[key]) {
                current.value = `√${label}`
                current.class = 'success'
              }
              return
            }
            data.push({
              value: limits[key] ? `√${label}` : `×${label}`,
              class: limits[key] ? 'success' : 'danger'
            })
          })
          if (isYard) {
            const hasPlky = state.data.station.tags?.includes('批量快运')
            data.push({
              value: hasPlky ? `√批量快运` : `×批量快运`,
              class: hasPlky ? 'success' : 'danger'
            })
          }
          return Array.from(new Set(data)).sort((a, b) => {
            if (a.class === 'success' && b.class !== 'success') return -1
            if (a.class !== 'success' && b.class === 'success') return 1
            return 0
          })
        } catch (error) {
          return []
        }
      })

      onMounted(loadData)

      return {
        ...toRefs(state),
        loadData,
        getStationTag,
        tagColorMap,
        stationLevelColorMap,
        showVrEl,
        getStationPosition,
        getYardAndZyxLimit,
        getBusinessScope
      }
    }
  })
</script>

<style lang="less" scoped>
  @import './style.less';
</style>
