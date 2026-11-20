import { IsEnum, IsOptional, IsString } from "class-validator"
import { ItemStage } from "prisma/generated/prisma/enums"

export class UpdateStageDto {
  @IsEnum(ItemStage)
  stage: ItemStage
  @IsOptional()
  @IsString()
  draftId?: string
}
