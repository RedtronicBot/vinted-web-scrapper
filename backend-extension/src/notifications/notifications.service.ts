import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron } from "@nestjs/schedule"
import { PrismaService } from "prisma/prisma.service"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

const MAX_PER_RUN = 5
const DAY = 24 * 60 * 60 * 1000

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
  onModuleInit() {
    if (!getApps().length) {
      initializeApp({
        credential: cert(JSON.parse(this.config.getOrThrow<string>("FIREBASE_SERVICE_ACCOUNT"))),
      })
    }
  }

  // Toutes les heures de 9h à 21h, heure de Paris
  @Cron("0 9-21 * * *", { timeZone: "Europe/Paris" })
  async notifyDueItems() {
    const due = await this.prisma.vintedItem.findMany({
      where: {
        stage: "PENDING",
        reuploadAt: { lte: new Date() },
        OR: [{ notifiedAt: null }, { notifiedAt: { lte: new Date(Date.now() - DAY) } }],
      },
      orderBy: { reuploadAt: "asc" },
      take: MAX_PER_RUN,
      select: { id: true, title: true, notifiedAt: true },
    })

    for (const item of due) {
      await this.notify(item.id, item.notifiedAt ? "Rappel : article à republier" : "Article à republier", item.title)
    }
  }

  // Tous les jours à 17h : brouillons à publier
  @Cron("0 17 * * *", { timeZone: "Europe/Paris" })
  async notifyDrafts() {
    const drafts = await this.prisma.vintedItem.findMany({
      where: { stage: "DRAFT", notifiedAt: null },
      take: MAX_PER_RUN,
      select: { id: true, title: true, draftId: true },
    })
    for (const item of drafts) {
      await this.notify(item.id, "Brouillon à publier", item.title, `https://www.vinted.fr/items/${item.draftId}/edit`)
    }
  }

  private async notify(id: number, title: string, body: string, url = `https://www.vinted.fr/items/new#vr=${id}`) {
    try {
      await this.push(title, body, url)
      await this.prisma.vintedItem.update({ where: { id }, data: { notifiedAt: new Date() } })
    } catch (e) {
      this.logger.error(`Notif échouée pour l'article ${id}`, e as Error)
    }
  }

  private async push(title: string, body: string, url: string) {
    const devices = await this.prisma.device.findMany()
    if (!devices.length) throw new Error("Aucun appareil enregistré")

    const res = await getMessaging().sendEachForMulticast({
      tokens: devices.map((d) => d.token),
      notification: { title, body },
      data: { url },
      android: { priority: "high" },
    })

    // nettoyer les tokens morts
    const dead = res.responses
      .map((r, i) => (r.error?.code === "messaging/registration-token-not-registered" ? devices[i].token : null))
      .filter((t): t is string => !!t)
    if (dead.length) await this.prisma.device.deleteMany({ where: { token: { in: dead } } })

    if (res.successCount === 0) throw new Error("Aucune notif envoyée")
  }
}
