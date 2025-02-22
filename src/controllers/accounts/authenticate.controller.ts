import { Body, Controller, HttpCode, Post, UnauthorizedException, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';
import { PrismaService } from '@/prisma/prisma.service';
import { z } from 'zod';
import { compare } from 'bcryptjs'

const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string()
})
type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
export class AuthenticateController {
    constructor(
        private jwt: JwtService,
        private prisma: PrismaService
    ) {}

    @Post()
    @HttpCode(200)
    @UsePipes(new ZodValidationPipe(authenticateBodySchema))
    async handle(@Body() body: AuthenticateBodySchema) {
        const { email, password } = body

        const user = await this.prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            throw new UnauthorizedException('Email or password incorrect')
        }

        const validatePassword = await compare(password, user.password)

        if (!validatePassword) {
            throw new UnauthorizedException('Email or password incorrect')
        }

        const accessToken = this.jwt.sign({
            sub: user.id
        })
        
        return {
            access_token: accessToken
        }
    }
}