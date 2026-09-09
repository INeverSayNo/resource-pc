import { BaseApi, getDownloadFilename, saveBlob } from '@/request'
import { PATH_URL, USE_CRY_PTO } from '@/request/config'
import type { ApiResult } from '@/request'
import type { defineConfig } from '@dczy/tie-tools'

type Method = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'

const paginationDefaults = {
  limit: 25,
  page: 1,
  start: 0,
  sumfield: '',
  sort: "[{property:'id',direction:'desc'}]",
  totalRowsCount: 0,
  isExport: true,
  isAllPage: true,
  total: 0,
  totalpagecount: 0
}

const unwrap = async <T>(result: ApiResult<T>): Promise<T> => {
  const [error, data] = await result
  if (error) throw error
  return data
}

export default class BaseService {
  readonly baseUrl: string
  private readonly client: BaseApi

  constructor(controller: string, area = 'resource', apiHost = PATH_URL) {
    this.baseUrl = `/api/${area}/${controller}`
    this.client = new BaseApi({ baseURL: apiHost, crypto: USE_CRY_PTO })
  }

  Create<T = any>(params: unknown): Promise<T> {
    return unwrap(this.client.post<T>(`${this.baseUrl}/create`, params, true))
  }

  Update<T = any>(id: string, params: unknown): Promise<T> {
    return unwrap(this.client.put<T>(`${this.baseUrl}/${id}/update`, params, true))
  }

  Delete<T = any>(id: string): Promise<T> {
    return unwrap(this.client.delete<T>(`${this.baseUrl}/${id}/delete`, true))
  }

  DeleteBatchs<T = any>(params: unknown): Promise<T> {
    return unwrap(this.client.post<T>(`${this.baseUrl}/delete-batches`, params, true))
  }

  GetById<T = any>(id: string): Promise<T> {
    return unwrap(this.client.get<T>(`${this.baseUrl}/${id}/get-by-id`, undefined, true))
  }

  GetAll<T = any>(): Promise<T> {
    return unwrap(this.client.get<T>(`${this.baseUrl}/get-all`, undefined, true))
  }

  Query<T = any>(params: unknown): Promise<T> {
    return unwrap(this.client.post<T>(`${this.baseUrl}/query-by-page`, this.buildParams(params), true))
  }

  QuickQuery<T = any>(params: unknown): Promise<T> {
    return unwrap(this.client.post<T>(`${this.baseUrl}/quick-query`, this.buildParams(params), true))
  }

  OpionDefine<T = any>(
    apiMethod: string,
    params: any,
    method: Method = 'POST',
    builded = true,
    disableResponseError = false,
    isParam = false
  ): Promise<T> {
    let url = apiMethod ? `${this.baseUrl}/${apiMethod}` : this.baseUrl
    const config: defineConfig = { disableResponseError }
    const data = builded ? this.buildParams(params) : params

    if (method === 'GET') {
      if (typeof data === 'string' && data) url += data.startsWith('?') ? data : `?${data}`
      return unwrap(this.client.get<T>(url, typeof data === 'object' ? data : undefined, true, config))
    }
    if (method === 'DELETE') return unwrap(this.client.delete<T>(url, true, { ...config, data }))
    if (method === 'PUT') return unwrap(this.client.put<T>(url, data, true, config))
    if (method === 'PATCH') return unwrap(this.client.patch<T>(url, data, true, config))
    return unwrap(this.client.post<T>(url, isParam ? undefined : data, true, isParam ? { ...config, params: data } : config))
  }

  async ExportExcel(
    apiMethod: string,
    params: unknown,
    method: Method = 'POST',
    builded = true,
    fileName = ''
  ): Promise<void> {
    const data = builded ? this.buildParams(params) : params
    const [error, response] = await this.client.requestResponse<Blob>({
      url: `${this.baseUrl}/${apiMethod}`,
      method,
      responseType: 'blob',
      ...(method === 'GET' ? { params: data } : { data })
    })
    if (error || !response) throw error || new Error('文件导出失败')
    saveBlob(response.data, fileName || getDownloadFilename(response))
  }

  DownloadFile(apiMethod: string, fileName = '', isPost = false, param: unknown = {}): Promise<void> {
    return this.ExportExcel(apiMethod, param, isPost ? 'POST' : 'GET', false, fileName)
  }

  buildParamsGet(params: unknown): string {
    if (typeof params === 'string') return params.trim().replace(/^\?/, '')
    return new URLSearchParams(params as Record<string, string>).toString()
  }

  buildParams(params: any): Record<string, any> {
    if (!params) return { ...paginationDefaults }
    if (params.pageSize) {
      return {
        ...params,
        limit: params.pageSize,
        KeyWords: params.KeyWords || params.key || params.keywords
      }
    }
    return {
      ...paginationDefaults,
      ...params,
      KeyWords: params.key || params.keyword
    }
  }
}
