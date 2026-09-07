export interface LoginResponse {
  access_token: string
  expires_in?: number
  token_type?: string
  refresh_token?: string
  scope?: string
}

export interface UserInfo extends Record<string, unknown> {
  isIdentify?: boolean
  headImg?: string
  aud?: string
  auth_time?: number
  client_id?: string
  email?: string
  erp_area_name?: string
  erp_area_id?: string
  email_verified?: boolean
  erp_is_manager?: boolean
  erp_org_code?: string
  erp_org_id?: string
  erp_org_name?: string
  erp_org_relation_code?: string
  erp_org_relation_id?: string
  erp_userid?: string
  erp_username?: string
  erp_useroaid?: string
  exp?: number
  family_name?: string
  given_name?: string
  iat?: number
  idp?: string
  iss?: string
  name?: string
  nbf?: number
  phone_number?: string
  phone_number_verified?: boolean
  preferred_username?: string
  role?: string
  sub?: string
  user_type?: string
  appids?: string[]
}
