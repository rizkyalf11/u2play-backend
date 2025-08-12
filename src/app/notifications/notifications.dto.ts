import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class NotificationDTO {
  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 1, description: 'Notification ID (auto increment)' })
  id?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({ example: 2, description: 'Sender User ID (optional)' })
  sender_id?: number;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    example: 5,
    description: 'Recipient User ID (optional)',
  })
  recipient_id?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'You have a new message',
    description: 'Notification content',
  })
  content: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: false,
    description: 'Read status of notification',
  })
  is_read?: boolean;

  @IsString()
  @IsUrl({}, { message: 'link must be a valid URL' })
  @IsNotEmpty()
  @ApiProperty({
    example: 'https://example.com',
    description: 'Link related to notification',
  })
  link: string;
}

export class CreateNotificationDto extends PickType(NotificationDTO, [
  'recipient_id',
  'content',
  'link',
]) {}

export class UpdateNotificationDto extends PickType(NotificationDTO, [
  'content',
  'is_read',
  'link',
]) {}

export class FindAllNotificationsDto extends PageRequestDto {
  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ example: false, description: 'Filter by read/unread' })
  is_read?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'message',
    description: 'Keyword search in content',
  })
  keyword?: string;
}
