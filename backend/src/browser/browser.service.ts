import { Injectable, OnModuleDestroy } from "@nestjs/common"
import { Browser, BrowserContext, chromium } from "playwright"

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private browser: Browser | null = null
  private browserPromise: Promise<Browser> | null = null

  async getBrowser(): Promise<Browser> {
    if (this.browser) return this.browser
    if (!this.browserPromise) {
      this.browserPromise = chromium
        .launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        })
        .then((browser) => {
          this.browser = browser
          this.browserPromise = null
          return browser
        })
    }

    return this.browserPromise
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
