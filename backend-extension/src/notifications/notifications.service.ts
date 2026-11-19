import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron } from "@nestjs/schedule"
import { PrismaService } from "prisma/prisma.service"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

const MAX_PER_RUN = 5

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
    const devices = await this.prisma.device.findMany()
    if (!devices.length) throw new Error("Aucun appareil enregistré")

    const res = await getMessaging().sendEachForMulticast({
      tokens: devices.map((d) => d.token),
      notification: { title: "Article à republier", body: title },
      data: { url: `https://www.vinted.fr/items/new#vr=${id}` },
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
