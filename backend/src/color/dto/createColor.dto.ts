import { IsInt, IsString } from "class-validator"

export class CreateColorDto {
  @IsInt()
  id: number
  @IsString()
  name: string
}
