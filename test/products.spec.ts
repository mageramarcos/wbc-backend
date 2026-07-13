import { describe, it, expect, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { ProductsService } from '../src/modules/products/products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrisma = {
    product: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  describe('create', () => {
    it('creates product when category exists', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 1, name: 'Cat' });
      mockPrisma.product.create.mockResolvedValue({
        id: 1,
        name: 'Test Product',
        price: 10.0,
        stock: 5,
      });

      const dto = { name: 'Test Product', price: 10.0, stock: 5, categoryId: 1 };
      const result = await service.create(dto);

      expect(result.name).toBe('Test Product');
    });

    it('throws when category does not exist', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      const dto = { name: 'Test', price: 10.0, stock: 5, categoryId: 999 };
      await expect(service.create(dto)).rejects.toThrow('not found');
    });
  });

  describe('findAll', () => {
    it('returns paginated products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([{ id: 1, name: 'P1' }]);
      mockPrisma.product.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.meta).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('throws when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Product not found');
    });
  });

  describe('remove', () => {
    it('soft deletes product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: 1, name: 'P1' });
      const now = new Date();
      mockPrisma.product.update.mockResolvedValue({ id: 1, status: 2, deletedAt: now });

      const result = await service.remove(1);
      expect(result.status).toBe(2);
    });
  });
});
