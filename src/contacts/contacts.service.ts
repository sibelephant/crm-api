import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createContactDto: CreateContactDto) {
    // Check if email already exists
    const existingContact = await this.prisma.contact.findUnique({
      where: { email: createContactDto.email },
    });

    if (existingContact && !existingContact.deletedAt) {
      throw new ConflictException('Contact with this email already exists');
    }

    // If companyId is provided, verify it exists
    if (createContactDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: {
          id: createContactDto.companyId,
          deletedAt: null,
        },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    const contact = await this.prisma.contact.create({
      data: createContactDto,
      include: {
        company: true,
      },
    });

    return this.addFullName(contact);
  }

  async findAll(page: number = 1, limit: number = 20, status?: string, companyId?: string) {
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (status) {
      where.status = status;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      data: contacts.map((contact) => this.addFullName(contact)),
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
    const contact = await this.prisma.contact.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        company: true,
      },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return this.addFullName(contact);
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    // Check if contact exists
    await this.findOne(id);

    // If email is being updated, check for conflicts
    if (updateContactDto.email) {
      const existingContact = await this.prisma.contact.findFirst({
        where: {
          email: updateContactDto.email,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (existingContact) {
        throw new ConflictException('Contact with this email already exists');
      }
    }

    // If companyId is being updated, verify it exists
    if (updateContactDto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: {
          id: updateContactDto.companyId,
          deletedAt: null,
        },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
      include: {
        company: true,
      },
    });

    return this.addFullName(contact);
  }

  async remove(id: string): Promise<void> {
    // Check if contact exists
    await this.findOne(id);

    // Soft delete contact
    await this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getContactActivities(id: string, page: number = 1, limit: number = 20) {
    // Check if contact exists
    await this.findOne(id);

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: { contactId: id },
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
        where: { contactId: id },
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

  async getContactDeals(id: string, page: number = 1, limit: number = 20) {
    // Check if contact exists
    await this.findOne(id);

    const skip = (page - 1) * limit;

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where: {
          contactId: id,
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
          company: true,
        },
      }),
      this.prisma.deal.count({
        where: {
          contactId: id,
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

  private addFullName(contact: any) {
    return {
      ...contact,
      fullName: `${contact.firstName} ${contact.lastName}`,
    };
  }
}
