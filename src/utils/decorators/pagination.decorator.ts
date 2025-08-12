/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();

    if (!!request.query.page === false) {
      //memberikan nilai default 1 jika tidak dikirim client
      request.query.page = 1;
    }
    if (!!request.query.pageSize === false) {
      //memberikan nilai default 20 jika tidak dikirim client
      request.query.pageSize = 20;
    }

    request.query.limit =
      (Number(request.query.page) - 1) * Number(request.query.pageSize);
    request.query.pageSize = +request.query.pageSize;
    request.query.page = +request.query.page;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('request', request.query);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return request.query;
  },
);
