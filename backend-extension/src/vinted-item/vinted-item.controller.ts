// items/items.controller.ts
import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, NotFoundException, UseGuards, Patch } from "@nestjs/common"
import { VintedItemService } from "./vinted-item.service"
import { CreateItemDto } from "./dto/createItem.dto"
import { ApiKeyGuard } from "src/auth/api-key.guard"
import { UpdateStageDto } from "./dto/UpdateStage.dto"

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

  @Get("todo")
  @UseGuards(ApiKeyGuard)
  findTodo() {
    return this.vintedItemService.findTodo()
  }

  @Patch(":id/stage")
  @UseGuards(ApiKeyGuard)
  setStage(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateStageDto) {
    return this.vintedItemService.setStage(id, dto.stage)
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
