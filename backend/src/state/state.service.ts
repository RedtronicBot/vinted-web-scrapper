import { Injectable } from "@nestjs/common"
import { PrismaService } from "prisma/prisma.service"
import { CreateStateDto } from "./dto/CreateState.dto"

@Injectable()
export class StateService {
  constructor(private readonly prisma: PrismaService) {}
  findAll() {
    return this.prisma.state.findMany()
  }
  create(data: CreateStateDto) {
    return this.prisma.state.create({ data })
  }
}
