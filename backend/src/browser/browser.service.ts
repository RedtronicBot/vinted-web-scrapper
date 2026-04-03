import { Injectable, OnModuleDestroy } from "@nestjs/common"
import { Browser, BrowserContext, chromium } from "playwright"

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private browser: Browser

  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
    }

    return this.browser
  }

  async createContext(): Promise<BrowserContext> {
    const browser = await this.getBrowser()

    return browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      locale: "fr-FR",
      viewport: { width: 1280, height: 800 },
    })
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}
