import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({
        where: { deletedAt: null },
      }),
    ]);

    return {
      data: companies,
      meta: {
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    // Check if company exists
    await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string): Promise<void> {
    // Check if company exists
    await this.findOne(id);

    // Soft delete company
    await this.prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getCompanyContacts(id: string, page: number = 1, limit: number = 20) {
    // Check if company exists
    await this.findOne(id);

    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where: {
          companyId: id,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({
        where: {
          companyId: id,
          deletedAt: null,
        },
      }),
    ]);

    return {
      data: contacts,
      meta: {
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    };
  }

  async getCompanyDeals(id: string, page: number = 1, limit: number = 20) {
    // Check if company exists
    await this.findOne(id);

    const skip = (page - 1) * limit;

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where: {
          companyId: id,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.deal.count({
        where: {
          companyId: id,
          deletedAt: null,
        },
      }),
    ]);

    return {
      data: deals,
      meta: {
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    };
  }
}
