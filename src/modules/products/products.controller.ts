import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, Inject, UseInterceptors,
} from '@nestjs/common';
import { CACHE_MANAGER, CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, FindProductsQueryDto } from './products.dto';

@ApiTags('Produtos')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo produto' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso', type: CreateProductDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Categoria informada não existe' })
  async create(@Body() dto: CreateProductDto) {
    await this.invalidateProductsCache();
    return this.productsService.create(dto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @ApiOperation({ summary: 'Listar produtos com paginação e filtros' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página' })
  @ApiQuery({ name: 'status', required: false, description: '0=Rascunho, 1=Ativo, 2=Deletado' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'priceMin', required: false, description: 'Preço mínimo' })
  @ApiQuery({ name: 'priceMax', required: false, description: 'Preço máximo' })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por nome (parcial)' })
  @ApiResponse({ status: 200, description: 'Lista de produtos retornada', type: [CreateProductDto] })
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  @ApiOperation({ summary: 'Buscar produto por ID (inclui dados da categoria)' })
  @ApiResponse({ status: 200, description: 'Produto encontrado', type: CreateProductDto })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Produto atualizado', type: UpdateProductDto })
  @ApiResponse({ status: 404, description: 'Produto ou categoria não encontrada' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    await this.invalidateProductsCache();
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir produto (soft delete)' })
  @ApiResponse({ status: 200, description: 'Produto excluído' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.invalidateProductsCache();
    return this.productsService.remove(id);
  }

  private async invalidateProductsCache() {
    await this.cacheManager.clear();
  }
}
