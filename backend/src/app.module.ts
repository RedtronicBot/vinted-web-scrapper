import { Module } from "@nestjs/common"
import { BrowserModule } from "./browser/browser.module"
import { PrismaModule } from "prisma/prisma.module"
import { FilterModule } from "./filter/filter.module"
import { ConfigModule } from "@nestjs/config"
import { SearchModule } from "./search/search.module"
import { ProductcheckerModule } from "./productchecker/productchecker.module"
import { ScheduleModule } from "@nestjs/schedule"
import { ConditionModule } from './condition/condition.module';
import { BrandModule } from './brand/brand.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    BrowserModule,
    PrismaModule,
    FilterModule,
    SearchModule,
    ProductcheckerModule,
    ConditionModule,
    BrandModule,
    CategoryModule,
  ],
})
export class AppModule {}
