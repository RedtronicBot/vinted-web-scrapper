import { IsInt, IsString } from "class-validator"

export class CreateBrandDto {
  @IsInt()
  id: number
  @IsString()
  name: string
}
