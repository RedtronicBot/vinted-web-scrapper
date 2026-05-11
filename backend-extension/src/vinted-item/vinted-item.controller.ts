// items/items.controller.ts
import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { VintedItemService } from './vinted-item.service';
import { CreateItemDto } from './dto/createItem.dto';

@Controller('items')
export class VintedItemController {
  constructor(private readonly vintedItemService: VintedItemService) {}

  @Post()
  create(@Body() dto: CreateItemDto) {
    return this.vintedItemService.create(dto);
  }

  @Get()
  findAll() {
    return this.vintedItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vintedItemService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vintedItemService.remove(+id);
  }
}
