import { IsString, IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Smartphone XYZ', description: 'Nome do produto' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Smartphone 128GB, tela 6.5"', description: 'Descrição do produto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1999.99, description: 'Preço unitário (mínimo 0.01)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  price!: number;

  @ApiProperty({ example: 50, description: 'Quantidade em estoque' })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock!: number;

  @ApiProperty({ example: 1, description: 'ID da categoria existente' })
  @IsInt()
  @Type(() => Number)
  categoryId!: number;

  @ApiPropertyOptional({ example: 1, description: '0=Rascunho, 1=Ativo, 2=Deletado', default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Smartphone XYZ Pro', description: 'Nome do produto' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Versão atualizada com 256GB', description: 'Descrição do produto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 2499.99, description: 'Preço unitário (mínimo 0.01)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 30, description: 'Quantidade em estoque' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @ApiPropertyOptional({ example: 2, description: 'ID da categoria existente' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({ example: 1, description: '0=Rascunho, 1=Ativo, 2=Deletado' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}

export class FindProductsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Número da página', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Itens por página', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ example: '1', description: '0=Rascunho, 1=Ativo, 2=Deletado. Use vírgula para múltiplos' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filtrar por ID da categoria' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;

  @ApiPropertyOptional({ example: 100, description: 'Preço mínimo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceMin?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Preço máximo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceMax?: number;

  @ApiPropertyOptional({ example: 'smartphone', description: 'Busca parcial por nome (case-insensitive)' })
  @IsOptional()
  @IsString()
  search?: string;
}
