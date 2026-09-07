import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { appConfig } from '@/config/app'

export const useTitle = () => {
  const route = useRoute()

  watch(
    () => route.meta.title,
    (title) => {
      document.title = title ? `${appConfig.title} - ${title}` : appConfig.title
    },
    { immediate: true }
  )
}
