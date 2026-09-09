import { createVNode, render } from 'vue'
import ImagePreview from './imagePreview.vue'
// import { HostStoreState } from '../store/useHostStore'

interface FilePreviewOptions {
  show?: boolean
  fileUri: string
}

interface ImagePreviewOptions {
  show?: boolean
  initIdx?: number
  fileList: Partial<Record<'path' | 'url', string> & { [key: string]: any }>[]
}

let instance: any = null

export function createImagePreview(options: ImagePreviewOptions) {
  // @ts-ignore
  // eslint-disable-next-line prefer-const
  let { initIdx = 0, fileList = [], show = true } = options
  const propsData: Partial<ImagePreviewOptions> = {}
  const container = document.createElement('div')
  propsData.show = show
  propsData.fileList = fileList
  propsData.initIdx = initIdx
  propsData['onUpdate:show'] = (v) => {
    if (!v) {
      render(null, container) // 销毁组件
      document.body.removeChild(container) // 移除容器
    }
  }
  instance = createVNode(ImagePreview, propsData)
  render(instance, container)
  document.body.appendChild(container)
}
