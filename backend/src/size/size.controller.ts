import { Body, Controller, Get, Param, ParseIntPipe, Post } from "@nestjs/common"
import { SizeService } from "./size.service"
import { CreateSizeDto } from "./dto/createSize.dto"

@Controller("size")
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}
  @Get()
  findAll() {
    return this.sizeService.findAll()
  }
  @Get("/:id")
  findByGroup(@Param("id", ParseIntPipe) id: number) {
    return this.sizeService.findByCategory(id)
  }
  @Post()
  create(@Body() dto: CreateSizeDto) {
    return this.sizeService.create(dto)
  }
}
