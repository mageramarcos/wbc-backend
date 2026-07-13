import { describe, it, expect, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { CategoriesService } from '../src/modules/categories/categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockPrisma = {
    category: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(CategoriesService);
  });

  describe('create', () => {
    it('creates a category with default status 0', async () => {
      const dto = { name: 'Test Category' };
      mockPrisma.category.create.mockResolvedValue({ id: 1, ...dto, status: 0 });

      const result = await service.create(dto);
      expect(result.name).toBe('Test Category');
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Test Category', status: 0 },
      });
    });
  });

  describe('findAll', () => {
    it('returns paginated categories with default status filter', async () => {
      mockPrisma.category.findMany.mockResolvedValue([{ id: 1, name: 'Cat' }]);
      mockPrisma.category.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('throws when category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('Category not found');
    });

    it('returns category with products when found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: 1,
        name: 'Eletrônicos',
        products: [],
      });

      const result = await service.findOne(1);
      expect(result.name).toBe('Eletrônicos');
    });
  });

  describe('remove', () => {
    it('prevents deletion when category has active products', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 1, name: 'Cat' });
      mockPrisma.product.count.mockResolvedValue(5);

      await expect(service.remove(1)).rejects.toThrow('Cannot delete category with active products');
    });

    it('soft deletes when no products', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: 1, name: 'Cat' });
      mockPrisma.product.count.mockResolvedValue(0);
      const now = new Date();
      mockPrisma.category.update.mockResolvedValue({ id: 1, status: 2, deletedAt: now });

      const result = await service.remove(1);
      expect(result.status).toBe(2);
    });
  });
});
