import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsString } from "class-validator"
import { ItemStage } from "prisma/generated/prisma/enums"

export class UpdateStageDto {
  @ApiProperty({ enum: ItemStage, description: "Nouvelle étape de l'article" })
  @IsEnum(ItemStage)
  stage: ItemStage

  @ApiPropertyOptional({ description: "Id du brouillon Vinted (utile pour passer en DRAFT)" })
  @IsOptional()
  @IsString()
  draftId?: string
}
