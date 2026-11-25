import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { Logger, ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { join } from "path"
import { NestExpressApplication } from "@nestjs/platform-express"
import { mkdir } from "fs/promises"
async function bootstrap() {
  const logger = new Logger("Bootstrap")
  await mkdir(join(process.cwd(), "uploads"), { recursive: true })
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets(join(process.cwd(), "uploads"), {
    prefix: "/uploads",
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
    },
  })
  app.useGlobalPipes(new ValidationPipe())
  const origins = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)

  app.enableCors({
    origin: origins,
    methods: ["GET", "POST", "DELETE", "PATCH"],
  })

  // Doc Swagger, activée uniquement si ENABLE_SWAGGER=true (comme ENABLE_TEST_ROUTES)
  if (app.get(ConfigService).get("ENABLE_SWAGGER") === "true") {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("Vinted Reupload API")
        .setDescription("API de gestion des articles à republier et des notifications push")
        .setVersion("1.0")
        .addApiKey({ type: "apiKey", name: "x-api-key", in: "header" }, "api-key")
        .build(),
    )
    SwaggerModule.setup("docs", app, document)
    logger.log("Swagger disponible sur /docs")
  }

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  logger.log(`API démarrée sur le port ${port}`)
}
bootstrap()
