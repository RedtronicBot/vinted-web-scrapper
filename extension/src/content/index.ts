import { handlePrefill } from "./prefill/prefill"
import { initWidget } from "./widget/widget"
import { injectStyles } from "./widget/widget.styles"

injectStyles()
initWidget()

setInterval(() => {
  if (!document.getElementById("vr-widget")) {
    initWidget()
  }
}, 500)

handlePrefill()
