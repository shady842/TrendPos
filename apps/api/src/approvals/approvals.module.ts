import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';

@Module({
  imports: [CompaniesModule, RealtimeModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
})
export class ApprovalsModule {}
