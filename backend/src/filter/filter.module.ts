import { Module } from "@nestjs/common"
import { FilterService } from "./filter.service"
import { FilterController } from "./filter.controller"
import { SearchModule } from "src/search/search.module"

@Module({
  imports: [SearchModule],
  providers: [FilterService],
  controllers: [FilterController],
})
export class FilterModule {}
