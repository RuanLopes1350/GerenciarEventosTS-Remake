import { faker } from '@faker-js/faker/locale/pt_BR';  // Importando faker no idioma PT-BR
import sqlite3 from 'sqlite3';                         // Importando sqlite3
import { z } from 'zod';                               // Importando zod

// Definindo o regex para a validação de data no formato DD/MM/AAAA
const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

// Definindo o schema de validação com o Zod
export const eventoSchema = z.object({
    nome: z.string().min(3, 'Nome do Evento precisa ter no mínimo 3 letras').max(50, 'Nome do Evento pode ter no máximo 50 letras'),
    data: z.string().refine((val) => dateRegex.test(val), {
        message: "Data deve estar no formato DD/MM/AAAA",
    }),
});

// Conectando ao banco de dados SQLite
const db = new sqlite3.Database('./data/BancoEventos.db');

// Função para gerar e inserir eventos fictícios no banco
const inserirEventosFakes = (quantidade: number) => {
    for (let i = 0; i < quantidade; i++) {
        // Gerando os dados de evento com faker
        const nome = faker.commerce.productName();   // Nome aleatório para o evento
        const data = faker.date.future().toLocaleDateString('pt-BR');  // Data futura aleatória no formato brasileiro
        const usuario_ID = faker.number.int({ min: 2, max: 4 });  // ID do usuário aleatório (supondo que você tenha usuários com IDs de 1 a 10)

        // Validando os dados com Zod
        const eventoValido = eventoSchema.safeParse({ nome, data });
        
        if (!eventoValido.success) {
            eventoValido.error.errors.forEach((e) => console.log(`Erro de validação: ${e.message}`));
            continue;  // Pula para o próximo evento se houver erro de validação
        }

        // SQL para inserir evento
        const query = `
            INSERT INTO Eventos (nome, data, usuario_ID)
            VALUES (?, ?, ?)
        `;

        // Executando a query para inserir
        db.run(query, [nome, data, usuario_ID], function (err) {
            if (err) {
                console.error("Erro ao inserir evento:", err.message);
            } else {
                console.log(`Evento inserido com ID: ${this.lastID}`);
            }
        });
    }
};

// Inserindo 5 eventos fictícios
inserirEventosFakes(5);

// Fechando a conexão com o banco após o processo
db.close((err) => {
    if (err) {
        console.error("Erro ao fechar banco:", err.message);
    } else {
        console.log("Banco de dados fechado.");
    }
});
