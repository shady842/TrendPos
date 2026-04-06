import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { FloorController } from './floor.controller';
import { FloorService } from './floor.service';

@Module({
  imports: [CompaniesModule],
  controllers: [FloorController],
  providers: [FloorService],
})
export class FloorModule {}
