import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { PUBLIC } from './public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JWTGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<string>(PUBLIC, [
      ctx.getHandler(),
    ]);

    // public route
    if (isPublic) return true;

    return super.canActivate(ctx);
  }
}
