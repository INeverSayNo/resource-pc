<template>
  <el-dialog
    ref="dialogRef"
    :fullscreen="fullscreen"
    v-bind="getBindValue"
    destroy-on-close
    lock-scroll
    :close-on-press-escape="false"
    :custom-class="`${customClass} ${!!slots.footer ? 'is-footer' : ''}`"
    :close-on-click-modal="false"
    top="10vh"
    :modal-class="customModelClass"
    @opened="handleOpened"
  >
    <template #title>
      <slot name="title">
        {{ title }}
      </slot>
      <DAliIcon
        v-if="showFullscreen"
        :name="fullscreen ? 'exit-fullscreen' : 'fullscreen'"
        class-name="dialog__icon"
        @click="toggleFull"
      />
    </template>

    <!-- 弹窗内容 -->
    <el-scrollbar
      :class="
        fullscreen && slots.footer
          ? 'com-dialog__content--footer'
          : fullscreen && !slots.footer
            ? 'com-dialog__content--fullscreen'
            : 'com-dialog__content'
      "
    >
      <div class="content__wrap">
        <slot />
      </div>
    </el-scrollbar>

    <template v-if="slots.footer" #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>

<script lang="ts">
  import { defineComponent, ref, computed, PropType, nextTick, unref, watch } from 'vue'
  import SvgIcon from '@/components/SvgIcon/index.vue'
  export default defineComponent({
    name: 'ComDialog',
    components: {
      SvgIcon
    },
    props: {
      customClass: { type: String, default: () => '' },
      customModelClass: { type: String, default: () => '' },
      title: {
        type: String as PropType<string>,
        default: ''
      },
      // 是否显示全屏按钮
      showFullscreen: {
        type: Boolean as PropType<boolean>,
        default: false
      },
      // 是否可以拖拽
      draggable: {
        type: Boolean as PropType<boolean>,
        default: true
      },
      defaultFullscreen: {
        type: Boolean as PropType<boolean>,
        default: () => false
      },
      modelValue: {
        type: Boolean,
        default: () => false
      }
    },
    emits: ['fullscreen', 'opened', 'update:modelValue'],
    setup(props, { slots, attrs, emit }) {
      const dialogRef = ref<HTMLElement | null>(null)

      const fullscreen = ref<boolean>(props.defaultFullscreen)

      watch(
        () => props.defaultFullscreen,
        (val) => {
          fullscreen.value = val
        }
      )

      const getBindValue = computed((): any => {
        const delArr: string[] = ['showFullscreen', 'draggable', 'defaultFullscreen']
        const obj: Record<string, unknown> = { ...attrs, ...props }
        for (const key in obj) {
          if (delArr.indexOf(key) !== -1) {
            delete obj[key]
          }
        }
        return obj
      })

      function toggleFull(): void {
        fullscreen.value = !fullscreen.value
        // 全屏的时候需要重新定义left top
        const dragDom = unref(dialogRef as any).$refs.dialogRef as HTMLElement
        nextTick(() => {
          emit('fullscreen', fullscreen.value, dragDom)
          if (fullscreen.value && props.draggable) {
            // const dragDom = unref(dialogRef as any).$refs.dialogRef;
            dragDom.style.cssText += `;left:0px;top:0px;`
          }
        })
      }

      function initDraggable() {
        nextTick(() => {
          try {
            const dragDom = unref(dialogRef as any).$refs.dialogRef as HTMLElement
            if (dragDom) {
              const dialogHeaderEl = dragDom?.querySelector('.el-dialog__header') as HTMLElement
              dragDom.style.cssText += ';top:0px;'
              dialogHeaderEl.style.cssText += ';cursor:move;user-select:none;'
              dialogHeaderEl.onmousedown = (e: MouseEvent) => {
                const disX = e.clientX - (dialogHeaderEl?.offsetLeft || 0)
                const disY = e.clientY - (dialogHeaderEl?.offsetTop || 0)

                const dragDomWidth = dragDom?.offsetWidth || 0
                const dragDomHeight = dragDom?.offsetHeight || 0

                const screenWidth = document.body.clientWidth
                const screenHeight = document.body.clientHeight

                const minDragDomLeft = dragDom?.offsetLeft || 0
                const maxDragDomLeft = screenWidth - (dragDom?.offsetLeft || 0) - dragDomWidth

                const minDragDomTop = dragDom?.offsetTop || 0
                const maxDragDomTop = screenHeight - (dragDom?.offsetTop || 0) - dragDomHeight

                const styleLeftStr = getComputedStyle(dragDom)?.left || 0
                const styleTopStr = getComputedStyle(dragDom)?.top || 0
                if (!styleLeftStr || !styleTopStr) return
                let styleLeft: number
                let styleTop: number

                // Format may be "##%" or "##px"
                if (styleLeftStr.includes('%')) {
                  styleLeft = +document.body.clientWidth * (+styleLeftStr.replace(/%/g, '') / 100)
                  styleTop = +document.body.clientHeight * (+styleTopStr.replace(/%/g, '') / 100)
                } else {
                  styleLeft = +styleLeftStr.replace(/px/g, '')
                  styleTop = +styleTopStr.replace(/px/g, '')
                }

                document.onmousemove = (e: MouseEvent) => {
                  let left = e.clientX - disX
                  let top = e.clientY - disY

                  // Handle edge cases
                  if (-left > minDragDomLeft) {
                    left = -minDragDomLeft
                  } else if (left > maxDragDomLeft) {
                    left = maxDragDomLeft
                  }
                  if (-top > minDragDomTop) {
                    top = -minDragDomTop
                  } else if (top > maxDragDomTop) {
                    top = maxDragDomTop
                  }
                  const showTop = top + styleTop < -(disY - 5) ? -(disY - 5) : top + styleTop
                  // Move current element
                  dragDom.style.cssText += `;left:${left + styleLeft}px;top:${showTop}px;`
                }

                document.onmouseup = () => {
                  document.onmousemove = null
                  document.onmouseup = null
                }
              }
            }
          } catch (error) {
            //
            console.log(error)
          }
        })
      }

      function handleOpened() {
        if (props.draggable) {
          initDraggable()
        }
        emit('opened')
      }
      return {
        dialogRef,
        fullscreen,
        getBindValue,
        slots,
        toggleFull,
        initDraggable,
        handleOpened
      }
    }
  })
</script>

<style lang="less" scoped>
  .dialog__icon {
    position: absolute;
    top: 22px;
    right: 45px;
    color: #909399;
    font-size: 12px;
    color: #909399;
    cursor: pointer;
    transition: color 0.2s;
    &:hover {
      color: #409eff;
    }
  }

  .com-dialog__content {
    .content__wrap {
      padding-right: 10px;
    }
    :deep(.el-scrollbar__wrap) {
      max-height: 600px; // 最大高度
      overflow-x: hidden; // 隐藏横向滚动栏
    }
  }
  .com-dialog__content--fullscreen {
    :deep(.el-scrollbar__wrap) {
      height: calc(~'100vh - 46px - 60px'); // 最大高度
    }
  }
  .com-dialog__content--footer {
    :deep(.el-scrollbar__wrap) {
      max-height: calc(~'100vh - 46px - 60px - 66px'); // 最大高度
    }
  }
</style>
