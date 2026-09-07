import {
  isUnauthorizedForCurrentSession,
  registerAccessTokenProvider,
  registerUnauthorizedHandler
} from './bridge'
import { useUserStoreWithOut } from '@/store/modules/user'
import { migrateLegacyAuthStorage } from '@/utils/loginPreferences'

export const setupAuth = (): void => {
  migrateLegacyAuthStorage()
  registerAccessTokenProvider(() => useUserStoreWithOut().token)
  registerUnauthorizedHandler(async (requestToken) => {
    const userStore = useUserStoreWithOut()
    if (isUnauthorizedForCurrentSession(requestToken, userStore.token)) {
      await userStore.expireSession()
    }
  })
}
