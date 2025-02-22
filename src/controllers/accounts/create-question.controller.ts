import { BadGatewayException, Body, Controller, HttpCode, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TokenPayloadSchema } from 'src/auth/jwt.strategy';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';

const createQuestionSchema = z.object({
    title: z.string(),
    content: z.string(),
})

type CreateQuestionSchema = z.infer<typeof createQuestionSchema>

const validationSchema = new ZodValidationPipe(createQuestionSchema)

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(
        private prisma: PrismaService
    ) {}

    @Post()
    @HttpCode(200)
    async handle(
        @CurrentUser() user: TokenPayloadSchema,
        @Body(validationSchema) body: CreateQuestionSchema
    ) {
        const { title, content } = body

        const authorId = user.sub

        const question = await this.prisma.question.create({
            data: {
                title,
                content,
                slug: this.convertToSlug(title),
                authorId
            }
        })

        if (!question) {
            throw new BadGatewayException("Question not created")
        }

        return question
    }

    private convertToSlug(title: string) {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9 ]/g, "")
            .replace(/\s+/g, "-")
    }
}