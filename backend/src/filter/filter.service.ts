import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { CreateFilterDto } from "./dto/createFilter.dto"

@Injectable()
export class FilterService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateFilterDto) {
    const { search, min_cost, max_cost, brand_id, condition_id, category_id } = dto
    const existing = await this.prisma.filter.findFirst({
      where: {
        search,
        min_cost: min_cost ?? 0,
        max_cost: max_cost ?? 999999,
        brand_id,
        condition_id,
        category_id,
      },
    })

    if (existing) return existing

    return this.prisma.filter.create({
      data: {
        search,
        min_cost: min_cost ?? 0,
        max_cost: max_cost ?? 999999,
        brand_id,
        condition_id,
        category_id,
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
        category: {
          select: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        products: {
          where: {
            status: {
              in: ["SOLD", "ACTIVE"],
            },
          },
          take: 50,
          orderBy: [{ status: "desc" }, { likes: "desc" }],
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

  delete(id: number) {
    return this.prisma.filter.delete({ where: { id } })
  }
}
