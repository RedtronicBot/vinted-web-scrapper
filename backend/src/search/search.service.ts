import { Injectable } from "@nestjs/common"
import { Filter, FilterColor, FilterSize, FilterState, Prisma } from "prisma/generated/prisma/client"
import { PrismaService } from "prisma/prisma.service"
import { BrowserService } from "src/browser/browser.service"

@Injectable()
export class SearchService {
  constructor(
    private readonly browserService: BrowserService,
    private readonly prisma: PrismaService,
  ) {}

  async searchOnce(filter: Filter & { colors: FilterColor[] } & { states: FilterState[] } & { sizes: FilterSize[] }) {
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
    if (filter.states?.length > 0) {
      filter.states.forEach(({ state_id }) => {
        url.searchParams.append("status_ids[]", String(state_id))
      })
    }
    if (filter.category_id && filter.category_id > 0) {
      url.searchParams.append("catalog[]", String(filter.category_id))
    }
    if (filter.colors?.length > 0) {
      filter.colors.forEach(({ color_id }) => {
        url.searchParams.append("color_ids[]", String(color_id))
      })
    }
    if (filter.sizes?.length > 0) {
      filter.sizes.forEach(({ size_id }) => {
        url.searchParams.append("size_ids[]", String(size_id))
      })
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

      await page.waitForSelector('[data-testid^="product-item-id-"]', {
        timeout: 15_000,
      })

      const items = page.locator('[data-testid^="product-item-id-"]')
      const count = await items.count()

      const results: {
        link: string | null | undefined
        likes: number
        imageUrl: string | null
        price: number
        size: string | null
        state: string | null
        boosted: boolean
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

        let size: string | null = null
        let state: string | null = null

        const sizeLocator = item.locator('[data-testid$="--description-subtitle"]')

        if ((await sizeLocator.count()) > 0) {
          const rawText = await sizeLocator.textContent()
          if (rawText) {
            const textSplit = rawText.split("·")
            size = textSplit[0]?.trim()
            state = textSplit[1]?.trim()
          }
        }
        let boosted = false
        const boostedLocator = item.locator('[data-testid$="--bump-text"]')
        if ((await boostedLocator.count()) > 0) {
          boosted = true
        }

        if (link) {
          results.push({ link, likes, imageUrl, price, size, state, boosted })
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
            size: product.size,
            state: product.state,
            boosted: product.boosted,
          },
          create: {
            url: product.link!,
            status: "ACTIVE",
            img: product.imageUrl,
            price: new Prisma.Decimal(product.price),
            filter_id: filter.id,
            likes: product.likes,
            size: product.size,
            state: product.state,
            boosted: product.boosted,
          },
        })
      }
      return results
    } finally {
      await context.close()
    }
  }
}
