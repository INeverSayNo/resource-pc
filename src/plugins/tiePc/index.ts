import { App } from 'vue'
import TiePCUI from '@dczy/tie-pc'
import { CRYPT_TYPE, GATEWAY_URL, USE_CRY_PTO } from '@/request/config'

export default function setupDczyTiePC(app: App) {
  app.use(TiePCUI, {
    request: {
      base_url: GATEWAY_URL,
    //   tokenName: 'JsToken',
      useCrypto: USE_CRY_PTO,
      cryptoType: CRYPT_TYPE
    },
    map: {
      baiduAk: 'QfsfdSaTbBV1RneMR2h0awHUoAQv0vbI',
      geoserverWmsUrl: 'https://gateway.dczhiyun.com/geo/geoserver/osm/wms',
      mapStyleId: '21f946c5cc0b3dc64ba1af3378c32c3a',
      locationIconUrl: 'https://gateway.dczhiyun.com/api/abp/minio/wechat/icon/compass1.png',
      
    }
  })
}
