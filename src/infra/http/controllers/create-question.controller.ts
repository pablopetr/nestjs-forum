import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { z } from 'zod'
import { JwtAuthGuard } from '@/infra/auth/jwt.auth.guard'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateQuestionBodySchema,
    @CurrentUser()
    user: UserPayload,
  ) {
    const { title, content } = body

    await this.prisma.question.create({
      data: {
        title,
        slug: this.convertToSlug(title),
        content,
        authorId: user.sub,
      },
    })
  }

  private convertToSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }
}
