import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import type { Request } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type TokenPayload = z.infer<typeof authenticateBodySchema>;

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post()
  async handle(@CurrentUser() user: TokenPayload) {
    console.log(user);

    return `ok`;
  }
}
