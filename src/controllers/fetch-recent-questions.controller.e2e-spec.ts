import { AppModule } from '@/app.module'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { expect } from 'vitest'

describe('Create Question (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: await hash('password', 8),
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    // Create a question
    await prisma.question.createMany({
      data: [
        {
          title: 'New Question',
          slug: 'new-question',
          content: 'I need help',
          authorId: user.id,
        },
        {
          title: 'Another Question',
          slug: 'another-question',
          content: 'I need help, again.',
          authorId: user.id,
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)

    expect(response.body).toEqual({
      questions: [
        expect.objectContaining({
          title: 'New Question',
          slug: 'new-question',
          content: 'I need help',
        }),
        expect.objectContaining({
          title: 'Another Question',
          slug: 'another-question',
          content: 'I need help, again.',
        }),
      ],
    })
  })
})
