import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { CreateSizeDto } from "./dto/createSize.dto"

@Injectable()
export class SizeService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() {
    return this.prisma.size.findMany()
  }
  create(data: CreateSizeDto) {
    return this.prisma.size.create({ data })
  }
  findByCategory(categoryId: number) {
    return this.prisma.size.findMany({
      where: { category_id: categoryId },
      orderBy: { name: "asc" },
    })
  }
}
