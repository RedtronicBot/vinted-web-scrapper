export function fillReactInput(selector: string, value: string) {
  const el = document.querySelector<HTMLInputElement>(selector)
  if (!el) return

  el.focus()
  el.value = ""

  for (const char of value) {
    el.value += char
    el.dispatchEvent(new Event("input", { bubbles: true }))
  }

  el.dispatchEvent(new Event("change", { bubbles: true }))
}

export function fillReactTextarea(selector: string, value: string) {
  const el = document.querySelector<HTMLTextAreaElement>(selector)
  if (!el) return
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set
  setter?.call(el, value)
  el.dispatchEvent(new Event("input", { bubbles: true }))
}
