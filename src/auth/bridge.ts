type AccessTokenProvider = () => string
type UnauthorizedHandler = (requestToken: string) => void | Promise<void>

let accessTokenProvider: AccessTokenProvider = () => ''
let unauthorizedHandler: UnauthorizedHandler = () => undefined

export const registerAccessTokenProvider = (provider: AccessTokenProvider): void => {
  accessTokenProvider = provider
}

export const registerUnauthorizedHandler = (handler: UnauthorizedHandler): void => {
  unauthorizedHandler = handler
}

export const getAccessToken = (): string => accessTokenProvider()

export const isUnauthorizedForCurrentSession = (
  requestToken: string,
  currentToken: string
): boolean => Boolean(requestToken && requestToken === currentToken)

export const notifyUnauthorized = async (requestToken: string): Promise<void> => {
  await unauthorizedHandler(requestToken)
}
