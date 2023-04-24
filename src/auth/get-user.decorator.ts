import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser: any = createParamDecorator(
  (_data: any, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest();

    return user;
  },
);
