import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { CreateColorDto } from "./dto/createColor.dto"

@Injectable()
export class ColorService {
  constructor(private readonly prisma: PrismaService) {}
  getAll() {
    return this.prisma.color.findMany()
  }
  create(data: CreateColorDto) {
    return this.prisma.color.create({ data })
  }
}
