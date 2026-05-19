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
