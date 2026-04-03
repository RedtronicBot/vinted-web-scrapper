import { Body, Controller, Get, Post } from "@nestjs/common"
import { ConditionService } from "./condition.service"
import { CreateConditionDto } from "./dto/CreateCondition.dto"

@Controller("condition")
export class ConditionController {
  constructor(private readonly conditionService: ConditionService) {}
  @Get()
  findAll() {
    return this.conditionService.findAll()
  }
  @Post()
  create(@Body() dto: CreateConditionDto) {
    return this.conditionService.create(dto)
  }
}
