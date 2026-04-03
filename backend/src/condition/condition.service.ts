import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { CreateConditionDto } from "./dto/CreateCondition.dto"

@Injectable()
export class ConditionService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() {
    return this.prisma.condition.findMany()
  }
  create(data: CreateConditionDto) {
    return this.prisma.condition.create({ data })
  }
}
