import { IsInt, IsString } from "class-validator"

export class CreateStateDto {
  @IsInt()
  id: number
  @IsString()
  name: string
}
