import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { JwtAuthGuard } from '@/infra/auth/jwt.auth.guard'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema)

type PageQueryParamsSchema = z.infer<typeof pageQueryParamsSchema>

@Controller(`/questions`)
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamsSchema,
  ) {
    const perPage = 20

    const questions = await this.prisma.question.findMany({
      take: perPage,
      skip: perPage * (page - 1),
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      questions,
    }
  }
}
