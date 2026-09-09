import { BaseApi } from '@/request'
import { GATEWAY_URL, USE_CRY_PTO } from '@/request/config'

const api = new BaseApi({ baseURL: GATEWAY_URL, crypto: USE_CRY_PTO })

export function QueryByPage  (controller: string, params = {}) {
    return  api.post(`/api/resource/${controller}`, params)
}

type requestMethod = "post" | "get" 
export async function ExportExcel(
    apiMethod: string,
    params = {},
    method?: "POST" | "GET" | "PUT" | "PATCH" | "DELETE",
    builded = true,
    fileName = ""
  ) {
    const localMethod = (method || "POST").toLowerCase() as requestMethod
    const [_err, res] = await api[localMethod](`/api/resource/${apiMethod}`, params)
    if (res) {
      const url = window.URL.createObjectURL(res.data);
      // 生成一个a标签
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    }
  }