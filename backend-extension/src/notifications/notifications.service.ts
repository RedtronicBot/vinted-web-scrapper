import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Cron } from "@nestjs/schedule"
import { PrismaService } from "prisma/prisma.service"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

const MAX_PER_RUN = 5
const DAY = 24 * 60 * 60 * 1000
// Marge de 5 min : notifiedAt est écrit quelques secondes après le début du cron,
// sans marge le rappel du lendemain serait sauté et décalé d'une heure
const REMIND_AFTER = DAY - 5 * 60 * 1000
const DEAD_TOKEN_CODES = ["messaging/registration-token-not-registered", "messaging/invalid-registration-token"]

@Injectable()
export class NotificationsService implements OnModuleInit, OnApplicationBootstrap {
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
      this.logger.log("Firebase Admin initialisé")
    }
  }

  // Une ligne à chaque (re)démarrage : permet de voir si le serveur était coupé à l'heure d'un cron
  async onApplicationBootstrap() {
    try {
      const devices = await this.prisma.device.count()
      this.logger.log(`Service de notifications démarré (${devices} appareil(s) enregistré(s))`)
    } catch (e) {
      this.logger.error("Impossible de compter les appareils au démarrage", this.stack(e))
    }
  }

  // Toutes les 10min de 9h à 10h, heure de Paris
  @Cron("*/10 9-10 * * *", { timeZone: "Europe/Paris" })
  async notifyDueItems() {
    this.logger.log("Cron notifyDueItems : début")
    try {
      const due = await this.prisma.vintedItem.findMany({
        where: {
          stage: "PENDING",
          reuploadAt: { lte: new Date() },
          OR: [{ notifiedAt: null }, { notifiedAt: { lte: new Date(Date.now() - REMIND_AFTER) } }],
        },
        orderBy: { reuploadAt: "asc" },
        take: MAX_PER_RUN,
        select: { id: true, title: true, notifiedAt: true },
      })
      this.logger.log(`${due.length} article(s) à republier à notifier`)

      let sent = 0
      for (const item of due) {
        const ok = await this.notify(item.id, item.notifiedAt ? "Rappel : article à republier" : "Article à republier", item.title)
        if (ok) sent++
      }
      this.logger.log(`Cron notifyDueItems : ${sent}/${due.length} notification(s) envoyée(s)`)
    } catch (e) {
      this.logger.error("Cron notifyDueItems : erreur", this.stack(e))
    }
  }

  // Toutes les 10min de 17h à 18h, heure de Paris
  @Cron("*/10 17-18 * * *", { timeZone: "Europe/Paris" })
  async notifyDrafts() {
    this.logger.log("Cron notifyDrafts : début")
    try {
      const drafts = await this.prisma.vintedItem.findMany({
        where: { stage: "DRAFT", notifiedAt: null },
        take: MAX_PER_RUN,
        select: { id: true, title: true, draftId: true },
      })
      this.logger.log(`${drafts.length} brouillon(s) à notifier`)

      let sent = 0
      for (const item of drafts) {
        if (!item.draftId) {
          this.logger.warn(`Article ${item.id} en DRAFT sans draftId, notif ignorée`)
          continue
        }
        const ok = await this.notify(
          item.id,
          "Brouillon à publier",
          item.title,
          `https://www.vinted.fr/items/${item.draftId}/edit#vr-publish=${item.id}`,
        )
        if (ok) sent++
      }
      this.logger.log(`Cron notifyDrafts : ${sent}/${drafts.length} notification(s) envoyée(s)`)
    } catch (e) {
      this.logger.error("Cron notifyDrafts : erreur", this.stack(e))
    }
  }

  private async notify(id: number, title: string, body: string, url = `https://www.vinted.fr/items/new#vr=${id}`): Promise<boolean> {
    try {
      await this.push(title, body, url)
      await this.prisma.vintedItem.update({ where: { id }, data: { notifiedAt: new Date() } })
      this.logger.log(`Notif envoyée pour l'article ${id} (${title})`)
      return true
    } catch (e) {
      this.logger.error(`Notif échouée pour l'article ${id}`, this.stack(e))
      return false
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

    // détail des échecs par appareil (on ne log que la fin du token)
    const dead: string[] = []
    res.responses.forEach((r, i) => {
      if (r.success) return
      const code = r.error?.code ?? "code inconnu"
      const tokenEnd = devices[i].token.slice(-6)
      if (DEAD_TOKEN_CODES.includes(code)) {
        dead.push(devices[i].token)
        this.logger.warn(`Token ...${tokenEnd} mort (${code}), suppression`)
      } else {
        this.logger.error(`Envoi FCM échoué vers ...${tokenEnd} : ${code} : ${r.error?.message}`)
      }
    })
    if (dead.length) await this.prisma.device.deleteMany({ where: { token: { in: dead } } })

    this.logger.log(`FCM : ${res.successCount} succès, ${res.failureCount} échec(s) sur ${devices.length} appareil(s)`)
    if (res.successCount === 0) throw new Error(`Aucune notif envoyée (${res.failureCount} échec(s))`)
  }

  private stack(e: unknown) {
    return e instanceof Error ? e.stack : String(e)
  }
}
