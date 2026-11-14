export function waitForElement<T extends Element = Element>(selector: string, timeout = 5000): Promise<T> {
	return new Promise((resolve, reject) => {
		const el = document.querySelector<T>(selector)
		if (el) return resolve(el)
		const observer = new MutationObserver(() => {
			const found = document.querySelector<T>(selector)
			if (found) {
				observer.disconnect()
				resolve(found)
			}
		})
		observer.observe(document.body, { childList: true, subtree: true })
		setTimeout(() => {
			observer.disconnect()
			reject("Timeout : élément introuvable")
		}, timeout)
	})
}

export function showToast(text: string, duration = 8000) {
	const el = document.createElement("div")
	el.textContent = text
	el.style.cssText =
		"position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#09b1ba;color:#fff;padding:10px 16px;border-radius:8px;z-index:99999;font-size:14px;"
	document.body.appendChild(el)
	setTimeout(() => el.remove(), duration)
}
