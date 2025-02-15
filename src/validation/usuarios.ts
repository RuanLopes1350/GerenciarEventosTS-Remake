import { z } from 'zod';

export const usuarioSchema = z.object({
    nome: z.string().min(3,'Nome deve ter no minimo 3 letras').max(50,'Nome pode ter no máximo 50 letras'),
    email: z.string().email('Formato de email incorreto!'),
    senha: z.string()
        .regex(/[a-z]/, 'Senha precisa conter pelo menos um caractere minusculo!')
        .regex(/[A-Z]/, 'Senha precisa conter pelo menos um caractere Maiusculo!')
        .regex(/\d/, 'Senha precisa conter pelo menos um número!')
        .regex(/[!@#$%^&(),.?]/, 'Senha precisa conter pelo menos um caractere especial!')
})