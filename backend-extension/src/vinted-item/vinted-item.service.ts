import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PrismaService } from 'prisma/prisma.service';
import { CreateItemDto } from './dto/createItem.dto';

@Injectable()
export class VintedItemService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateItemDto) {
    const filenames = await this.downloadPhotos(dto.photos);
    return this.prisma.vintedItem.create({
      data: {
        ...dto,
        price: parseFloat(dto.price),
        photos: {
          create: filenames.map((filename) => ({ filename })),
        },
      },
      include: { photos: true },
    });
  }

  findAll() {
    return this.prisma.vintedItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { photos: true },
    });
  }

  findOne(id: number) {
    return this.prisma.vintedItem.findUnique({
      where: { id },
      include: { photos: true },
    });
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    if (!item) return;
    // Supprime les fichiers disque
    for (const photo of item.photos) {
      await fs.unlink(path.join('./uploads', photo.filename)).catch(() => {});
    }
    // Le cascade s'occupe de supprimer les Photo en base
    return this.prisma.vintedItem.delete({ where: { id } });
  }
  private async downloadPhotos(urls: string[]): Promise<string[]> {
    const paths: string[] = [];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        const buffer = Buffer.from(await res.arrayBuffer());
        const ext = url.split('.').pop()?.split('?')[0] ?? 'jpg';
        const filename = `${randomUUID()}.${ext}`;
        await fs.writeFile(path.join('./uploads', filename), buffer);
        paths.push(filename);
      } catch {
        // on skippe si une image échoue
      }
    }
    return paths;
  }
}
