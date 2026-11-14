import { Controller, Get, Param, ParseIntPipe, Redirect } from "@nestjs/common"

@Controller("open")
export class OpenController {
  @Get(":id")
  @Redirect()
  open(@Param("id", ParseIntPipe) id: number) {
    return { url: `https://www.vinted.fr/items/new#vr=${id}`, statusCode: 302 }
  }
}
