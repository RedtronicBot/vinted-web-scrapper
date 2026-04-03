import { Controller, Get } from "@nestjs/common"
import { ProductCheckerService } from "./productchecker.service"

@Controller("productchecker")
export class ProductCheckerController {
  constructor(private readonly productCheckerService: ProductCheckerService) {}
  @Get()
  ManualProductCheck() {
    return this.productCheckerService.handleDailyCheck()
  }
}
