import { Injectable } from "@nestjs/common"
import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import { PrismaService } from "prisma/prisma.service"
import { CreateItemDto } from "./dto/createItem.dto"
import { join } from "path"

@Injectable()
export class VintedItemService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateItemDto) {
    const photos = await this.downloadPhotos(dto.photos)
    return this.prisma.vintedItem.create({
      data: {
        ...dto,
        price: parseFloat(dto.price),
        reuploadAt: dto.reuploadAt ? new Date(dto.reuploadAt) : null,
        photos: {
          create: photos.map(({ filename, position }) => ({
            filename,
            position,
          })),
        },
      },
      include: { photos: true },
    })
  }

  findAll() {
    return this.prisma.vintedItem.findMany({
      orderBy: { createdAt: "desc" },
      include: { photos: true },
    })
  }

  findDueToday() {
    return this.prisma.vintedItem.findMany({
      where: {
        reuploadAt: {
          lte: new Date(),
        },
      },
      orderBy: { reuploadAt: "asc" },
      include: { photos: true },
    })
  }

  async findAllUrls(): Promise<string[]> {
    const items = await this.prisma.vintedItem.findMany({
      select: { sourceUrl: true },
    })
    return items.map((i) => i.sourceUrl).filter((url): url is string => url !== null)
  }

  findOne(id: number) {
    return this.prisma.vintedItem.findUnique({
      where: { id },
      include: { photos: true },
    })
  }

  async remove(id: number) {
    const item = await this.findOne(id)
    if (!item) return
    // Supprime les fichiers disque
    for (const photo of item.photos) {
      await fs.unlink(join(process.cwd(), "uploads", photo.filename)).catch(() => {})
    }
    // Le cascade s'occupe de supprimer les Photo en base
    return this.prisma.vintedItem.delete({ where: { id } })
  }
  private async downloadPhotos(photos: { src: string; position: number }[]): Promise<{ filename: string; position: number }[]> {
    const uploadDir = join(process.cwd(), "uploads")
    const results: { filename: string; position: number }[] = []
    for (const { src, position } of photos) {
      try {
        const res = await fetch(src)
        const buffer = Buffer.from(await res.arrayBuffer())
        const ext = src.split(".").pop()?.split("?")[0] ?? "jpg"
        const filename = `${randomUUID()}.${ext}`
        await fs.writeFile(join(uploadDir, filename), buffer)
        results.push({ filename, position })
      } catch {
        // on skippe
      }
    }
    return results
  }
}
