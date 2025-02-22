import { BadGatewayException, Body, Controller, Get, HttpCode, Query, UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';

const pageQuerySchema = z.object({
    page: z.string().optional().default('1').transform(Number).pipe(
        z.number().min(1)
    ),
})

type PageQuerySchema = z.infer<typeof pageQuerySchema>

const queryValidationPipe = new ZodValidationPipe(pageQuerySchema)

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
    constructor(
        private prisma: PrismaService
    ) {}

    @Get()
    @HttpCode(200)
    async handle(
        @Query(queryValidationPipe) query: PageQuerySchema
    ) {
        const perPage = 1

        const { page } = query
        const questions = await this.prisma.question.findMany({
            take: perPage ,
            skip: (page - 1) * perPage,
            orderBy: {
                createdAt: 'desc'
            }
        })

        return { questions }
    }
}