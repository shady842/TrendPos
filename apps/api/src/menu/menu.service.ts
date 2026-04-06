import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companies: CompaniesService,
  ) {}

  async getMenu(userId: string, companyId: string) {
    await this.companies.assertMember(userId, companyId);
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        menuCategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              where: { isActive: true },
              orderBy: { name: 'asc' },
            },
          },
        },
        menuItems: {
          where: { isActive: true, categoryId: null },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async createItem(
    userId: string,
    data: {
      companyId: string;
      name: string;
      basePriceCents: number;
      sku?: string;
      categoryId?: string;
    },
  ) {
    await this.companies.assertMember(userId, data.companyId);
    return this.prisma.menuItem.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        basePriceCents: data.basePriceCents,
        sku: data.sku ?? null,
        categoryId: data.categoryId ?? null,
      },
    });
  }
}
