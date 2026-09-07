<script lang="ts" setup>
  import { useUserStore } from '@/store/modules/user'
  import { storeToRefs } from 'pinia'
  import { onActivated, onDeactivated, onMounted, reactive, watch } from 'vue'
  import { useRouter } from 'vue-router'

  const env = import.meta.env.VITE_ENV_TYPE || 'dev'
  const urlMap = new Map([
    ['dev', 'http://localhost:8005'],
    ['test', 'https://wechatapp-test.daochen.com/mobile-platform/out-platform-single-map'],
    ['pro', 'http://localhost:8005']
  ])

  const router = useRouter()

  const userStore = useUserStore()
  const { token } = storeToRefs(userStore)

  const iframeState = reactive({
    url: '',
    isLoading: true,
    showIframe: false
  })

  const initUrl = () => {
    const fullUrl = new URL(urlMap.get(env) || urlMap.get('dev')!)
    fullUrl.searchParams.append('token', token.value)
    iframeState.url = fullUrl.href
  }

  watch(token, initUrl)

  const receiveMsg = () => {
    window.addEventListener('message', (event) => {
      if (event.data['type']) {
        switch (event.data['type']) {
          case '品名价号':
            router.push({
              path: '/resource/resource-diytable',
              query: {
                id:
                  env === 'pro'
                    ? '3a00a635-0654-0b7e-217f-95dd0d105aba'
                    : '3a00a5b4-6fd1-7f6b-b58b-535ec4039531',
                title: '品名价号',
                isDahsboard: 'true',
                typeName: '铁路相关',
                GoodsName: event.data.data.goodsName
              }
            })
            break
          case '铁路优价':
          case '铁路查价':
            event.data.data.url &&
              router.push({
                path: event.data.data.url,
                query: {
                  startStation: event.data.data.startStation,
                  endStation: event.data.data.endStation,
                  goodsName: event.data.data.goodsName,
                  goodsCode: event.data.data.goodsCode,
                  goodsType: event.data.data.goodsType
                }
              })
            break
          case '优价政策':
            router.push({
              path: '/resource-app/good-price-policy',
              query: {
                xfkey: event.data.data.xfKey
              }
            })
            break
          case '船舶资源':
            event.data.data.url &&
              router.push({
                path: event.data.data.url
              })
            break
          case '优势通道':
            event.data.data.url &&
              router.push({
                path: event.data.data.url
              })
            break
          case 'hs编码':
            window.open(
              event.data.data.url +
                (event.data.data.url.indexOf('?') > -1 ? '&' : '?') +
                'token=' +
                token.value
            )
            break
          case '铁路站点':
            router.push({
              path: '/resource-app/station-dt',
              query: {
                id: event.data.data.id,
                name: event.data.data.name
              }
            })
            break
          case '水运港口':
            router.push({
              path: '/resource-app/waterway-port-dt',
              query: {
                id: event.data.data.id,
                name: event.data.data.name
              }
            })
            break
          case '物流中心':
            router.push({
              path: '/resource-app/logistic-center-detail',
              query: {
                centerId: event.data.data.id,
                centerName: event.data.data.name
              }
            })
            break
          case '停限装通知':
            router.push({
              path: '/resource-app/stop-loading',
              query: {
                stationName: event.data.data.stationName
              }
            })
            break
          case '专用线':
            router.push({
              path: '/resource-app/private-line',
              query: {
                privateName: event.data.data.privateName
              }
            })
            break
          default:
            break
        }
      }
    })
  }

  onMounted(() => {
    initUrl()
    receiveMsg()
    closeLoading()
  })

  onActivated(() => {
    iframeState.showIframe = true
  })
  onDeactivated(() => {
    iframeState.showIframe = false
  })

  const closeLoading = () => {
    iframeState.isLoading = true
    setTimeout(() => {
      iframeState.isLoading = false
      iframeState.showIframe = true
    }, 1500)
  }
</script>
<template>
  <div class="logistic-map-wrap h-full w-full">
    <div
      v-if="iframeState.isLoading"
      ref="loadingEl"
      v-loading="iframeState.isLoading"
      class="loading-wrap"
    ></div>
    <iframe
      v-show="iframeState.showIframe"
      id="iframe"
      :src="iframeState.url"
      frameborder="0"
      :marginwidth="0"
      :marginheight="0"
      hspace="0"
      vspace="0"
      allow="
        microphone;
        camera;
        geolocation;
        accelerometer;
        gyroscope;
        clipboard-write;
        clipboard-read;
      "
      style="width: 100%; height: 100%"
      class="thin-line-scroll resoure-mobile-iframe"
    ></iframe>
  </div>
</template>
<style lang="less" scoped>
  .logistic-map-wrap {
    height: 100%;
    // position: relative;
  }
  .loading-wrap {
    position: absolute;
    left: 0;
    right: 0;
    height: 100%;
    overflow: hidden;
  }
  .resoure-mobile-iframe {
    position: absolute;
    top: 0;
  }
</style>
