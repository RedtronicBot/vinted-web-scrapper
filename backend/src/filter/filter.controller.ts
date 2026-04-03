import { Body, Controller, Get, Logger, Post } from "@nestjs/common"
import { FilterService } from "./filter.service"
import { CreateFilterDto } from "./dto/createFilter.dto"
import { SearchService } from "src/search/search.service"
import { Cron, CronExpression } from "@nestjs/schedule"
import { delay } from "src/utils/delay"

@Controller("filter")
export class FilterController {
  private readonly logger = new Logger(FilterController.name)
  private isRunning = false
  constructor(
    private readonly filterService: FilterService,
    private readonly searchService: SearchService,
  ) {}

  @Cron("*/5 * * * *")
  async handleCron() {
    if (this.isRunning) {
      this.logger.warn("Previous cron still running, skipping")
      return
    }

    this.isRunning = true
    this.logger.log("Starting scheduled search for all filters")

    try {
      const filters = await this.filterService.findAll()

      for (const filter of filters) {
        this.logger.log(`Searching for filter ${filter.id}`)
        await this.searchService.searchOnce(filter)

        if (filter !== filters[filters.length - 1]) {
          await delay(2 * 60 * 1000)
        }
      }
    } catch (err) {
      this.logger.error("Cron job failed:", err)
    } finally {
      this.isRunning = false
      this.logger.log("Scheduled search complete")
    }
  }

  @Get("like")
  findByLike() {
    return this.filterService.findMostLike()
  }

  @Post()
  async create(@Body() dto: CreateFilterDto) {
    const filter = await this.filterService.create(dto)

    this.searchService.searchOnce(filter).catch((err) => {
      this.logger.error(`Initial search failed for filter ${filter.id}:`, err)
    })

    return filter
  }
}
