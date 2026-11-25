// items/items.controller.ts
import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, NotFoundException, UseGuards, Patch } from "@nestjs/common"
import { ApiNotFoundResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"
import { VintedItemService } from "./vinted-item.service"
import { CreateItemDto } from "./dto/createItem.dto"
import { ApiKeyGuard } from "src/auth/api-key.guard"
import { UpdateStageDto } from "./dto/UpdateStage.dto"

@ApiTags("items")
@Controller("items")
export class VintedItemController {
  constructor(private readonly vintedItemService: VintedItemService) {}

  @Post()
  @ApiOperation({ summary: "Crée un article et télécharge ses photos" })
  create(@Body() dto: CreateItemDto) {
    return this.vintedItemService.create(dto)
  }

  @Get()
  @ApiOperation({ summary: "Liste tous les articles (du plus récent au plus ancien)" })
  findAll() {
    return this.vintedItemService.findAll()
  }

  @Get("due")
  @ApiOperation({ summary: "Articles dont la date de republication est passée" })
  findDueToday() {
    return this.vintedItemService.findDueToday()
  }

  @Get("urls")
  @ApiOperation({ summary: "URLs sources de tous les articles déjà en base" })
  findAllUrls() {
    return this.vintedItemService.findAllUrls()
  }

  @Patch(":id/stage")
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("api-key")
  @ApiOperation({ summary: "Change l'étape d'un article (et remet notifiedAt à null)" })
  @ApiUnauthorizedResponse({ description: "Clé API absente ou invalide" })
  setStage(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateStageDto) {
    return this.vintedItemService.setStage(id, dto.stage, dto.draftId)
  }

  @Get(":id")
  @ApiOperation({ summary: "Détail d'un article avec ses photos" })
  @ApiNotFoundResponse({ description: "Article introuvable" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const item = await this.vintedItemService.findOne(id)
    if (!item) throw new NotFoundException()
    return item
  }

  @Delete(":id")
  @ApiOperation({ summary: "Supprime un article et ses photos sur disque" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.vintedItemService.remove(id)
  }
}
