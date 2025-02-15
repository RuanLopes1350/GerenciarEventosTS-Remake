import { db } from ".."
import { eventoSchema } from "../validation/eventos";
import { usuarioLogado } from "./Login";

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
                console.error(`Erro ao inserir evento: ${erro}`);
                reject(erro);
            } else {
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
                console.error(`Erro ao listar eventos: ${erro}`);
                reject(erro);
            } else {
                console.table(linhas);
                resolve();
            }
        });
    });
}

export async function localizarEvento(id: number, usuario_logado_id: number): Promise<boolean> {
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
                console.error(`Erro ao listar evento: ${erro}`);
                reject(erro);
            } else {
                console.table(linha);
                resolve(true);
            }
        });
    });
}

export async function editarEvento(id: number, nome: string, data: string, usuario_ID: number, usuario_logado_id: number) {
    let eventoExistente: any[] = [];
    const queryLocalizar = `
        SELECT * FROM Eventos WHERE id = ?
    `;
    const evento = await new Promise<void>((resolve, reject) => {
        db.get(queryLocalizar, [id], (erro, linha) => {
            if (erro) {
                console.error(`Erro ao localizar evento: ${erro}`);
                reject(erro);
            } else if (!linha) {
                console.log('Evento não encontrado. Verifique se o ID está correto e tente novamente!');
                resolve();
            } else {
                eventoExistente.push(linha);
                resolve();
            }
        });
    });
    if (eventoExistente.length === 0) {
        return;
    }
    let vamosEditar = {
        nome: nome && nome.trim() ? nome : eventoExistente[0].nome,
        data: data || eventoExistente[0].data,
        usuario_ID: usuario_ID || eventoExistente[0].usuario_ID
    };
    let validar = eventoSchema.safeParse(vamosEditar);
    if (!validar.success) {
        validar.error.errors.forEach(e => console.log(e.message))
        return;
    }
    
    return new Promise<void>((resolve, reject) => {
        const querySalvarEdicao = `
            UPDATE Eventos
            SET nome = ?, data = ?, usuario_ID = ?
            WHERE id = ?
        `;
        db.run(querySalvarEdicao, [vamosEditar.nome, vamosEditar.data, vamosEditar.usuario_ID, id], async (erro) => {
            if(erro) {
                console.error(`Erro ao atualizar dados do Evento: ${erro}`);
                reject(erro);
            } else {
                console.log('Evento Atualizado com sucesso!');
                console.table(vamosEditar);
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
                console.log(`Erro ao deletar evento: ${erro}`);
                reject(erro);
            } else {
                console.log(`Evento deletado com sucesso!`);
                resolve();
            }
        });
    });
}