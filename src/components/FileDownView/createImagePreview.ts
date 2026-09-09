import { createVNode, render } from 'vue'
import { ElImageViewer } from 'element-plus'
import type { ImageViewerProps } from 'element-plus'

export const createImagePreview = (options: Partial<ImageViewerProps>) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const destroy = () => {
    render(null, container)
    container.remove()
  }

  // 接收关闭事件
  const vnode = createVNode(ElImageViewer, {
    ...options,
    onClose: () => {
      options.onClose?.()
      destroy()
    }
  })

  // 渲染组件
  render(vnode, container)
}
