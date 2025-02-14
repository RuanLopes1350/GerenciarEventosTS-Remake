import { perguntar } from ".."
import { db } from ".."
export let usuarioLogado: any = null
//funções para logar no BD
export const logarNoBancoDeDados = async (): Promise<boolean> => {

    let emailCorreto: boolean = false
    let emailDigitado: string = ''
    let senhaCorreta: boolean = false
    let senhaDigitada: string = ''

    console.log("Olá, por favor informe suas credenciais de login para iniciarmos...")
    while (!emailCorreto) {
        emailDigitado = await perguntar('Por favor, informe seu email: ')
        const usuarioExiste = await new Promise<boolean>((resolve, reject) => {
            const queryEmail = `SELECT * FROM Usuarios WHERE email = ?`
            db.get(queryEmail, [emailDigitado], (erro, linha) => {
                if (erro) {
                    console.error(erro);
                    reject(false);
                } else if (!linha) {
                    console.error("Usuário não encontrado!")
                    resolve(false)
                } else {
                    usuarioLogado = linha
                    resolve(true)
                }
            })
        })
        emailCorreto = usuarioExiste
    }

    while (!senhaCorreta) {
        senhaDigitada = await perguntar('Por favor, informe sua senha: ')
        if (senhaDigitada !== usuarioLogado.senha) {
            console.error('Senha incorreta!')
            continue
        } else {
            senhaCorreta = true
        }
    };
    console.log(`Bem Vindo ${usuarioLogado.nome}!`)
    return true
}