import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
}

/**
 * Lấy user từ request: @CurrentUser() user: JwtPayload
 * Lấy field cụ thể:   @CurrentUser('userId') id: number
 */
export const CurrentUser = createParamDecorator(
  (field: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload = request.user;
    return field ? user?.[field] : user;
  },
);
