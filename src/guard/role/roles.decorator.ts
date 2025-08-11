import { Reflector } from '@nestjs/core';
import { AuthRole } from '@prisma/client';

export const Roles = Reflector.createDecorator<AuthRole[]>();