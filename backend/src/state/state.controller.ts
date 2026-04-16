import { Body, Controller, Get, Post } from "@nestjs/common"
import { StateService } from "./state.service"
import { CreateStateDto } from "./dto/CreateState.dto"

@Controller("state")
export class StateController {
  constructor(private readonly stateService: StateService) {}
  @Get()
  findAll() {
    return this.stateService.findAll()
  }
  @Post()
  create(@Body() dto: CreateStateDto) {
    return this.stateService.create(dto)
  }
}
