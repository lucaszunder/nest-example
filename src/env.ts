import { z } from "zod";

export const envSchema = z.object({
    PORT: z.coerce.number().default(3333),
    JWT_PUBLIC_KEY: z.string(),
    JWT_PRIVATE_KEY: z.string(),
    DATABASE_URL: z.string(),
})

export type Env = z.infer<typeof envSchema>