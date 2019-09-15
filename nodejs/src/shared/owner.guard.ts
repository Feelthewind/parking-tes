import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserType } from '../auth/enum/user-type.enum';
import { User } from '../auth/user.entity';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as Partial<User>;
    return user.type === UserType.PARKING_OWNER;
  }
}
