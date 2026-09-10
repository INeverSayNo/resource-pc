<template>
  <div>
    <el-button v-if="showButton" :disabled="disabled" @click="handleOpenDialog" />
    <el-input
      v-else
      ref="inputRef"
      v-model="addressInfoState.address"
      :placeholder="title"
      readonly
      :disabled="disabled"
      class="dc-bmap-select"
      :class="{ 'no-btn': !showPicker }"
      @click="handlefocus"
      @blur="handlBlur"
    >
      <template v-if="showPicker" #append>
        <el-button :disabled="disabled" @click="handleOpenDialog">
          <d-ali-icon name="search"></d-ali-icon>
        </el-button>
      </template>
    </el-input>

    <com-dialog
      :show-fullscreen="true"
      :model-value="visable"
      :width="width"
      :title="title"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      @close="handleClose"
      @fullscreen="handleFullscreen"
    >
      <div>
        <div class="flex items-center mb-10px">
          <ElSelect
            v-model="addressInfoState.address"
            ref="BMapSelectInputRef"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键字查询"
            :remote-method="remoteMethod"
            :loading="isLoading"
            style="width: 240px"
            value-key="uid"
            @change="changeSuggest"
          >
            <el-option
              v-for="(item, idx) in addressOptions"
              :key="idx"
              :label="item.title"
              :value="item"
            />
          </ElSelect>
          <p class="mx-20px">
            <span>经度：</span>
            <span class="font-size-12px c-#999">{{ addressInfoState.lng || '暂无数据' }}</span>
          </p>
          <p>
            <span>纬度：</span>
            <span class="font-size-12px c-#999">{{ addressInfoState.lat || '暂无数据' }}</span>
          </p>
        </div>
        <DMap
          ref="MapSelectDMapRef"
          :show-railway-bureau="false"
          :show-railway-line="false"
          :show-railway-station="false"
          :width="width"
          :show-location-icon="false"
          :map-id="getMapId"
          @click="handleClickMap"
          @init="initMap = true"
        ></DMap>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" :disabled="disable" @click="handleSubmit">确认</el-button>
        </span>
      </template>
    </com-dialog>
  </div>
</template>

<script lang="ts" setup>
  import { randomCode } from '@/utils'
  import { getAddressWithPoint, getPointWithAddress } from '@dczy/tie-pc'
  import { DcCommon } from '@dczy/tie-tools'
  import { ElSelect } from 'element-plus'
  import { computed, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'

  defineOptions({
    name: 'BmapSelect'
  })

  const props = defineProps({
    showButton: { type: Boolean, default: () => false },
    disabled: { type: Boolean, default: () => false },
    width: { type: [Number || String], default: () => 1000 },
    title: { type: String, default: () => '坐标选择器' },
    value: { type: Object, default: () => {} },
    showPicker: {
      type: Boolean,
      default: () => true
    }
  })

  const emit = defineEmits(['close', 'update:value', 'change', 'inputFocus', 'inpuBlur'])

  const MapSelectDMapRef = useTemplateRef('MapSelectDMapRef')
  const MapInstance = computed(() => MapSelectDMapRef.value?.MapInstance)
  const initMap = ref(false)
  const getMapId = `map-select-${randomCode()}`

  const visable = ref(false)
  const height = ref(400)

  const addressInfoState = reactive({
    address: '',
    lat: '' as string | number,
    lng: '' as string | number,
    regionName: '',
    adt: null as BMapGL.AddressComponent | null
  })

  const disable = computed(() => !addressInfoState.lat || !addressInfoState.lng)

  const inputRef = ref()
  const handleClose = () => {
    visable.value = false
    emit('close', false)
  }

  const marker = ref<BMapGL.Marker | null>()
  const handleClickMap = async (payload: Record<'lat' | 'lng', number>) => {
    const point = new BMapGL.Point(payload.lng, payload.lat)
    setMarker(point)
    try {
      const result = await getAddressWithPoint(point)
      if (Array.isArray(result.surroundingPois) && result.surroundingPois.length) {
        addressOptions.value = result.surroundingPois
        await DcCommon.nextFrame()
        BMapSelectInputRef.value?.toggleMenu()
      }
    } catch (error) {}
  }

  const setMarker = (payload: BMapGL.Point) => {
    if (marker.value) {
      MapInstance.value?.removeOverlay(marker.value)
      marker.value = null
    }

    marker.value = new BMapGL.Marker(payload, {
      icon: new BMapGL.Icon(
        'https://gateway.dczhiyun.com/api/abp/minio/wechat/icon/green-location.svg',
        new BMapGL.Size(18, 18)
      )
    })
    MapInstance.value?.addOverlay(marker.value)
  }

  const handleSubmit = async () => {
    if (addressInfoState.lat && addressInfoState.lng && !addressInfoState.adt) {
      const point = new BMapGL.Point(+addressInfoState.lng, +addressInfoState.lat)
      const result = await getAddressWithPoint(point)
      addressInfoState.regionName = `${result.addressComponents.province},${result.addressComponents.city}${result.addressComponents.district}`
      addressInfoState.adt = result.content?.address_detail ?? null
    }

    emit('update:value', {
      address: addressInfoState.address,
      lat: addressInfoState.lat,
      lng: addressInfoState.lng,
      regionName: addressInfoState.regionName
    })
    emit(
      'change',
      addressInfoState.address,
      addressInfoState.lat,
      addressInfoState.lng,
      addressInfoState.regionName,
      addressInfoState.adt
    )
    emit('close', false)
    visable.value = false
  }

  const initAddressState = async([payload, isInit]) => {
    if (!payload || !isInit) return
    addressInfoState.address = payload?.address
    addressInfoState.lng = payload?.lng
    addressInfoState.lat = payload?.lat;
    await DcCommon.nextFrame();
    const point = new BMapGL.Point(payload.lng, payload.lat)
    MapInstance.value?.flyTo(point, 11)
    setMarker(point)
  }
  watch([() => props.value, () => initMap], initAddressState, {
    deep: true,
    immediate: true
  })

  const handleOpenDialog = () => {
    visable.value = true
    emit('close', true)
  }
  const handlefocus = (e) => {
    emit('inputFocus', e)
  }
  const handlBlur = (e) => {
    emit('inpuBlur', e)
  }
  function handleFullscreen(val, dragDom) {
    if (val) {
      const body = dragDom.querySelector('.el-dialog__body')
      height.value = body?.getBoundingClientRect().height || 400
    } else {
      height.value = 400
    }
  }

  const BMapSelectInputRef = useTemplateRef('BMapSelectInputRef')
  const addressOptions = ref<BMapGL.LocalResultPoi[]>([])
  const isLoading = ref(false)

  const remoteMethod = async (query: string) => {
    if (!query) return
    isLoading.value = true
    const result = await getPointWithAddress(query)
    isLoading.value = false
    addressOptions.value = result
  }

  const changeSuggest = async (payload: BMapGL.LocalResultPoi) => {
    const result = await getAddressWithPoint(payload.point)
    addressInfoState.address = payload.title
    addressInfoState.lat = payload.point.lat
    addressInfoState.lng = payload.point.lng
    addressInfoState.regionName = `${result.addressComponents.province},${result.addressComponents.city}${result.addressComponents.district}`
    addressInfoState.adt = result.content?.address_detail ?? null
    MapSelectDMapRef.value?.setMapCenter(payload.point.lat, payload.point.lng, 11)
    setMarker(payload.point)
  }
</script>

<style></style>
