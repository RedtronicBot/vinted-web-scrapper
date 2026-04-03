import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { CreateFilterDto } from "./dto/createFilter.dto"

@Injectable()
export class FilterService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateFilterDto) {
    const { search, min_cost, max_cost, brand_id, condition_id } = dto
    return this.prisma.filter.upsert({
      where: {
        search_min_cost_max_cost_brand_id_condition_id: {
          search: search,
          min_cost: Number(min_cost ?? 0),
          max_cost: Number(max_cost ?? 999999),
          brand_id: Number(brand_id ?? 0),
          condition_id: Number(condition_id ?? 0),
        },
      },
      update: {},
      create: {
        search: search,
        min_cost: Number(min_cost ?? 0),
        max_cost: Number(max_cost ?? 999999),
        brand_id: Number(brand_id ?? 0),
        condition_id: Number(condition_id ?? 0),
      },
    })
  }
  findById(id: number) {
    return this.prisma.filter.findUnique({ where: { id } })
  }

  findAll() {
    return this.prisma.filter.findMany()
  }

  findMostLike() {
    return this.prisma.filter.findMany({
      select: {
        id: true,
        search: true,
        min_cost: true,
        max_cost: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        products: {
          take: 50,
          orderBy: { likes: "desc" },
          select: {
            id: true,
            url: true,
            img: true,
            price: true,
            likes: true,
            status: true,
          },
        },
      },
    })
  }
}
