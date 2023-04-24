import { Injectable, CanActivate } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { user } = ctx.switchToHttp().getRequest();

    const superuser: string = this.configService.get('SUPERUSER'),
      pass: string = this.configService.get('SUPERUSER_PASS');

    // admin homologation
    if (user.username === superuser && user.pass === pass) return true;

    return false;
  }
}
