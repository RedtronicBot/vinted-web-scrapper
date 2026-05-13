import { finishSelection, startSelectionMode } from "../selection/selection"
import { renderStoredItems } from "./widget.render"

type WidgetMode = "idle" | "selection" | "loading"

export function setWidgetMode(mode: WidgetMode) {
	const btn = document.getElementById("vr-widget-btn") as HTMLButtonElement

	if (!btn) return

	btn.dataset.mode = mode

	switch (mode) {
		case "idle":
			btn.textContent = "+ Ajouter un article"
			btn.disabled = false
			btn.style.opacity = "1"
			btn.style.cursor = "pointer"
			btn.style.background = "#09b1ba"
			break

		case "selection":
			btn.textContent = "✓ Terminer la sélection"
			btn.disabled = false
			btn.style.opacity = "1"
			btn.style.cursor = "pointer"
			btn.style.background = "#1a1a1a"
			break

		case "loading":
			btn.textContent = "Enregistrement..."
			btn.disabled = true
			btn.style.opacity = "0.7"
			btn.style.cursor = "wait"
			break
	}
}

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

	setWidgetMode("idle")

	btn.addEventListener("click", async () => {
		const mode = btn.dataset.mode as WidgetMode

		if (mode === "loading") return

		if (mode === "selection") {
			setWidgetMode("loading")

			try {
				await finishSelection()
				await renderStoredItems()
				setWidgetMode("idle")
			} catch (e) {
				console.error(e)
				setWidgetMode("selection")
			}
		} else {
			startSelectionMode()
			setWidgetMode("selection")
		}
	})
}
