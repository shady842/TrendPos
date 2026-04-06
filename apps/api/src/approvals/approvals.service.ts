import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CompaniesService } from '../companies/companies.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { ApprovalDecisionDto } from './dto/approval-decision.dto';
import type { CreateApprovalDto } from './dto/create-approval.dto';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companies: CompaniesService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async list(userId: string, companyId: string, status?: string) {
    await this.companies.assertMember(userId, companyId);
    return this.prisma.approvalRequest.findMany({
      where: {
        companyId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(userId: string, dto: CreateApprovalDto) {
    await this.companies.assertMember(userId, dto.companyId);

    if (dto.branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: dto.branchId },
      });
      if (!branch || branch.companyId !== dto.companyId) {
        throw new NotFoundException('Invalid branch for company');
      }
    }

    const approval = await this.prisma.approvalRequest.create({
      data: {
        companyId: dto.companyId,
        branchId: dto.branchId ?? null,
        type: dto.type,
        payload: dto.payload as Prisma.InputJsonValue,
        requestedByUserId: userId,
      },
    });

    this.realtime.emitApprovalUpdated(dto.companyId, {
      type: 'created',
      approval,
    });

    return approval;
  }

  async decide(userId: string, approvalId: string, dto: ApprovalDecisionDto) {
    const approval = await this.prisma.approvalRequest.findUnique({
      where: { id: approvalId },
    });
    if (!approval) throw new NotFoundException('Approval request not found');

    const membership = await this.companies.assertMember(userId, approval.companyId);
    const canDecide = ['owner', 'admin', 'manager'].includes(membership.role);
    if (!canDecide) {
      throw new ForbiddenException('Only owner/admin/manager can decide approvals');
    }

    const updated = await this.prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status: dto.status,
        resolvedByUserId: userId,
        resolutionNote: dto.note ?? null,
        resolvedAt: new Date(),
      },
    });

    this.realtime.emitApprovalUpdated(approval.companyId, {
      type: 'decided',
      approval: updated,
    });

    return updated;
  }
}
