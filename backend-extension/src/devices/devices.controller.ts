import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { ApiKeyGuard } from "../auth/api-key.guard"
import { RegisterDeviceDto } from "./dto/registerDevice.dto"

@Controller("devices")
@UseGuards(ApiKeyGuard)
export class DevicesController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  register(@Body() dto: RegisterDeviceDto) {
    return this.prisma.device.upsert({
      where: { token: dto.token },
      update: {},
      create: { token: dto.token },
    })
  }
}
