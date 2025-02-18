import { faker } from '@faker-js/faker/locale/pt_BR';
import sqlite3 from 'sqlite3';
import { z } from 'zod';
import { logger } from '../utils/logs';


const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;


export const eventoSchema = z.object({
  nome: z.string().min(3, 'Nome do Evento precisa ter no mínimo 3 letras').max(50, 'Nome do Evento pode ter no máximo 50 letras'),
  data: z.string().refine((val) => dateRegex.test(val), {
    message: "Data deve estar no formato DD/MM/AAAA",
  }),
});


const db = new sqlite3.Database('./data/BancoEventos.db');


const inserirEventosFakes = (quantidade: number) => {
  for (let i = 0; i < quantidade; i++) {

    const nome = faker.commerce.productName();
    const data = faker.date.future().toLocaleDateString('pt-BR');
    const usuario_ID = faker.number.int({ min: 2, max: 4 });


    const eventoValido = eventoSchema.safeParse({ nome, data });

    if (!eventoValido.success) {
      eventoValido.error.errors.forEach((e) => console.log(`Erro de validação: ${e.message}`));
      continue;
    }


    const query = `
            INSERT INTO Eventos (nome, data, usuario_ID)
            VALUES (?, ?, ?)
        `;


    db.run(query, [nome, data, usuario_ID], function (erro) {
      if (erro) {
        console.error("Erro ao inserir evento:", erro.message);
      } else {
        logger.info(`Evento Teste ${this.lastID} inserido no banco através da Biblioteca Faker-JS!`)
        console.log(`Evento inserido com ID: ${this.lastID}`);
      }
    });
  }
};


inserirEventosFakes(5);


db.close((err) => {
  if (err) {
    console.error("Erro ao fechar banco:", err.message);
  } else {
    console.log("Banco de dados fechado.");
  }
});