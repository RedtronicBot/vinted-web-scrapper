import { Body, Controller, Get, Post } from "@nestjs/common"
import { ColorService } from "./color.service"
import { CreateColorDto } from "./dto/createColor.dto"

@Controller("color")
export class ColorController {
  constructor(private readonly colorService: ColorService) {}
  @Get()
  getAll() {
    return this.colorService.getAll()
  }
  @Post()
  create(@Body() dto: CreateColorDto) {
    return this.colorService.create(dto)
  }
}
