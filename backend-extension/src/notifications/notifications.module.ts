import { Module } from "@nestjs/common"
import { NotificationsService } from "./notifications.service"
import { OpenController } from "./open.controller"

@Module({ providers: [NotificationsService], controllers: [OpenController] })
export class NotificationsModule {}
