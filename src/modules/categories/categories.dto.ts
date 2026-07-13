import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Eletrônicos', description: 'Nome da categoria' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 1, description: '0=Rascunho, 1=Ativo, 2=Deletado', default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Eletrônicos e Acessórios', description: 'Nome da categoria' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 1, description: '0=Rascunho, 1=Ativo, 2=Deletado' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  status?: number;
}

export class FindCategoriesQueryDto {
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

  @ApiPropertyOptional({ example: '1', description: '0=Rascunho, 1=Ativo, 2=Deletado. Use vírgula para múltiplos: 0,1' })
  @IsOptional()
  @IsString()
  status?: string;
}
