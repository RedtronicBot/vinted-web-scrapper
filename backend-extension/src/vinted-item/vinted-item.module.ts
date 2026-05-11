import { Module } from '@nestjs/common';
import { VintedItemService } from './vinted-item.service';
import { VintedItemController } from './vinted-item.controller';

@Module({
  providers: [VintedItemService],
  controllers: [VintedItemController]
})
export class VintedItemModule {}
