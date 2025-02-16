import { perguntar } from ".."
import { db } from ".."
import bcrypt from 'bcrypt';
import { emailLimiter, senhaLimiter } from "../security/tentativas";
import { logger } from "./logs";

export let usuarioLogado: any = null
//funções para logar no BD
export const logarNoBancoDeDados = async (): Promise<boolean> => {
    let emailCorreto: boolean = false
    let emailDigitado: string = ''
    let senhaCorreta: boolean = false
    let senhaDigitada: string = ''

    console.log("Olá, por favor informe suas credenciais de login para iniciarmos...")
    
    while (!emailCorreto) {
        try {
            // Obtém as tentativas restantes antes de consumir
            const emailRes = await emailLimiter.get('login');
            const tentativasRestantesEmail = emailRes ? Math.max(0, emailRes.remainingPoints) : 5;
            console.log(`Você tem ${tentativasRestantesEmail} tentativas restantes para email!`);
            
            // Verifica se ainda há tentativas disponíveis para o email
            await emailLimiter.consume('login');
            
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
            
            if (usuarioExiste) {
                emailCorreto = true
            }
        } catch (rejRes) {
            logger.warn('Número máximo de tentativas de localizar email atingido! Sistema Encerrado!')
            console.error('Número máximo de tentativas de email excedido. O programa será encerrado.');
            process.exit(1);
        }
    }

    while (!senhaCorreta) {
        try {
            // Obtém as tentativas restantes antes de consumir
            const senhaRes = await senhaLimiter.get('login');
            const tentativasRestantesSenha = senhaRes ? Math.max(0, senhaRes.remainingPoints) : 5;
            console.log(`Você tem ${tentativasRestantesSenha} tentativas restantes para senha!`);
            
            // Verifica se ainda há tentativas disponíveis para a senha
            await senhaLimiter.consume('login');
            
            senhaDigitada = await perguntar('Por favor, informe sua senha: ')
            
            // Verificando a senha com bcrypt
            const senhaValida = await bcrypt.compare(senhaDigitada, usuarioLogado.senha);

            if (!senhaValida) {
                console.error('Senha incorreta!')
                continue
            } else {
                senhaCorreta = true
            }
        } catch (rejRes) {
            logger.warn(`Usuario de email ${emailDigitado} atingiu número máximo de tentativas de validar senha! Sistema Encerrado!`)
            console.error('Número máximo de tentativas de senha excedido. O programa será encerrado.');
            process.exit(1);
        }
    }

    logger.info(`Usuario ID: ${usuarioLogado.id} - Nome: ${usuarioLogado.nome} - Email: ${usuarioLogado.email} fez login no sistema!`)
    console.log(`Bem Vindo ${usuarioLogado.nome}!`)
    return true
}