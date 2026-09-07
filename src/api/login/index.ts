import { BaseApi, normalizeApiResult } from '@/request'
import {
  ApplicationId,
  GATEWAY_URL,
  LOGIN_CLIENT_ID,
  LOGIN_CLIENT_SECRET,
  LOGIN_URL,
  USE_CRY_PTO
} from '@/request/config'
import type { ApiResult } from '@/request'
import type { LoginResponse } from '@/types/user'
import type {
  BackendMenuResponse,
  LinkedAccount,
  LoginCredentials,
  OaLoginCredentials
} from './types'

const api = new BaseApi({ baseURL: GATEWAY_URL, crypto: USE_CRY_PTO })
const loginApi = new BaseApi({ baseURL: LOGIN_URL, isJwt: false }, {}, false)

const formConfig = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  }
}

const loginBase = {
  client_id: LOGIN_CLIENT_ID,
  client_secret: LOGIN_CLIENT_SECRET,
  grant_type: 'erp_verify'
}

export const accountLogin = (data: LoginCredentials): Promise<ApiResult<LoginResponse>> =>
  normalizeApiResult(
    loginApi.post<LoginResponse>(
      '/connect/token',
      {
        ...loginBase,
        erp_userName: data.username,
        erp_Password: data.password
      },
      true,
      formConfig
    ),
    '登录请求失败'
  )

export const exchangeErpCookie = (cookie: string): Promise<ApiResult<LoginResponse>> =>
  normalizeApiResult(
    loginApi.post<LoginResponse>(
      '/connect/token',
      { ...loginBase, verify_type: 2, erp_cookie: cookie },
      true,
      formConfig
    ),
    'ERP 登录失败'
  )

export const loginByOa = (data: OaLoginCredentials): Promise<ApiResult<LoginResponse>> =>
  normalizeApiResult(
    loginApi.post<LoginResponse>(
      '/connect/token',
      {
        ...loginBase,
        verify_type: 3,
        erp_userName: data.username,
        erp_Password: data.password
      },
      true,
      formConfig
    ),
    'OA 登录失败'
  )

export const switchLinkedAccount = (
  accountId: string,
  token: string
): Promise<ApiResult<LoginResponse>> =>
  normalizeApiResult(
    loginApi.post<LoginResponse>(
      '/connect/token',
      {
        client_id: LOGIN_CLIENT_ID,
        client_secret: LOGIN_CLIENT_SECRET,
        grant_type: 'link_user',
        verify_type: 'erp',
        link_user_id: accountId,
        access_token: token
      },
      true,
      formConfig
    ),
    '账号切换失败'
  )

export const getUserMenus = (
  accessToken: string,
  applicationId = ApplicationId
): Promise<ApiResult<BackendMenuResponse>> =>
  normalizeApiResult(
    api.get<BackendMenuResponse>(
      '/api/BaseData/Organization/GetApplicationModules',
      { id: applicationId },
      true,
      { headers: { Authorization: `bearer ${accessToken}` } }
    ),
    '菜单加载失败'
  )

export const getLinkedAccounts = (): Promise<ApiResult<LinkedAccount[] | LinkedAccount | string>> =>
  normalizeApiResult(
    api.get<LinkedAccount[] | LinkedAccount | string>(
      '/api/BaseData/User/GetUserAccounts',
      undefined,
      true
    ),
    '关联账号加载失败'
  )

export type { BackendMenuNode, LinkedAccount, LoginCredentials, OaLoginCredentials } from './types'
