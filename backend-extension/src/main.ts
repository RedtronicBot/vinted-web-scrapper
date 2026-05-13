import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'https://www.vinted.fr',
    methods: ['GET', 'POST', 'DELETE'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
