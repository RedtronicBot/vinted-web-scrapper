import { Module } from "@nestjs/common"
import { SearchService } from "./search.service"
import { BrowserModule } from "src/browser/browser.module"

@Module({
  imports: [BrowserModule],
  providers: [SearchService],
  controllers: [],
  exports: [SearchService],
})
export class SearchModule {}
