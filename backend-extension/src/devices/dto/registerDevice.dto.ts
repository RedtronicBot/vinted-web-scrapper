import { ApiProperty } from "@nestjs/swagger"
import { IsString, MaxLength, MinLength } from "class-validator"

export class RegisterDeviceDto {
  @ApiProperty({ description: "Token FCM de l'appareil", minLength: 20, maxLength: 512 })
  @IsString()
  @MinLength(20)
  @MaxLength(512)
  token: string
}
