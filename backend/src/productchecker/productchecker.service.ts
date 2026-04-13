import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { ProductStatus } from "prisma/generated/prisma/enums"
import { PrismaService } from "prisma/prisma.service"
import { BrowserService } from "src/browser/browser.service"
import { delay } from "src/utils/delay"
import { isOlderThanOneWeek } from "src/utils/isOlderThanOneWeek"

@Injectable()
export class ProductCheckerService {
  private readonly logger = new Logger(ProductCheckerService.name)
  private isRunning = false
  private lastRun: { startedAt: Date; finishedAt?: Date; error?: string } | null = null
  constructor(
    private readonly prisma: PrismaService,
    private readonly browserService: BrowserService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async triggerManualCheck() {
    if (this.isRunning) {
      return { status: "already_running", startedAt: this.lastRun?.startedAt }
    }
    this.runCheck()

    return { status: "started", startedAt: this.lastRun?.startedAt }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCheck() {
    await this.triggerManualCheck()
  }

  private async runCheck() {
    if (this.isRunning) return
    this.isRunning = true
    this.lastRun = { startedAt: new Date() }
    this.logger.log("Début du check...")
    try {
      await this.checkAllProducts()
      this.lastRun.finishedAt = new Date()
    } catch (err) {
      this.lastRun.error = (err as Error).message
      this.logger.error("Erreur lors du check", err)
    } finally {
      this.isRunning = false
    }
  }

  private async checkAllProducts() {
    await this.prisma.product.deleteMany({
      where: { status: "DELETE" },
    })
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const products = await this.prisma.product.findMany({
      where: {
        status: "ACTIVE",
        updatedAt: {
          lt: twentyFourHoursAgo,
        },
      },
      select: { id: true, url: true },
    })

    this.logger.log(`${products.length} produits à vérifier.`)

    for (let i = 0; i < products.length; i++) {
      const product = products[i]

      this.logger.log(`[${i + 1}/${products.length}] Vérification : ${product.url}`)

      try {
        await this.checkProduct(product.url, product.id)
      } catch (err) {
        this.logger.error(`Erreur sur ${product.url} : ${(err as Error).message}`)
      }

      if (i < products.length - 1) {
        await delay(2 * 60 * 1000)
      }
    }
  }

  private async checkProduct(url: string, productId: number) {
    const context = await this.browserService.createContext()
    try {
      const page = await context.newPage()

      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined })
      })

      const response = await page.goto(url, { waitUntil: "domcontentloaded" })

      if (!response || !response.ok()) {
        // Produit probablement supprimé ou indisponible
        if (response?.status() === 404) {
          await this.prisma.product.update({
            where: { id: productId },
            data: { status: "DELETE" },
          })
          this.logger.log(`Produit supprimé : ${url}`)
        }
        return
      }

      const priceLocator = page.locator('[data-testid$="item-price"]')
      let price: number | undefined
      if ((await priceLocator.count()) > 0) {
        const rawText = await priceLocator.first().textContent()
        if (rawText) {
          price = parseFloat(rawText.replace(/\s/g, "").replace("€", "").replace(",", "."))
        }
      }

      const likeLocator = page.locator('[data-testid="favourite-button"]')
      let likes = 0
      if ((await likeLocator.count()) > 0) {
        const text = await likeLocator.first().textContent()
        likes = parseInt(text?.trim() ?? "0", 10) || 0
      }
      const soldLocator = page.locator('[data-testid="item-status--content"]')
      let status: ProductStatus = "ACTIVE"
      if ((await soldLocator.count()) > 0) {
        status = "SOLD"
      }
      const uploadDateLocator = page.locator('[data-testid="item-attributes-upload_date"] [itemprop="upload_date"] span')
      if ((await uploadDateLocator.count()) > 0) {
        const uploadText = await uploadDateLocator.first().textContent()
        if (uploadText && status !== "SOLD") {
          const isOld = isOlderThanOneWeek(uploadText.trim())
          if (isOld) {
            status = "ARCHIVED"
          }
        }
      }
      let image: string | null = null
      const imageLocator = page.locator('[data-testid="item-photo-1--img"]')
      if ((await imageLocator.count()) > 0) {
        image = await imageLocator.first().getAttribute("src")
      }
      const updated = await this.prisma.product.update({
        where: { id: productId },
        data: {
          ...(price !== undefined && { price }),
          likes,
          ...(status === "SOLD" && { sell_at: new Date() }),
          status,
          ...(image !== null && { img: image }),
        },
      })

      this.logger.log(
        `Produit mis à jour [${updated.id}] — status: ${updated.status}${updated.sell_at ? ` | sold_at: ${updated.sell_at.toISOString()}` : ""} | prix: ${updated.price} | likes: ${updated.likes}`,
      )

      await page.close()
    } finally {
      await context.close()
    }
  }
}
