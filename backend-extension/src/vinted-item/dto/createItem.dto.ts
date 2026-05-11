import { IsArray, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  title: string;

  @IsString()
  price: string;

  @IsString()
  status: string;

  @IsString()
  description: string;

  @IsString()
  brand: string;

  @IsString()
  size: string;

  @IsString()
  color: string;

  @IsArray()
  @IsString({ each: true })
  photos: string[];
}
