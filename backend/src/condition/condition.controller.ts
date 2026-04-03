import { Controller, Get } from "@nestjs/common"
import { ConditionService } from "./condition.service"

@Controller("condition")
export class ConditionController {
  constructor(private readonly conditionService: ConditionService) {}
  @Get()
  findAll() {
    return this.conditionService.findAll()
  }
}
