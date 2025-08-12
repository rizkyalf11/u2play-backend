/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import {
  CreateNotificationDto,
  FindAllNotificationsDto,
  UpdateNotificationDto,
} from './notifications.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class NotificationsService extends BaseResponse {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async create(data: CreateNotificationDto) {
    const senderId = this.req.user.id; // ambil user login

    // 🔹 Cek apakah recipient ada di tabel users
    const recipientExists = await this.prisma.user.findUnique({
      where: { id: data.recipient_id },
    });

    if (!recipientExists) {
      throw new NotFoundException(
        `Recipient with ID ${data.recipient_id} not found`,
      );
    }

    const notification = await this.prisma.notifications.create({
      data: {
        sender_id: senderId,
        recipient_id: data.recipient_id,
        content: data.content,
        link: data.link,
      },
    });

    return {
      success: true,
      message: 'Notification created successfully',
      data: notification,
    };
  }
  async findAll(query: FindAllNotificationsDto) {
    const { page = 1, pageSize = 10, is_read, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    // 🔹 Otomatis filter berdasarkan user login
    where.recipient_id = this.req.user.id;

    if (typeof is_read === 'boolean') where.is_read = is_read;
    if (keyword) where.content = { contains: keyword };

    const [notifications, total] = await Promise.all([
      this.prisma.notifications.findMany({
        where,
        skip,
        take: +pageSize,
        orderBy: { created_at: 'desc' },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.notifications.count({ where }),
    ]);

    return this._pagination(
      'Notifications fetched successfully',
      notifications,
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: number) {
    const notif = await this.prisma.notifications.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    });
    if (!notif)
      throw new NotFoundException(`Notification with ID ${id} not found`);
    return notif;
  }

  async markAsRead(id: number) {
    await this.findOne(id);
    const updated = await this.prisma.notifications.update({
      where: { id },
      data: { is_read: true },
    });
    return {
      success: true,
      message: 'Notification marked as read',
      data: updated,
    };
  }

  async update(id: number, data: UpdateNotificationDto) {
    await this.findOne(id);
    const updated = await this.prisma.notifications.update({
      where: { id },
      data,
    });
    return {
      success: true,
      message: 'Notification updated successfully',
      data: updated,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.notifications.delete({ where: { id } });
    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  }
}
