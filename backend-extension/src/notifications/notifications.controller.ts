import { Controller, NotFoundException, Post, UseGuards } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ApiNotFoundResponse, ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger"
import { ApiKeyGuard } from "../auth/api-key.guard"
import { NotificationsService } from "./notifications.service"

@ApiTags("notifications")
@ApiSecurity("api-key")
@Controller("notifications")
@UseGuards(ApiKeyGuard)
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  @Post("run")
  @ApiOperation({
    summary: "Lance l'envoi des notifs d'articles à republier",
    description: "Route de test, active uniquement si ENABLE_TEST_ROUTES=true",
  })
  @ApiNotFoundResponse({ description: "Routes de test désactivées" })
  async run() {
    // route de test, désactivée sauf si la variable est à "true"
    if (this.config.get("ENABLE_TEST_ROUTES") !== "true") throw new NotFoundException()
    await this.notifications.notifyDueItems()
    return { ok: true }
  }

  @Post("drafts")
  @ApiOperation({
    summary: "Lance l'envoi des notifs de brouillons à publier",
    description: "Route de test, active uniquement si ENABLE_TEST_ROUTES=true",
  })
  @ApiNotFoundResponse({ description: "Routes de test désactivées" })
  async drafts() {
    // route de test, désactivée sauf si la variable est à "true"
    if (this.config.get("ENABLE_TEST_ROUTES") !== "true") throw new NotFoundException()
    await this.notifications.notifyDrafts()
    return { ok: true }
  }
}
