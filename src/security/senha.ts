import bcrypt from 'bcrypt';

//gerar um hash
export async function gerarHashSenha(senha: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(senha, salt);
    return hash;
}

//verificar se bash bate com senha
export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
    const resultado = await bcrypt.compare(senha, hash);
    return resultado;
}