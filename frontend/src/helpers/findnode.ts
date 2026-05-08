import type { Category } from "../types"

export function findNode(tree: Category[], id: number): Category | null {
	for (const node of tree) {
		if (node.id === id) return node
		const found = findNode(node.children, id)
		if (found) return found
	}
	return null
}
