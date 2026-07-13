import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, FindCategoriesQueryDto } from './categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        status: dto.status ?? 0,
      },
    });
  }

  async findAll(query: FindCategoriesQueryDto) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where = this.buildStatusFilter(status);

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      items: data,
      meta: { page, limit, total },
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: { select: { id: true, name: true } } },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({ where: { id } });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const productCount = await tx.product.count({
        where: { categoryId: id, status: { not: 2 } },
      });

      if (productCount > 0) {
        throw new ConflictException('Cannot delete category with active products');
      }

      return tx.category.update({
        where: { id },
        data: { status: 2, deletedAt: new Date() },
      });
    });
  }

  private buildStatusFilter(status?: string) {
    if (!status) {
      return { status: { equals: 1 } };
    }

    const statusValues = status.split(',').map(Number);
    return { status: { in: statusValues } };
  }
}
