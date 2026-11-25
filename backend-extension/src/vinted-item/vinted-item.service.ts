import { Injectable, Logger } from "@nestjs/common"
import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import { PrismaService } from "prisma/prisma.service"
import { CreateItemDto } from "./dto/createItem.dto"
import { join } from "path"
import { ItemStage } from "prisma/generated/prisma/client"

@Injectable()
export class VintedItemService {
  private readonly logger = new Logger(VintedItemService.name)

  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateItemDto) {
    const photos = await this.downloadPhotos(dto.photos)
    const item = await this.prisma.vintedItem.create({
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
    this.logger.log(
      `Article ${item.id} créé (${dto.title}), ${photos.length}/${dto.photos.length} photo(s), reuploadAt=${dto.reuploadAt ?? "aucune"}`,
    )
    return item
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
    if (!item) {
      this.logger.warn(`Suppression ignorée, article ${id} introuvable`)
      return
    }
    // Supprime les fichiers disque
    for (const photo of item.photos) {
      await fs
        .unlink(join(process.cwd(), "uploads", photo.filename))
        .catch((e) => this.logger.warn(`Fichier ${photo.filename} non supprimé : ${e.message}`))
    }
    // Le cascade s'occupe de supprimer les Photo en base
    const deleted = await this.prisma.vintedItem.delete({ where: { id } })
    this.logger.log(`Article ${id} supprimé (${item.photos.length} photo(s))`)
    return deleted
  }
  private async downloadPhotos(photos: { src: string; position: number }[]): Promise<{ filename: string; position: number }[]> {
    const uploadDir = join(process.cwd(), "uploads")
    const results: { filename: string; position: number }[] = []
    for (const { src, position } of photos) {
      try {
        const res = await fetch(src)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buffer = Buffer.from(await res.arrayBuffer())
        const ext = src.split(".").pop()?.split("?")[0] ?? "jpg"
        const filename = `${randomUUID()}.${ext}`
        await fs.writeFile(join(uploadDir, filename), buffer)
        results.push({ filename, position })
      } catch (e) {
        // on skippe, mais on garde une trace
        this.logger.warn(`Photo ${position} non téléchargée (${src}) : ${e instanceof Error ? e.message : e}`)
      }
    }
    return results
  }

  async setStage(id: number, stage: ItemStage, draftId?: string) {
    const item = await this.prisma.vintedItem.update({
      where: { id },
      data: { stage, notifiedAt: null, ...(draftId ? { draftId } : {}) },
    })
    this.logger.log(`Article ${id} passé à ${stage}${draftId ? ` (draftId=${draftId})` : ""}`)
    return item
  }
}
