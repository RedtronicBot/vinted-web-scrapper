import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VintedItemModule } from './vinted-item/vinted-item.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    VintedItemModule,
    PrismaModule,
  ],
})
export class AppModule {}
