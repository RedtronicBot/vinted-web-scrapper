import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    if (req.headers["x-api-key"] !== this.config.getOrThrow<string>("API_KEY")) {
      throw new UnauthorizedException()
    }
    return true
  }
}
