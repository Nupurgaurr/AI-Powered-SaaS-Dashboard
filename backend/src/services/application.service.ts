import { ApplicationStatus, Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/errors';

interface GetAllOptions {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export class ApplicationService {
  async getAll(userId: string, opts: GetAllOptions) {
    const { status, search, sortBy = 'appliedDate', sortOrder = 'desc', page, limit } = opts;
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationWhereInput = {
      userId,
      ...(status && { status: status as ApplicationStatus }),
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { role: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const validSortFields = ['appliedDate', 'companyName', 'role', 'createdAt', 'nextActionDate'];
    const orderBy = validSortFields.includes(sortBy)
      ? { [sortBy]: sortOrder }
      : { appliedDate: sortOrder };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          aiReports: {
            where: { type: 'MATCH_SCORE' },
            select: { score: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
  }

  async getOne(id: string, userId: string) {
    const app = await prisma.application.findFirst({
      where: { id, userId },
      include: {
        aiReports: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!app) throw new AppError('Application not found', 404);
    return app;
  }

  async create(userId: string, data: Prisma.ApplicationUncheckedCreateInput) {
    return prisma.application.create({
      data: { ...data, userId },
    });
  }

  async update(id: string, userId: string, data: Prisma.ApplicationUpdateInput) {
    const exists = await prisma.application.findFirst({ where: { id, userId } });
    if (!exists) throw new AppError('Application not found', 404);
    return prisma.application.update({ where: { id }, data });
  }

  async delete(id: string, userId: string) {
    const exists = await prisma.application.findFirst({ where: { id, userId } });
    if (!exists) throw new AppError('Application not found', 404);
    await prisma.application.delete({ where: { id } });
  }

  async bulkDelete(ids: string[], userId: string) {
    const result = await prisma.application.deleteMany({
      where: { id: { in: ids }, userId },
    });
    return result.count;
  }
}
