export function extractCategory(root: ParentNode): string[] {
	const anchors = Array.from(
		root.querySelectorAll<HTMLAnchorElement>('[data-testid="breadcrumb"] a, a[data-testid="breadcrumb"], [class*="breadcrumbs__item"] a'),
	)

	const names = anchors
		.filter((a) => {
			const href = a.getAttribute("href") ?? ""
			// Le dernier lien du fil d'Ariane est "marque + catégorie" (/brand/), pas une catégorie
			return href.includes("/catalog/") && !href.includes("/brand/")
		})
		.map((a) => (a.textContent ?? "").trim())
		.filter(Boolean)

	return names.filter((name, i) => name !== names[i - 1])
}

export function fetchCategoryFromPage(): string[] {
	return extractCategory(document)
}
