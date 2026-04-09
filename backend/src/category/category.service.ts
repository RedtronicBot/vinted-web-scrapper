import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { Category } from "src/types"

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // Récupère tout l'arbre en une requête (pour pré-chargement complet)
  async getFullTree() {
    const all = await this.prisma.category.findMany({
      orderBy: { position: "asc" },
      include: {
        vinted: true,
      },
    })
    return this.buildTree(all)
  }

  private buildTree(items: Category[]) {
    const map = new Map()

    // créer les nodes
    items.forEach((i) => {
      map.set(i.id, { ...i, children: [] })
    })

    const tree: Category[] = []

    // relier
    items.forEach((i) => {
      if (i.parent_id === null) {
        tree.push(map.get(i.id))
      } else {
        map.get(i.parent_id)?.children.push(map.get(i.id))
      }
    })

    return tree
  }

  async createCategory(data: { name: string; parent_id: number | null; position: number }) {
    return this.prisma.category.create({ data })
  }

  async createVintedCategory(data: { id: number; category_id: number }) {
    return this.prisma.vintedCategory.create({ data })
  }
}
