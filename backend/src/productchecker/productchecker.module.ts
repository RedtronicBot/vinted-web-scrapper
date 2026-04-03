import { Module } from "@nestjs/common"
import { ProductCheckerService } from "./productchecker.service"
import { ProductCheckerController } from "./productchecker.controller"
import { BrowserModule } from "src/browser/browser.module"

@Module({
  imports: [BrowserModule],
  providers: [ProductCheckerService],
  controllers: [ProductCheckerController],
})
export class ProductcheckerModule {}
