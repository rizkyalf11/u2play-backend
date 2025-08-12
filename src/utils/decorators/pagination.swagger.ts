import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, example: 1, type: Number }),
    ApiQuery({ name: 'pageSize', required: false, example: 20, type: Number }),
  );
}
