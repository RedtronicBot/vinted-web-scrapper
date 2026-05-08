import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { CreateFilterDto } from "./dto/createFilter.dto"

@Injectable()
export class FilterService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateFilterDto) {
    const { search, min_cost, max_cost, brand_id, state_id, category_id, color_id, size_id } = dto
    return this.prisma.filter.create({
      data: {
        search,
        min_cost: min_cost ?? 0,
        max_cost: max_cost ?? 999999,
        brand_id,
        category_id,
        colors: {
          createMany: {
            data: color_id?.map((color_id) => ({ color_id })) ?? [],
          },
        },
        states: {
          createMany: {
            data: state_id?.map((state_id) => ({ state_id })) ?? [],
          },
        },
        sizes: {
          createMany: {
            data: size_id?.map((size_id) => ({ size_id })) ?? [],
          },
        },
      },
      include: { colors: true, states: true, sizes: true },
    })
  }
  findById(id: number) {
    return this.prisma.filter.findUnique({ where: { id } })
  }

  findAll() {
    return this.prisma.filter.findMany({
      include: { colors: true, states: true, sizes: true },
    })
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
          orderBy: [{ status: "desc" }, { likes: "desc" }],
          select: {
            id: true,
            url: true,
            status: true,
            img: true,
            price: true,
            likes: true,
            sell_at: true,
            createdAt: true,
            size: true,
            state: true,
            boosted: true,
          },
        },
      },
    })
  }

  delete(id: number) {
    return this.prisma.filter.delete({ where: { id } })
  }
}
