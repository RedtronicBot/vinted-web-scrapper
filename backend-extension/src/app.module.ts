import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { VintedItemModule } from "./vinted-item/vinted-item.module"
import { PrismaModule } from "prisma/prisma.module"
import { NotificationsModule } from "./notifications/notifications.module"
import { ScheduleModule } from "@nestjs/schedule"

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ScheduleModule.forRoot(), VintedItemModule, PrismaModule, NotificationsModule],
})
export class AppModule {}
