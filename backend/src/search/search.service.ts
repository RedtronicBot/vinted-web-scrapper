import { Injectable } from "@nestjs/common"
import { Filter, Prisma } from "prisma/generated/prisma/client"
import { PrismaService } from "prisma/prisma.service"
import { BrowserService } from "src/browser/browser.service"

@Injectable()
export class SearchService {
  constructor(
    private readonly browserService: BrowserService,
    private readonly prisma: PrismaService,
  ) {}

  async searchOnce(filter: Filter) {
    const since = Math.floor(Date.now() / 1000) - 60 * 5
    const baseUrl = "https://www.vinted.fr/catalog"

    const url = new URL(baseUrl)
    url.searchParams.set("search_text", filter.search)
    url.searchParams.set("order", "newest_first")
    url.searchParams.set("page", "1")
    url.searchParams.set("time", String(since))
    url.searchParams.set("price_from", String(filter.min_cost))
    url.searchParams.set("price_to", String(filter.max_cost))
    if (filter.brand_id && filter.brand_id > 0) {
      url.searchParams.append("brand_ids[]", String(filter.brand_id))
    }
    if (filter.condition_id && filter.condition_id > 0) {
      url.searchParams.append("status_ids[]", String(filter.condition_id))
    }
    if (filter.category_id && filter.category_id > 0) {
      url.searchParams.append("catalog[]", String(filter.category_id))
    }
    const product = await this.collectCatalog(url, filter)

    return product
  }

  private async collectCatalog(
    url: URL,
    filter: Filter,
  ): Promise<
    {
      link: string | null | undefined
      likes: number
    }[]
  > {
    const context = await this.browserService.createContext()
    try {
      const page = await context.newPage()
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", {
          get: () => undefined,
        })
      })
      const response = await page.goto(url.toString(), { waitUntil: "domcontentloaded" })
      if (!response || !response.ok()) {
        throw new Error(`Navigation échouée : ${response?.status()}`)
      }

      await page.waitForSelector(".feed-grid__item .new-item-box__container", {
        timeout: 15_000,
      })

      const items = page.locator(".feed-grid__item .new-item-box__container")
      const count = await items.count()

      const results: {
        link: string | null | undefined
        likes: number
        imageUrl: string | null
        price: number
      }[] = []

      for (let i = 0; i < count; i++) {
        const item = items.nth(i)

        const linkLocator = item.locator('[data-testid$="--overlay-link"]')

        if ((await linkLocator.count()) === 0) continue

        const link = await linkLocator.first().getAttribute("href")

        const likeTexts = await item.locator('[data-testid="favourite-count-text"]').allTextContents()

        const likes = likeTexts.length ? parseInt(likeTexts[0].trim(), 10) : 0

        const imageLocator = item.locator('[data-testid$="--image--img"]')

        let imageUrl: string | null = null

        if ((await imageLocator.count()) > 0) {
          const img = imageLocator.first()
          await img.waitFor({ state: "attached", timeout: 5000 })
          for (let i = 0; i < 5; i++) {
            imageUrl = (await img.getAttribute("src")) || (await img.getAttribute("data-src")) || (await img.getAttribute("srcset"))
            if (imageUrl) break
            await page.waitForTimeout(200)
          }
        }

        const priceLocator = item.locator('.new-item-box__title [data-testid$="--price-text"]')
        let price = 0

        if ((await priceLocator.count()) > 0) {
          const rawText = await priceLocator.textContent()

          if (rawText) {
            const normalized = rawText.replace(/\s/g, "").replace("€", "").replace(",", ".")

            price = parseFloat(normalized)
          }
        }
        if (link) {
          results.push({ link, likes, imageUrl, price })
        }
      }

      await page.close()
      for (const product of results) {
        await this.prisma.product.upsert({
          where: {
            url: product.link ?? "",
          },
          update: {
            price: product.price,
            img: product.imageUrl,
            likes: product.likes,
          },
          create: {
            url: product.link!,
            status: "ACTIVE",
            img: product.imageUrl,
            price: new Prisma.Decimal(product.price),
            filter_id: filter.id,
            likes: product.likes,
          },
        })
      }
      return results
    } finally {
      await context.close()
    }
  }
}
