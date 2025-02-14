import readline from 'readline';
import sqlite3, { Database } from "sqlite3";

export const db = new sqlite3.Database('./data/BancoEventos.db')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//criação função perguntar
export const perguntar = (pergunta: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(pergunta, (resposta) => {
            console.log('');
            resolve(resposta);
        });
    });
};

const main = async () => {}