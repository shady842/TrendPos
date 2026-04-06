import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.userCompany.findMany({
      where: { userId },
      include: {
        company: {
          include: {
            branches: { where: { isActive: true }, orderBy: { name: 'asc' } },
          },
        },
      },
    });
  }

  async assertMember(userId: string, companyId: string) {
    const m = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: { userId, companyId },
      },
    });
    if (!m) throw new ForbiddenException('Not a member of this company');
    return m;
  }
}
