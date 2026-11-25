import { Body, Controller, Logger, Post, UseGuards } from "@nestjs/common"
import { ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger"
import { PrismaService } from "prisma/prisma.service"
import { ApiKeyGuard } from "../auth/api-key.guard"
import { RegisterDeviceDto } from "./dto/registerDevice.dto"

@ApiTags("devices")
@ApiSecurity("api-key")
@Controller("devices")
@UseGuards(ApiKeyGuard)
export class DevicesController {
  private readonly logger = new Logger(DevicesController.name)

  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: "Enregistre le token FCM d'un appareil (sans doublon)" })
  async register(@Body() dto: RegisterDeviceDto) {
    const device = await this.prisma.device.upsert({
      where: { token: dto.token },
      update: {},
      create: { token: dto.token },
    })
    this.logger.log(`Appareil enregistré ...${dto.token.slice(-6)}`)
    return device
  }
}
