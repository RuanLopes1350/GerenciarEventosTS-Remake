import { z } from 'zod';

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export const eventoSchema = z.object({
    nome: z.string().min(3,'Nome do Evento precisa ter no mínimo 3 letras').max(50,'Nome do Evento pode ter no máximo 50 letras'),
    data: z.string().refine((val) => dateRegex.test(val), {
        message: "Data deve estar no formato DD/MM/AAAA",
    }),
});