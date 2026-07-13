import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, FindProductsQueryDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({ where: { id: dto.categoryId } });

      if (!category) {
        throw new NotFoundException(`Category with id ${dto.categoryId} not found`);
      }

      return tx.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          stock: dto.stock,
          categoryId: dto.categoryId,
          status: dto.status ?? 0,
        },
      });
    });
  }

  async findAll(query: FindProductsQueryDto) {
    const { page = 1, limit = 10, status, categoryId, priceMin, priceMax, search } = query;
    const skip = (page - 1) * limit;

    const where = this.buildFilters({ status, categoryId, priceMin, priceMax, search });

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: data,
      meta: { page, limit, total },
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (dto.categoryId) {
        const category = await tx.category.findUnique({ where: { id: dto.categoryId } });

        if (!category) {
          throw new NotFoundException(`Category with id ${dto.categoryId} not found`);
        }
      }

      return tx.product.update({
        where: { id },
        data: dto,
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: { status: 2, deletedAt: new Date() },
    });
  }

  private buildStatusFilter(status?: string) {
    if (!status) {
      return { equals: 1 };
    }
    const values = status.split(',').map(Number);
    return { in: values };
  }

  private buildFilters(filters: {
    status?: string;
    categoryId?: number;
    priceMin?: number;
    priceMax?: number;
    search?: string;
  }) {
    const where: Record<string, unknown> = {};
    where.status = this.buildStatusFilter(filters.status);

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.price = {};
      if (filters.priceMin !== undefined) {
        (where.price as Record<string, number>).gte = filters.priceMin;
      }
      if (filters.priceMax !== undefined) {
        (where.price as Record<string, number>).lte = filters.priceMax;
      }
    }

    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    return where;
  }
}
