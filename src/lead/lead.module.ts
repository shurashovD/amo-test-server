import { Module } from '@nestjs/common';
import { LeadController } from './lead.controller';
import { AmoService } from './amo.service';

@Module({
  controllers: [LeadController],
  providers: [AmoService],
})
export class LeadModule {}
