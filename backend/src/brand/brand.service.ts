import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { CreateBrandDto } from "./dto/createBrand.dto"

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() {
    return this.prisma.brand.findMany()
  }
  create(data: CreateBrandDto) {
    return this.prisma.brand.create({ data })
  }
}
