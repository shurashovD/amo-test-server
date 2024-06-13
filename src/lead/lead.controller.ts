import { Controller, Get, Query } from '@nestjs/common';
import { AmoService } from './amo.service';

@Controller('/api/leads')
export class LeadController {
  constructor(private readonly leadService: AmoService) {}

  @Get('/')
  async getLeads(@Query('query') query: string): Promise<string> {
    const data = await this.leadService.getLeads({ query });
    return JSON.stringify(data);
  }
}
