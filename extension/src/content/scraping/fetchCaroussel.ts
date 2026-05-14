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
	const photosMap = new Map<number, { src: string; position: number }>()

	Array.from(document.querySelectorAll("figure[class*='item-photo--']")).forEach((figure) => {
		const img = figure.querySelector("img")
		if (!img) return

		const positionClass = Array.from(figure.classList).find((c) => /^item-photo--\d+$/.test(c))
		const position = positionClass ? parseInt(positionClass.split("--")[1]) : 0
		const src = (img as HTMLImageElement).src

		if (src && !photosMap.has(position)) {
			photosMap.set(position, { src, position })
		}
	})

	return Array.from(photosMap.values()).sort((a, b) => a.position - b.position)
}
