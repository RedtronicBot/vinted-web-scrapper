import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsArray, IsOptional, IsString } from "class-validator"

export class CreateItemDto {
  @ApiProperty({ example: "Veste en jean" })
  @IsString()
  title: string

  @ApiProperty({ description: "Prix sous forme de texte", example: "12.50" })
  @IsString()
  price: string

  @ApiProperty({ description: "État de l'article", example: "Très bon état" })
  @IsString()
  status: string

  @ApiProperty()
  @IsString()
  description: string

  @ApiProperty({ example: "Levi's" })
  @IsString()
  brand: string

  @ApiProperty({ example: "M" })
  @IsString()
  size: string

  @ApiProperty({ example: "Bleu" })
  @IsString()
  color: string

  @ApiProperty({ type: () => [PhotoDto], description: "Photos à télécharger depuis leur URL" })
  @IsArray()
  photos: PhotoDto[]

  @ApiProperty({ type: [String], example: ["Femmes", "Vêtements", "Vestes"] })
  @IsArray()
  @IsString({ each: true })
  category: string[]

  @ApiPropertyOptional({ description: "Date ISO de republication", example: "2026-12-01T10:00:00.000Z" })
  @IsOptional()
  @IsString()
  reuploadAt?: string
}

export class PhotoDto {
  @ApiProperty({ description: "URL de la photo source" })
  src: string

  @ApiProperty({ description: "Ordre de la photo", example: 0 })
  position: number
}
