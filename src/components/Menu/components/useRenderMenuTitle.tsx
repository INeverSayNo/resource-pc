import type { RouteMeta } from 'vue-router'
import DAliIcon from "@/components/SvgIcon/AliIcon"
export const useRenderMenuTitle = () => {
  const renderMenuTitle = (meta: RouteMeta) => {
    const { title = '请设置标题', icon } = meta

    return icon ? (
      <>
        <DAliIcon name={meta.icon || ''}></DAliIcon>
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
