import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../controllers/create-question.controller';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user as TokenPayload;
  },
);
