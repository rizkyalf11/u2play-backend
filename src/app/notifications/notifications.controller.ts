import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  FindAllNotificationsDto,
  UpdateNotificationDto,
} from './notifications.dto';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';

@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth('token')
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  create(@Body() data: CreateNotificationDto) {
    return this.notificationsService.create(data);
  }

  @Get()
  @ApiPaginationQuery()
  @ApiQuery({ name: 'is_read', required: false, example: false })
  @ApiQuery({ name: 'keyword', required: false, example: 'message' })
  async findAll(@Pagination() query: FindAllNotificationsDto) {
    return this.notificationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, data);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }
}
