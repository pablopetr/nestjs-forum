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

  test('[POST] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: await hash('password', 8),
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Question',
        content: 'I need help to create a question.',
      })

    expect(response.statusCode).toBe(201)

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        title: 'New Question',
      },
    })

    expect(questionOnDatabase).toBeTruthy()
  })
})
