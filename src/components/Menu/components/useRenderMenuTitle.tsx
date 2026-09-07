import type { RouteMeta } from 'vue-router'
import SvgIcon from "@/components/SvgIcon/index.vue"
export const useRenderMenuTitle = () => {
  const renderMenuTitle = (meta: RouteMeta) => {
    const { title = '请设置标题', icon } = meta

    return icon ? (
      <>
        <SvgIcon icon={meta.icon}></SvgIcon>
        <span class="v-menu__title truncate">{title as string}</span>
      </>
    ) : (
      <span class="v-menu__title truncate">{title as string}</span>
    )
  }

  return {
    renderMenuTitle
  }
}
