import { IsInt, IsString } from "class-validator"

export class CreateSizeDto {
  @IsInt()
  id: number
  @IsString()
  name: string
}
