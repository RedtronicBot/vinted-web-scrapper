import { IsArray, IsInt, IsOptional, IsString, Min } from "class-validator"

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

  @IsArray()
  @IsInt({ each: true })
  state_id: number[]

  @IsInt()
  category_id: number

  @IsArray()
  @IsInt({ each: true })
  color_id: number[]

  @IsArray()
  @IsInt({ each: true })
  size_id: number[]
}
