import { IsInt, IsString } from "class-validator"

export class CreateConditionDto {
  @IsInt()
  id: number
  @IsString()
  name: string
}
