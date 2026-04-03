import { IsInt, IsOptional, IsString, Min } from "class-validator"

export class CreateFilterDto {
  @IsString()
  search: string

  @IsOptional()
  @IsInt()
  @Min(0)
  min_cost?: number

  @IsOptional()
  @IsInt()
  @Min(0)
  max_cost?: number

  @IsInt()
  brand_id: number

  @IsInt()
  condition_id: number
}
