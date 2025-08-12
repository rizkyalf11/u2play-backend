import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PageRequestDto {
  @ApiPropertyOptional({ example: 1, description: 'Nomor halaman' })
  @IsInt()
  @Type(() => Number)
  page = 1;

  @ApiPropertyOptional({ example: 20, description: 'Jumlah data per halaman' })
  @IsInt()
  @Type(() => Number)
  pageSize = 20;

  
  @IsInt()
  @IsOptional()
  limit;
}