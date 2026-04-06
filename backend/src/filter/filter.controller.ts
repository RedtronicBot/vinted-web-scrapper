import { Body, Controller, Get, Logger, OnModuleInit, Post } from "@nestjs/common"
import { FilterService } from "./filter.service"
import { CreateFilterDto } from "./dto/createFilter.dto"
import { SearchService } from "src/search/search.service"
import { delay } from "src/utils/delay"

@Controller("filter")
export class FilterController implements OnModuleInit {
  private readonly logger = new Logger(FilterController.name)
  private isRunning = false
  constructor(
    private readonly filterService: FilterService,
    private readonly searchService: SearchService,
  ) {}

  onModuleInit() {
    this.runLoop()
  }
  async runLoop() {
    while (true) {
      this.logger.log("Starting scheduled search for all filters")

      try {
        const filters = await this.filterService.findAll()

        for (const filter of filters) {
          this.logger.log(`Searching for filter ${filter.id}`)
          await this.searchService.searchOnce(filter)

          await delay(2 * 60 * 1000)
        }

        this.logger.log("All filters processed, waiting 5 minutes...")
        await delay(5 * 60 * 1000)
      } catch (err) {
        if (err instanceof Error) {
          this.logger.error(`Loop failed: ${err.message}`)
        } else {
          this.logger.error(`Loop failed: ${String(err)}`)
        }

        await delay(60 * 1000)
      }
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
