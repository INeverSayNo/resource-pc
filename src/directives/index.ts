import type { App, Directive, DirectiveBinding } from 'vue'
import { ElMessage } from 'element-plus'
import { checkFunPermissionAsync } from '@/utils/funPermissionChecked'

type ClipboardElement = HTMLElement & {
  __clipboardClick?: EventListener
  __clipboardValue?: unknown
}

const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const input = document.createElement('textarea')
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
  ElMessage.success('复制成功')
}

const clipboard: Directive<ClipboardElement> = {
  mounted(el, binding) {
    el.__clipboardValue = binding.value
    const listener: EventListener = () => {
      const value = el.__clipboardValue ?? el.innerText
      void copyText(String(value || ''))
    }
    el.__clipboardClick = listener
    el.classList.add('cu-pointer')
    el.addEventListener('click', listener)
  },
  updated(el, binding) {
    el.__clipboardValue = binding.value
  },
  unmounted(el) {
    if (el.__clipboardClick) el.removeEventListener('click', el.__clipboardClick)
    delete el.__clipboardClick
    delete el.__clipboardValue
  }
}

const auth: Directive<HTMLElement> = {
  async beforeMount(el, binding: DirectiveBinding<boolean>) {
    const permission = Object.keys(binding.modifiers)[0]
    const path = binding.instance?.$route?.path || ''
    const allowed = Boolean(permission && path && (await checkFunPermissionAsync(path, permission)))
    if (allowed) return
    if (binding.value) el.style.display = 'none'
    else {
      el.classList.add('is-disabled')
      el.setAttribute('disabled', 'disabled')
    }
  }
}

export const setupDirectives = (app: App<Element>): void => {
  app.directive('clipboard', clipboard)
  app.directive('clipboard2', clipboard)
  app.directive('auth', auth)
}
