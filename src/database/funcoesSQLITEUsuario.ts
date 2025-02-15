import { db } from ".."
import { usuarioSchema } from "../validation/usuarios";
import { inserirLog } from "./funcoesSQLITELogs"

//Criar a tabela de Usuarios
export async function criarTabelaUsuario(): Promise<void> {
    const query = `
        CREATE TABLE IF NOT EXISTS Usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT UNIQUE,
            senha TEXT
        );
    `;

    return new Promise((resolve, reject) => {
        db.run(query, (erro) => {
            if (erro) {
                console.error(`Erro ao criar a tabela: ${erro}`);
                reject(erro);
            } else {
                //verifica se já existe um usuario administrador
                db.get("SELECT id FROM Usuarios WHERE email = ?", ['admin.master@email.com'], (erro, linha) => {
                    if (erro) {
                        console.error(`Erro ao verificar administrador: ${erro}`);
                        reject(erro);
                    } else if (!linha) {
                        //se não existir, cria um usuario com credenciais administrador junto da criação da tabela
                        const insertQuery = "INSERT INTO Usuarios (nome, email, senha) VALUES (?, ?, ?);";
                        db.run(insertQuery, ['Administrador', 'admin.master@email.com', 'AdminMaster'], (erro) => {
                            if (erro) {
                                console.error(`Erro ao inserir administrador: ${erro}`);
                                reject(erro);
                            } else {
                                console.log(`Usuário administrador inserido com sucesso!`);
                                resolve();
                            }
                        });
                    } else {
                        console.log("Tabela Usuarios criada com sucesso!")
                        resolve();
                    }
                });
            }
        });
    });
}

export async function cadastrarUsuario(nome: string, email: string, senha: string, usuario_logado_id: number) {
    let validar = usuarioSchema.safeParse({ nome, email, senha });

    if (nome.toLowerCase() === 'administrador' || nome.toLocaleLowerCase() === 'admin') {
        console.log('Erro ao cadastrar usuario! Termos não autorizados!')
        await inserirLog('Tentativa bloqueada de cadastrar um novo administrador!', usuario_logado_id)
        return
    }
    if (!validar.success) {
        validar.error.errors.forEach(e => console.log(e.message))
        return;
    }

    const query = `
        INSERT INTO Usuarios (nome, email, senha)
        VALUES (?, ?, ?);
    `;
    return new Promise<void>((resolve, reject) => {
        db.run(query, [nome, email, senha], async (erro) => {
            if (erro) {
                await inserirLog(`Erro ao cadastrar Usuario: ${erro.message}`, usuario_logado_id)
                console.error(`Erro ao cadastrar Usuario: ${erro}`);
                reject(erro);
            } else {
                await inserirLog(`Usuario ${nome} cadastrado com sucesso!`, usuario_logado_id)
                console.log(`Usuario cadastrado com sucesso!`);
                resolve();
            }
        });
    })

}

export async function listarTodosUsuarios(usuario_logado_id: number): Promise<void> {
    const query = `
    SELECT * FROM Usuarios;
    `;
    return new Promise((resolve, reject) => {
        db.all(query, async (erro, linhas) => {
            if (erro) {
                console.log(`Erro ao listar Usuarios ${erro}`);
                await inserirLog(`Erro ao listar Usuarios: ${erro.message}`, usuario_logado_id);
                reject(erro);
            } else {
                console.table(linhas);
                await inserirLog('Listando todos os Usuarios', usuario_logado_id);
                resolve();
            }
        });
    });
}

export async function listarUsuarioID(id: number, usuario_logado_id: number): Promise<void> {
    const query = `
    SELECT * FROM Usuarios WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
        db.get(query, [id], async (erro, linha) => {
            if (erro) {
                console.log(`Erro ao listar Usuario: ${erro}`);
                await inserirLog(`Erro ao listar Usuario com ID ${id}: ${erro.message}`, usuario_logado_id);
                reject(erro);
            } else {
                console.table(linha);
                await inserirLog(`Listar Usuario com ID ${id}`, usuario_logado_id);
                resolve();
            }
        });
    });
}

export async function deletarUsuario(id: number, usuario_logado_id: number): Promise<void> {
    if (id === 1) {
        console.log(`Erro: Usuario protegido não pode ser deletado!`);
        await inserirLog(`Tentativa de deletar Usuario administrador!`, usuario_logado_id);
        return Promise.resolve();
    }

    const query = `
    DELETE FROM Usuarios WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
        db.run(query, [id], async (erro) => {
            if (erro) {
                console.log(`Erro ao deletar Usuario: ${erro}`);
                await inserirLog(`Erro ao deletar Usuario com ID ${id}: ${erro.message}`, usuario_logado_id);
                reject(erro);
            } else {
                console.log(`Usuario deletado com sucesso!`);
                await inserirLog(`Usuario com ID ${id} deletado com sucesso!`, usuario_logado_id);
                resolve();
            }
        });
    });
}
