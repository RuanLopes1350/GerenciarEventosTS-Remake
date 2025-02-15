import readline from 'readline';
import sqlite3, { Database } from "sqlite3";
import { fakerPT_BR } from '@faker-js/faker';

// export const db = new sqlite3.Database('./data/BancoEventos.db')

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// //criação função perguntar
// export const perguntar = (pergunta: string): Promise<string> => {
//     return new Promise((resolve) => {
//         rl.question(pergunta, (resposta) => {
//             console.log('');
//             resolve(resposta);
//         });
//     });
// };

// const main = async () => {}

function generateDeliveryAddress() {
    const firstName = fakerPT_BR.person.firstName();
    const lastName = fakerPT_BR.person.lastName();

    let nome = fakerPT_BR.person.fullName({ firstName, lastName })
    let email = fakerPT_BR.internet.email({ firstName, lastName })
    let pessoa = {
        nome: nome,
        email: email
    }
    console.table(pessoa)
}

generateDeliveryAddress();