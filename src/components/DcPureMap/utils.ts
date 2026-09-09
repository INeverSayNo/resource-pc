// 定义一些常量
const x_PI = (Number("3.14159265358979324") * 3000.0) / 180.0
const PI = Number("3.1415926535897932384626")
const a = 6378245.0
const ee = Number("0.00669342162296594323")

type StringOrNum = string | number

/**
 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
 * 即 百度 转 谷歌、高德
 */
function bd09togcj02(bd_lon: StringOrNum, bd_lat: StringOrNum) {
  const x_pi = (Number("3.14159265358979324") * 3000.0) / 180.0
  const x = +bd_lon - 0.0065
  const y = +bd_lat - 0.006
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi)
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi)
  const gg_lng = z * Math.cos(theta)
  const gg_lat = z * Math.sin(theta)
  return [gg_lng, gg_lat]
}
/**
 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
 * 即谷歌、高德 转 百度
 */
function gcj02tobd09(lng: StringOrNum, lat: StringOrNum) {
  const z = Math.sqrt(+lng * +lng + +lat * +lat) + 0.00002 * Math.sin(+lat * x_PI)
  const theta = Math.atan2(+lat, +lng) + 0.000003 * Math.cos(+lng * x_PI)
  const bd_lng = z * Math.cos(theta) + 0.0065
  const bd_lat = z * Math.sin(theta) + 0.006
  return [bd_lng, bd_lat]
}
/**
 * WGS84转GCj02
 */
function wgs84togcj02(lng: StringOrNum, lat: StringOrNum) {
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  } else {
    let dlat = transformlat(+lng - 105.0, +lat - 35.0)
    let dlng = transformlng(+lng - 105.0, +lat - 35.0)
    const radlat = (+lat / 180.0) * PI
    let magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    const sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
    dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
    const mglat = +lat + dlat
    const mglng = +lng + dlng
    return [mglng, mglat]
  }
}
/**
 * GCJ02 转换为 WGS84
 */
function gcj02towgs84(lng: StringOrNum, lat: StringOrNum): number[] {
  if (out_of_china(lng, lat)) {
    return [+lng, +lat]
  } else {
    let dlat = transformlat(+lng - 105.0, +lat - 35.0)
    let dlng = transformlng(+lng - 105.0, +lat - 35.0)
    const radlat = (+lat / 180.0) * PI
    let magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    const sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
    dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
    const mglat = +lat + dlat
    const mglng = +lng + dlng
    return [+lng * 2 - mglng, +lat * 2 - mglat]
  }
}
function transformlat(lng: StringOrNum, lat: StringOrNum) {
  let ret =
    -100.0 +
    2.0 * +lng +
    3.0 * +lat +
    0.2 * +lat * +lat +
    0.1 * +lng * +lat +
    0.2 * Math.sqrt(Math.abs(+lng))
  ret += ((20.0 * Math.sin(6.0 * +lng * PI) + 20.0 * Math.sin(2.0 * +lng * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(+lat * PI) + 40.0 * Math.sin((+lat / 3.0) * PI)) * 2.0) / 3.0
  ret += ((160.0 * Math.sin((+lat / 12.0) * PI) + 320 * Math.sin((+lat * PI) / 30.0)) * 2.0) / 3.0
  return ret
}
function transformlng(lng: StringOrNum, lat: StringOrNum) {
  let ret =
    300.0 +
    +lng +
    2.0 * +lat +
    0.1 * +lng * +lng +
    0.1 * +lng * +lat +
    0.1 * Math.sqrt(Math.abs(+lng))
  ret += ((20.0 * Math.sin(6.0 * +lng * PI) + 20.0 * Math.sin(2.0 * +lng * PI)) * 2.0) / 3.0
  ret += ((20.0 * Math.sin(+lng * PI) + 40.0 * Math.sin((+lng / 3.0) * PI)) * 2.0) / 3.0
  ret += ((150.0 * Math.sin((+lng / 12.0) * PI) + 300.0 * Math.sin((+lng / 30.0) * PI)) * 2.0) / 3.0
  return ret
}
/**
 * 判断是否在国内，不在国内则不做偏移
 */
function out_of_china(lng: StringOrNum, lat: StringOrNum) {
  return +lng < 72.004 || +lng > 137.8347 || +lat < 0.8293 || +lat > 55.8271 || false
}

function bd09towgs84(lng: StringOrNum, lat: StringOrNum) {
  const gcj02 = bd09togcj02(lng, lat)
  return gcj02towgs84(gcj02[0], gcj02[1])
}

function wgs84tobd09(lng: StringOrNum, lat: StringOrNum) {
  const gcj02 = wgs84togcj02(lng, lat)
  return gcj02tobd09(gcj02[0], gcj02[1])
}

export { bd09togcj02, gcj02towgs84, wgs84togcj02, gcj02tobd09, bd09towgs84, wgs84tobd09 }
