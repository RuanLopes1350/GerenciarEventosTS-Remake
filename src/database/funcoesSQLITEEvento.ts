import { db } from ".."
import { eventoSchema } from "../validation/eventos";
import { usuarioLogado } from "./funcaoSQLiteLogar";
import { inserirLog } from "./funcoesSQLITELogs"

export async function criarTabelaEventos(): Promise<void> {
    const query = `
        CREATE TABLE IF NOT EXISTS Eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            data TEXT,
            usuario_ID INTEGER,
            FOREIGN KEY (usuario_ID) REFERENCES Usuarios (id)
        );
    `;
    return new Promise((resolve, reject) => {
        db.run(query, (erro) => {
            if (erro) {
                console.error(`Erro ao criar a tabela eventos: ${erro}`);
                reject(erro);
            } else {
                console.log('Tabela Eventos criada com sucesso!');
                resolve();
            }
        });
    });
}

export async function inserirEvento(nome: string, data: string, usuario_id: number): Promise<void> {
    let validacao = eventoSchema.safeParse({nome, data, })
    const query = `
        INSERT INTO Eventos (nome, data, usuario_id)
        VALUES (?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
        db.run(query, [nome, data, usuario_id], async (erro) => {
            if (erro) {
                await inserirLog(`Erro ao inserir Evento!`,usuario_id)
                console.error(`Erro ao inserir evento: ${erro}`);
                reject(erro);
            } else {
                await inserirLog(`Evento ${nome} cadastrado!`,usuario_id)
                console.log(`Evento inserido com sucesso!`);
                resolve();
            }
        });
    });
}

export async function listarEventos(usuario_logado_id: number): Promise<void> {
    const query = `
        SELECT
            Eventos.id as "Código do Evento",
            Eventos.nome as "Nome do Evento",
            Eventos.data as "Data Agendada",
            Usuarios.nome as "Usuario Que Registrou"
        FROM Eventos
        LEFT JOIN Usuarios ON Eventos.usuario_id = Usuarios.id
    `;
    return new Promise((resolve, reject) => {
        db.all(query, async (erro, linhas) => {
            if (erro) {
                await inserirLog('Erro ao listar eventos!',usuario_logado_id)
                console.error(`Erro ao listar eventos: ${erro}`);
                reject(erro);
            } else {
                await inserirLog('Listando todos os Eventos',usuario_logado_id)
                console.table(linhas);
                resolve();
            }
        });
    });
}

export async function listarEventoID(id: number, usuario_logado_id: number): Promise<void> {
    const query = `
        SELECT
            Eventos.id as "Código do Evento",
            Eventos.nome as "Nome do Evento",
            Eventos.data as "Data Agendada",
            Usuarios.nome as "Usuario Que Registrou"
        FROM Eventos
        LEFT JOIN Usuarios ON Eventos.usuario_id = Usuarios.id
        WHERE Eventos.id = ?
    `;
    return new Promise((resolve, reject) => {
        db.get(query, [id], async (erro, linha) => {
            if (erro) {
                await inserirLog('Erro ao listar evento por ID!',usuario_logado_id)
                console.error(`Erro ao listar evento: ${erro}`);
                reject(erro);
            } else {
                await inserirLog('Listando Evento por ID!',usuario_logado_id)
                console.table(linha);
                resolve();
            }
        });
    });
}

export async function deletarEvento(id: number, usuario_logado_id: number): Promise<void> {
    const query = `
        DELETE FROM Eventos WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
        db.run(query, [id], async (erro) => {
            if (erro) {
                await inserirLog(`Erro ao deletar evento de ID ${id}: ${erro.message}`, usuario_logado_id);
                console.log(`Erro ao deletar evento: ${erro}`);
                reject(erro);
            } else {
                await inserirLog(`Deletando evento de ID ${id}! Usuario${usuarioLogado.nome}`,usuario_logado_id)
                console.log(`Evento deletado com sucesso!`);
                resolve();
            }
        });
    });
}