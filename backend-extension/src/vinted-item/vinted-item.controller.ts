// items/items.controller.ts
import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, NotFoundException } from "@nestjs/common"
import { VintedItemService } from "./vinted-item.service"
import { CreateItemDto } from "./dto/createItem.dto"

@Controller("items")
export class VintedItemController {
  constructor(private readonly vintedItemService: VintedItemService) {}

  @Post()
  create(@Body() dto: CreateItemDto) {
    return this.vintedItemService.create(dto)
  }

  @Get()
  findAll() {
    return this.vintedItemService.findAll()
  }

  @Get("due")
  findDueToday() {
    return this.vintedItemService.findDueToday()
  }

  @Get("urls")
  findAllUrls() {
    return this.vintedItemService.findAllUrls()
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const item = await this.vintedItemService.findOne(id)
    if (!item) throw new NotFoundException()
    return item
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.vintedItemService.remove(id)
  }
}
