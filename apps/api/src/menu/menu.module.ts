import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
  imports: [CompaniesModule],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
