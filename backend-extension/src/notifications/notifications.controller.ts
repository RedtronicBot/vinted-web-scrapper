import { Controller, NotFoundException, Post, UseGuards } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiKeyGuard } from "../auth/api-key.guard"
import { NotificationsService } from "./notifications.service"

@Controller("notifications")
@UseGuards(ApiKeyGuard)
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  @Post("run")
  async run() {
    // route de test, désactivée sauf si la variable est à "true"
    if (this.config.get("ENABLE_TEST_ROUTES") !== "true") throw new NotFoundException()
    await this.notifications.notifyDueItems()
    return { ok: true }
  }

  @Post("drafts")
  async drafts() {
    // route de test, désactivée sauf si la variable est à "true"
    if (this.config.get("ENABLE_TEST_ROUTES") !== "true") throw new NotFoundException()
    await this.notifications.notifyDrafts()
    return { ok: true }
  }
}
