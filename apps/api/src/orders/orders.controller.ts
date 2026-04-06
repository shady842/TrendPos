import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { RequestOrderApprovalDto } from './dto/request-order-approval.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.orders.create(user.userId, dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  list(
    @CurrentUser() user: AuthUser,
    @Query('branchId') branchId: string,
  ) {
    return this.orders.listForBranch(user.userId, branchId);
  }

  @Post(':orderId/request-approval')
  @UseGuards(AuthGuard('jwt'))
  requestApproval(
    @CurrentUser() user: AuthUser,
    @Param('orderId') orderId: string,
    @Body() dto: RequestOrderApprovalDto,
  ) {
    return this.orders.requestApproval(user.userId, orderId, dto);
  }
}
