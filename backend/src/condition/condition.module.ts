import { Module } from '@nestjs/common';
import { ConditionService } from './condition.service';
import { ConditionController } from './condition.controller';

@Module({
  providers: [ConditionService],
  controllers: [ConditionController]
})
export class ConditionModule {}
