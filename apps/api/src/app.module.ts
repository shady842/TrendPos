import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { CompaniesModule } from './companies/companies.module';
import { MenuModule } from './menu/menu.module';
import { FloorModule } from './floor/floor.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ApprovalsModule,
    CompaniesModule,
    MenuModule,
    RealtimeModule,
    OrdersModule,
    FloorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
