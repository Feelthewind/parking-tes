import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { User } from "../auth/user.entity";

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as Partial<User>;
    return !user.isSharing;
  }
}
