import { z } from 'zod';

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export const eventoSchema = z.object({
    nome: z.string().min(3).max(50),
    data: z.string().refine((val) => dateRegex.test(val), {
        message: "Data deve estar no formato DD/MM/AAAA",
    }),
    usuarioCadastrou: z.string()
});