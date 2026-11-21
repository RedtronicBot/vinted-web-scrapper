import { waitForElement } from "../utils/dom"

export async function fetchPhotosFromCarousel(): Promise<{ src: string; position: number }[]> {
	const fifthFigure = document.querySelector<HTMLElement>("figure[class*='item-photo--5'] button")

	if (fifthFigure) {
		fifthFigure.click()

		try {
			await waitForElement('[data-testid="image-carousel"]', 5000)

			const images = Array.from(document.querySelectorAll('[data-testid^="image-carousel-image"]'))

			const photos = images.map((img, index) => ({
				src: (img as HTMLImageElement).src,
				position: index + 1,
			}))

			const closeBtn = document.querySelector<HTMLElement>('[data-testid="image-carousel-button-close"]')
			closeBtn?.click()

			return photos
		} catch {}
	}

	// Stratégie 2 : fallback — récupère les images des figures directement
	// Stratégie 2 : fallback — récupère les images des figures directement
	const photos: { src: string; position: number }[] = []

	document.querySelectorAll<HTMLElement>("figure[class*='item-photo--']").forEach((figure) => {
		const img = figure.querySelector("img")
		const position = Number(figure.className.match(/item-photo--(\d+)/)?.[1])
		if (!img?.src || !position) return
		photos.push({ src: img.src, position })
	})

	// dédoublonne par position (au cas où) et trie
	return [...new Map(photos.map((p) => [p.position, p])).values()].sort((a, b) => a.position - b.position)
}
