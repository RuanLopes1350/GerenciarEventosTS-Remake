import { db } from ".."

export async function criarTabelaLogs(): Promise<void> {
    const query = `
        CREATE TABLE IF NOT EXISTS Logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mensagem TEXT NOT NULL,
            Data_Hora DATETIME DEFAULT CURRENT_TIMESTAMP,
            usuario_ID INTEGER,
            FOREIGN KEY (usuario_ID) REFERENCES Usuarios (id)
        );
    `;
    return new Promise((resolve, reject) => {
        db.run(query, (erro) => {
            if (erro) {
                console.error(`Erro ao criar a tabela logs: ${erro}`);
                reject(erro);
            } else {
                console.log('Tabela Logs criada com sucesso!');
                resolve();
            }
        });
    });
}

export async function inserirLog(mensagem: string, usuario_id: number) {
    const queryUsuario = `
        SELECT nome FROM Usuarios WHERE id = ?
    `
    
    db.get(queryUsuario, [usuario_id], (erro, usuario: { nome: string }) => {
        if (erro) {
            console.error(`Erro ao buscar usuário: ${erro}`)
            return
        }

        if (!usuario) {
            console.error('Usuário não encontrado')
            return
        }

        const queryLog = `
            INSERT INTO Logs (mensagem, usuario_id)
            VALUES (?, ?)
        `
        return new Promise<void>((resolve, reject) => {
            db.run(queryLog, [mensagem, usuario_id], (erro) => {
                if (erro) {
                    console.error(`Erro ao inserir Log: ${erro}`);
                    reject(erro);
                } else {
                    resolve();
                    console.log(`Log inserido com sucesso!`);
                }
            });
        });
    })
}