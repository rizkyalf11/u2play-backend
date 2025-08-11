import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService]
})
export class CategoriesModule {}
