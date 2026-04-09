import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common"
import { CategoryService } from "./category.service"

@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // GET /categories/tree  (arbre complet pour pré-chargement)
  @Get("tree")
  getFullTree() {
    return this.categoryService.getFullTree()
  }

  @Post()
  createCategory(@Body() body: { name: string; parent_id: number | null; position: number }) {
    return this.categoryService.createCategory(body)
  }

  @Post("vinted")
  createVintedCategory(@Body() body: { id: number; category_id: number }) {
    return this.categoryService.createVintedCategory(body)
  }
}
