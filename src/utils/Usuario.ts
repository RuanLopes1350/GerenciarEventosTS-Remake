import { db } from ".."
import { usuarioSchema } from "../validation/usuarios";
import { usuarios } from "../interface/usuarios";
import { gerarHashSenha } from "../security/senha";
import { logger } from "./logs";
import { usuarioLogado } from "./Login";

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
                db.get("SELECT id FROM Usuarios WHERE email = ?", ['admin.master@email.com'], async (erro, linha) => {
                    if (erro) {
                        console.error(`Erro ao verificar administrador: ${erro}`);
                        reject(erro);
                    } else if (!linha) {
                        //se não existir, cria um usuario com credenciais administrador junto da criação da tabela
                        const senhaAdminHash = await gerarHashSenha('AdminMaster');
                        const insertQuery = "INSERT INTO Usuarios (nome, email, senha) VALUES (?, ?, ?);";
                        db.run(insertQuery, ['Administrador', 'admin.master@email.com', senhaAdminHash], (erro) => {
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

export async function cadastrarUsuario(nome: string, email: string, senha: string) {
    let validar = usuarioSchema.safeParse({ nome, email, senha });

    if (nome.toLowerCase() === 'administrador' || nome.toLocaleLowerCase() === 'admin') {
        console.log('Erro ao cadastrar usuario! Termos não autorizados!')
        return
    }
    if (!validar.success) {
        validar.error.errors.forEach(e => console.log(e.message))
        return;
    }
    const senhaHash = await gerarHashSenha(senha);

    const query = `
        INSERT INTO Usuarios (nome, email, senha)
        VALUES (?, ?, ?);
    `;
    return new Promise<void>((resolve, reject) => {
        db.run(query, [nome, email, senhaHash], async (erro) => {
            if (erro) {
                logger.error(`Erro ao tentar cadastrar email: ${email}! Usuario logado: ${usuarioLogado.nome} - ${usuarioLogado.email} \n${erro}`)
                console.error(`Erro ao cadastrar Usuario: ${erro}`);
                reject(erro);
            } else {
                logger.info(`Usuario ${nome} cadastrado no banco por: ${usuarioLogado.nome} - ${usuarioLogado.email}`)
                console.log(`Usuario cadastrado com sucesso!`);
                resolve();
            }
        });
    })

}

export async function listarTodosUsuarios(): Promise<void> {
    const query = `
    SELECT 
        id, 
        nome, 
        email 
    FROM Usuarios;
    `;
    return new Promise((resolve, reject) => {
        db.all(query, async (erro, linhas) => {
            if (erro) {
                logger.error(`Erro ao listar usuarios! Usuario logado: ${usuarioLogado.nome} - ${usuarioLogado.email} \n${erro}`)
                console.error(`Erro ao listar Usuarios ${erro}`);
                reject(erro);
            } else {
                logger.info(`Listagem de usuarios por: ${usuarioLogado.nome} - ${usuarioLogado.email}`)
                console.table(linhas);
                resolve();
            }
        });
    });
}

export async function localizarUsuario(id: number, usuario_logado_id: number): Promise<boolean> {
    const query = `
    SELECT 
        id, 
        nome, 
        email 
    FROM Usuarios 
    WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
        db.get(query, [id], async (erro, linha) => {
            if (erro) {
                logger.error(`Erro ao buscar usuario! Usuario logado: ${usuarioLogado.nome} - ${usuarioLogado.email} \n${erro}`)
                console.log(`Erro ao buscar Usuario: ${erro}`);
                reject(erro);
            } else {
                logger.info(`Busca por usuario de ID:${id} Usuario logado:${usuarioLogado.nome} - ${usuarioLogado.email}`)
                console.table(linha);
                resolve(true);
            }
        });
    });
}

export async function editarUsuario(id: number, nome: string, email: string, senha: string, usuario_logado_id: number): Promise<boolean> {
    if (id === 1) {
        logger.warn(`Usuario ${usuarioLogado.nome} - ${usuarioLogado.email} tentou alterar credenciais administrativas!`)
        console.log(`Erro: Usuario protegido não pode ser editado!`);
        return false;
    }

    let usuarioExistente: any[] = [];
    const queryLocalizar = `
        SELECT * FROM Usuarios WHERE id = ?
    `;
    const usuario = await new Promise<void>((resolve, reject) => {
        db.get(queryLocalizar, [id], (erro, linha) => {
            if (erro) {
                logger.error(`Erro ao editar dados de usuario ID:${id}! Usuario logado: ${usuarioLogado.nome} - ${usuarioLogado.email} \n${erro}`)
                console.error(`Erro ao localizar usuario: ${erro}`);
                reject(erro);
            } else if (!linha) {
                logger.error(`Tentativa de localizar usuario inexistente! Usuario logado: ${usuarioLogado.nome} - ${usuarioLogado.email}`)
                console.log('Usuario não encontrado. Verifique se o ID está correto e tente novamente!');
                resolve();
            } else {
                
                usuarioExistente.push(linha);
                resolve();
            }
        });
    });

    if (usuarioExistente.length === 0) {
        return false;
    }

    let vamosEditar = {
        nome: nome && nome.trim() ? nome : usuarioExistente[0].nome,
        email: email && email.trim() ? email : usuarioExistente[0].email,
        senha: senha && senha.trim() ? senha : usuarioExistente[0].senha
    };

    let validar = usuarioSchema.safeParse(vamosEditar);
    if (!validar.success) {
        validar.error.errors.forEach(e => console.log(e.message))
        return false;
    }

    if (senha && senha.trim() && senha !== usuarioExistente[0].senha) {
        vamosEditar.senha = await gerarHashSenha(senha);
    } else {
        vamosEditar.senha = usuarioExistente[0].senha;
    }


    return new Promise<boolean>((resolve, reject) => {
        const querySalvarEdicao = `
            UPDATE Usuarios
            SET nome = ?, email = ?, senha = ?
            WHERE id = ?
        `;
        db.run(querySalvarEdicao, [vamosEditar.nome, vamosEditar.email, vamosEditar.senha, id], async (erro) => {
            if (erro) {
                logger.error(`Tentativa de editar um usuario inexistente! Usuario logado: ${usuarioLogado.nome} - ${usuarioLogado.email} \n${erro}`)
                console.error(`Erro ao atualizar dados do Usuario: ${erro}`);
                reject(erro);
            } else {
                logger.info(`Edição de dados do usuario ID ${id} ${usuarioLogado.nome} - ${usuarioLogado.email}`)
                console.log('Usuario Atualizado com sucesso!');
                console.table(vamosEditar);
                resolve(true);
            }
        });
    });
}

export async function deletarUsuario(id: number, usuario_logado_id: number): Promise<void> {
    if (id === 1) {
        logger.warn(`Usuario ${usuarioLogado.nome} - ${usuarioLogado.email} tentou deletar usuario administrador!`)
        console.log(`Erro: Usuario protegido não pode ser deletado!`);
        return Promise.resolve();
    }

    const query = `
    DELETE FROM Usuarios WHERE id = ?
    `;
    return new Promise((resolve, reject) => {
        db.run(query, [id], async (erro) => {
            if (erro) {
                logger.error(`Erro ao deletar usuario de ID:${id}! Usuario logado: ${usuarioLogado.nome} - ${usuarioLogado.email}`)
                console.log(`Erro ao deletar Usuario: ${erro}`);
                reject(erro);
            } else {
                logger.info(`Usuario de ID:${id} deletado do banco! Usuario logado: ${usuarioLogado.nome} - ${usuarioLogado.email}`)
                console.log(`Usuario deletado com sucesso!`);
                resolve();
            }
        });
    });
}