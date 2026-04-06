import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class FloorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companies: CompaniesService,
  ) {}

  async listTables(userId: string, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    await this.companies.assertMember(userId, branch.companyId);
    return this.prisma.diningTable.findMany({
      where: { branchId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createTable(
    userId: string,
    branchId: string,
    data: { label: string; seats?: number; posX?: number; posY?: number },
  ) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    await this.companies.assertMember(userId, branch.companyId);
    return this.prisma.diningTable.create({
      data: {
        branchId,
        label: data.label,
        seats: data.seats ?? 4,
        posX: data.posX ?? 0,
        posY: data.posY ?? 0,
      },
    });
  }
}
