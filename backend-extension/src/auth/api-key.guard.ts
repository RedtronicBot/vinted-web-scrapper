import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name)

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    if (req.headers["x-api-key"] !== this.config.getOrThrow<string>("API_KEY")) {
      const reason = req.headers["x-api-key"] ? "invalide" : "absente"
      this.logger.warn(`Clé API ${reason} : ${req.method} ${req.originalUrl} depuis ${req.ip}`)
      throw new UnauthorizedException()
    }
    return true
  }
}
