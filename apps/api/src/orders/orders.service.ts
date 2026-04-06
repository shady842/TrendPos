import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { RequestOrderApprovalDto } from './dto/request-order-approval.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companies: CompaniesService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: dto.branchId },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    await this.companies.assertMember(userId, branch.companyId);

    if (dto.clientOrderId) {
      const existing = await this.prisma.order.findUnique({
        where: {
          companyId_clientOrderId: {
            companyId: branch.companyId,
            clientOrderId: dto.clientOrderId,
          },
        },
        include: { lines: true },
      });
      if (existing) {
        throw new ConflictException(
          'Order with this clientOrderId already exists',
        );
      }
    }

    let subtotal = 0;
    const lineRows = dto.lines.map((l) => {
      const lineTotal = l.quantity * l.unitPriceCents;
      subtotal += lineTotal;
      return {
        menuItemId: l.menuItemId ?? null,
        name: l.name,
        quantity: l.quantity,
        unitPriceCents: l.unitPriceCents,
        lineTotalCents: lineTotal,
      };
    });

    const order = await this.prisma.order.create({
      data: {
        companyId: branch.companyId,
        branchId: branch.id,
        channel: dto.channel ?? 'dine_in',
        subtotalCents: subtotal,
        totalCents: subtotal,
        clientOrderId: dto.clientOrderId,
        clientUpdatedAt: dto.clientOrderId ? new Date() : null,
        lines: { create: lineRows },
      },
      include: { lines: true, branch: true },
    });

    this.realtime.emitOrderUpdated(branch.companyId, {
      type: 'created',
      order,
    });

    return order;
  }

  async listForBranch(userId: string, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    await this.companies.assertMember(userId, branch.companyId);

    return this.prisma.order.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { lines: true },
    });
  }

  async requestApproval(
    userId: string,
    orderId: string,
    dto: RequestOrderApprovalDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { branch: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    await this.companies.assertMember(userId, order.companyId);

    const approval = await this.prisma.approvalRequest.create({
      data: {
        companyId: order.companyId,
        branchId: dto.branchId ?? order.branchId,
        type: dto.type,
        requestedByUserId: userId,
        payload: {
          orderId,
          note: dto.note ?? null,
          amountCents: dto.amountCents ?? null,
          orderTotalCents: order.totalCents,
        },
      },
    });

    this.realtime.emitApprovalUpdated(order.companyId, {
      type: 'created',
      approval,
      source: 'pos-order-action',
    });

    return approval;
  }
}
