import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { DealStage } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createDealDto: CreateDealDto, userId: string) {
    // Verify contact exists if provided
    if (createDealDto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: {
          id: createDealDto.contactId,
          deletedAt: null,
        },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    // Verify company exists if provided
    if (createDealDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: {
          id: createDealDto.companyId,
          deletedAt: null,
        },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    return this.prisma.deal.create({
      data: {
        ...createDealDto,
        ownerId: userId,
      },
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
        company: true,
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    stage?: string,
    ownerId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (stage) {
      where.stage = stage;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
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
          company: true,
        },
      }),
      this.prisma.deal.count({ where }),
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

  async findOne(id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: {
        id,
        deletedAt: null,
      },
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
        company: true,
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }

  async update(id: string, updateDealDto: UpdateDealDto) {
    // Check if deal exists
    await this.findOne(id);

    // Verify contact exists if being updated
    if (updateDealDto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: {
          id: updateDealDto.contactId,
          deletedAt: null,
        },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    // Verify company exists if being updated
    if (updateDealDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: {
          id: updateDealDto.companyId,
          deletedAt: null,
        },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    return this.prisma.deal.update({
      where: { id },
      data: updateDealDto,
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
        company: true,
      },
    });
  }

  async updateStage(id: string, updateStageDto: UpdateStageDto) {
    // Check if deal exists
    await this.findOne(id);

    const data: any = { stage: updateStageDto.stage };

    // Auto-set actualCloseDate for closed deals
    if (
      updateStageDto.stage === DealStage.CLOSED_WON ||
      updateStageDto.stage === DealStage.CLOSED_LOST
    ) {
      data.actualCloseDate = new Date();
    }

    return this.prisma.deal.update({
      where: { id },
      data,
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
        company: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    // Check if deal exists
    await this.findOne(id);

    // Soft delete deal
    await this.prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getDealActivities(id: string, page: number = 1, limit: number = 20) {
    // Check if deal exists
    await this.findOne(id);

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { dealId: id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.activity.count({
        where: { dealId: id },
      }),
    ]);

    return {
      data: activities,
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

  async getPipelineSummary() {
    const deals = await this.prisma.deal.findMany({
      where: { deletedAt: null },
      select: {
        stage: true,
        amount: true,
        probability: true,
      },
    });

    // Group deals by stage
    const stageGroups = new Map<DealStage, any[]>();
    for (const stage of Object.values(DealStage)) {
      stageGroups.set(stage, []);
    }

    for (const deal of deals) {
      stageGroups.get(deal.stage)?.push(deal);
    }

    // Calculate metrics per stage
    const stages = Array.from(stageGroups.entries()).map(([stage, stageDeals]) => {
      const count = stageDeals.length;
      const totalAmount = stageDeals.reduce(
        (sum, deal) => sum + Number(deal.amount),
        0,
      );
      const weightedAmount = stageDeals.reduce(
        (sum, deal) => sum + Number(deal.amount) * (deal.probability / 100),
        0,
      );

      return {
        stage,
        count,
        totalAmount: Number(totalAmount.toFixed(2)),
        weightedAmount: Number(weightedAmount.toFixed(2)),
      };
    });

    // Calculate totals
    const totalDeals = deals.length;
    const totalPipelineValue = Number(
      deals.reduce((sum, deal) => sum + Number(deal.amount), 0).toFixed(2),
    );
    const totalWeightedValue = Number(
      deals
        .reduce(
          (sum, deal) => sum + Number(deal.amount) * (deal.probability / 100),
          0,
        )
        .toFixed(2),
    );

    return {
      stages,
      totalDeals,
      totalPipelineValue,
      totalWeightedValue,
    };
  }
}
