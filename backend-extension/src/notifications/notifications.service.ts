import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron } from "@nestjs/schedule"
import { PrismaService } from "prisma/prisma.service"

const MAX_PER_RUN = 5

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // Toutes les heures de 9h à 21h, heure de Paris
  @Cron("0 9-21 * * *", { timeZone: "Europe/Paris" })
  async notifyDueItems() {
    const due = await this.prisma.vintedItem.findMany({
      where: { reuploadAt: { lte: new Date() }, notifiedAt: null },
      orderBy: { reuploadAt: "asc" },
      take: MAX_PER_RUN,
      select: { id: true, title: true },
    })

    for (const item of due) {
      try {
        await this.push(item.id, item.title)
        await this.prisma.vintedItem.update({
          where: { id: item.id },
          data: { notifiedAt: new Date() },
        })
      } catch (e) {
        this.logger.error(`Notif échouée pour l'article ${item.id}`, e as Error)
      }
    }
  }

  private async push(id: number, title: string) {
    const token = this.config.get<string>("NTFY_TOKEN")
    const res = await fetch(this.config.getOrThrow<string>("NTFY_URL"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        topic: this.config.getOrThrow<string>("NTFY_TOPIC"),
        title: "Article à republier",
        message: title,
        click: `https://www.vinted.fr/items/new#vr=${id}`,
        tags: ["recycle"],
      }),
    })
    if (!res.ok) throw new Error(`ntfy a répondu ${res.status}`)
  }
}
