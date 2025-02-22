import { BadRequestException, UsePipes } from "@nestjs/common";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { hash } from "bcryptjs";
import { ZodValidationPipe } from "src/pipes/zod-validation.pipe";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";

const createAccountBodySchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string().min(6)
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>


@Controller('/accounts')
export class CreateAccountController{
    constructor(private prismaService: PrismaService) {}
    
    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(createAccountBodySchema))
    async handle(@Body() body: CreateAccountBodySchema) {
        const { name, email, password } = body

        const userAlreadyExists = await this.prismaService.user.findUnique(
            {
                where: {
                    email
                }
            }
        )

        if (userAlreadyExists) {
            throw new BadRequestException('User with same email already exists')
        }

        const hashedPassword = await hash(password, 8)

        await this.prismaService.user.create(
            {
                data: {
                    name,
                    email,
                    password: hashedPassword
                }
            }
        )
    }
}