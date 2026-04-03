import { Body, Controller, Get, Post } from "@nestjs/common"
import { BrandService } from "./brand.service"
import { CreateBrandDto } from "./dto/createBrand.dto"

@Controller("brand")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  @Get()
  findAll() {
    return this.brandService.findAll()
  }
  @Post()
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto)
  }
}
