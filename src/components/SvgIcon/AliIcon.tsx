import { computed, defineComponent, toRefs } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'DAliIcon',
  props: {
    name: {
      type: String as PropType<string>,
      required: true
    },
    width: {
      type: [Number, String] as PropType<number | string>,
      default: 14
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: 14
    },
    className: {
      type: String as PropType<string>,
      default: 'pc-icon'
    },
    color: {
      type: String as PropType<string>
    },
    size: {
      type: [Number, String] as PropType<number | string>
    }
  },
  setup(props, ctx) {
    const { name, width, height, className, color, size } = toRefs(props)

    const iconWidth = computed(()=> size.value || width.value )
    const iconHeight = computed(()=> size.value || height.value )

    return () => (
      <svg
        class={className.value}
        aria-hidden="true"
        width={`${iconWidth.value}px`}
        height={`${iconHeight.value}px`}
        style={`fill: ${color.value}`}
      >
        <use xlinkHref={`#${className.value}-${name.value}`}></use>
      </svg>
    )
  }
})
