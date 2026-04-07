import { Controller, Get, Post } from "@nestjs/common"
import { ProductCheckerService } from "./productchecker.service"

@Controller("products")
export class ProductCheckerController {
  constructor(private readonly productCheckerService: ProductCheckerService) {}
  @Post("check")
  async triggerCheck() {
    return this.productCheckerService.triggerManualCheck()
  }

  @Get("check/status")
  async getStatus() {
    return this.productCheckerService.getStatus()
  }
}
