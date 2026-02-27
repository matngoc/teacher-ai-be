import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

export interface IUserContext {
  userId?: number;
  username?: string;
  roles?: string[];
  permissions?: string[];
}

export const USER_CONTEXT_KEY = 'userContext';

@Injectable()
export class UserContextService {
  constructor(private readonly cls: ClsService) {}

  set(context: IUserContext): void {
    this.cls.set(USER_CONTEXT_KEY, context);
  }

  get(): IUserContext | undefined {
    return this.cls.get<IUserContext>(USER_CONTEXT_KEY);
  }

  getUserId(): number | undefined {
    return this.get()?.userId;
  }

  getRoles(): string[] {
    return this.get()?.roles ?? [];
  }

  getPermissions(): string[] {
    return this.get()?.permissions ?? [];
  }
}
