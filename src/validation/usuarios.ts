import { z } from 'zod';

export const usuarioSchema = z.object({
    nome: z.string().min(3).max(50),
    email: z.string().email(),
    senha: z.string()
        .regex(/[a-z]/, 'Senha precisa conter pelo menos um caractere minusculo!')
        .regex(/[A-Z]/, 'Senha precisa conter pelo menos um caractere Maiusculo!')
        .regex(/\d/, 'Senha precisa conter pelo menos um número!')
        .regex(/[!@#$%^&(),.?]/, 'Senha precisa conter pelo menos um caractere especial!')
})