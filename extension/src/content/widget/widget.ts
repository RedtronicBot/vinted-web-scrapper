import { finishSelection, startSelectionMode } from "../selection/selection"
import { renderStoredItems } from "./widget.render"

export function initWidget() {
  const widget = document.createElement("div")
  widget.id = "vr-widget"

  widget.innerHTML = `
    <span id="vr-widget-label">Vinted Reupload</span>
    <div id="vr-list"></div>
    <button id="vr-widget-btn">+ Ajouter un article</button>
  `

  document.body.appendChild(widget)

  renderStoredItems()

  const btn = document.getElementById("vr-widget-btn")!
  btn.addEventListener("click", () => {
    if (btn.dataset.mode === "selection") {
      finishSelection()
      btn.dataset.mode = "idle"
    } else {
      startSelectionMode()
      btn.dataset.mode = "selection"
    }
  })
}
