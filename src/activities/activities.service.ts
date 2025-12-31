import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createActivityDto: CreateActivityDto, userId: string) {
    // Verify contact exists if provided
    if (createActivityDto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: {
          id: createActivityDto.contactId,
          deletedAt: null,
        },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    // Verify deal exists if provided
    if (createActivityDto.dealId) {
      const deal = await this.prisma.deal.findFirst({
        where: {
          id: createActivityDto.dealId,
          deletedAt: null,
        },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }
    }

    return this.prisma.activity.create({
      data: {
        ...createActivityDto,
        userId,
      },
      include: {
        user: {
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
        deal: {
          select: {
            id: true,
            title: true,
            stage: true,
          },
        },
      },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    type?: string,
    contactId?: string,
    dealId?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) where.type = type;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
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
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          deal: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.activity.count({ where }),
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

  async findOne(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        user: {
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
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
            stage: true,
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto) {
    await this.findOne(id);

    // Verify contact exists if being updated
    if (updateActivityDto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: {
          id: updateActivityDto.contactId,
          deletedAt: null,
        },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    // Verify deal exists if being updated
    if (updateActivityDto.dealId) {
      const deal = await this.prisma.deal.findFirst({
        where: {
          id: updateActivityDto.dealId,
          deletedAt: null,
        },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }
    }

    return this.prisma.activity.update({
      where: { id },
      data: updateActivityDto,
      include: {
        user: true,
        contact: true,
        deal: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.activity.delete({
      where: { id },
    });
  }

  async markComplete(id: string) {
    await this.findOne(id);
    return this.prisma.activity.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  }

  async getUpcoming(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.activity.findMany({
      where: {
        userId,
        dueDate: {
          gte: today,
        },
        completedAt: null,
      },
      orderBy: { dueDate: 'asc' },
      include: {
        contact: {
          select: { firstName: true, lastName: true },
        },
        deal: {
          select: { title: true },
        },
      },
    });
  }

  async getOverdue(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.activity.findMany({
      where: {
        userId,
        dueDate: {
          lt: today,
        },
        completedAt: null,
      },
      orderBy: { dueDate: 'asc' },
      include: {
        contact: {
          select: { firstName: true, lastName: true },
        },
        deal: {
          select: { title: true },
        },
      },
    });
  }
}
