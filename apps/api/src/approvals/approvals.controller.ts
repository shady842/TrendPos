import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { ApprovalDecisionDto } from './dto/approval-decision.dto';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { ApprovalsService } from './approvals.service';

@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvals: ApprovalsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  list(
    @CurrentUser() user: AuthUser,
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ) {
    return this.approvals.list(user.userId, companyId, status);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApprovalDto) {
    return this.approvals.create(user.userId, dto);
  }

  @Post(':approvalId/decision')
  @UseGuards(AuthGuard('jwt'))
  decide(
    @CurrentUser() user: AuthUser,
    @Param('approvalId') approvalId: string,
    @Body() dto: ApprovalDecisionDto,
  ) {
    return this.approvals.decide(user.userId, approvalId, dto);
  }
}
