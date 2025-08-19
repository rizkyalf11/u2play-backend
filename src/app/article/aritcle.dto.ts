// src/app/articles/articles.dto.ts
import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Visibility } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class ArticleDTO {
  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 1 })
  id?: number;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'Author ID' })
  author_id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Judul Artikel' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Slug-artikel' })
  slug: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Deskripsi artikel' })
  description: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: 2, description: 'Category ID' })
  category_id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Konten panjang artikel' })
  content: string;

  @IsEnum(Visibility)
  @IsOptional()
  @ApiProperty({ enum: Visibility, default: Visibility.PRIVATE })
  visibility?: Visibility;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ApiProperty({ example: [1, 2], description: 'Array of Tag IDs' })
  tag_ids?: number[];
}

export class findAllArticlesDto extends PageRequestDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Judul artikel' })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'kata kunci pencarian' })
  keyword?: string;
}

export class DeleteBulkArticleDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'Array of article IDs to delete',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}

export class ArticleDetailQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Max popular articles' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  popularLimit?: number = 1;

  @ApiPropertyOptional({ example: 1, description: 'Max latest articles' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  latestLimit?: number = 1;

  @ApiPropertyOptional({ example: 1, description: 'Max recommended articles' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  recommendationLimit?: number = 1;
}

export class CreateArticleDto extends PickType(ArticleDTO, [
  'author_id',
  'title',
  'slug',
  'description',
  'category_id',
  'content',
  'visibility',
  'tag_ids',
]) {}

export class UpdateArticleDto extends PickType(ArticleDTO, [
  'title',
  'slug',
  'description',
  'category_id',
  'content',
  'visibility',
  'tag_ids',
]) {}
