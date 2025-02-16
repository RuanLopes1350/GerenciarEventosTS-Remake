import readline from 'readline';
import * as fs from 'fs';
import sqlite3, { Database } from "sqlite3";
import { cadastrarUsuario, criarTabelaUsuario, deletarUsuario, listarTodosUsuarios, localizarUsuario, editarUsuario } from './utils/Usuario';
import { criarTabelaEventos, deletarEvento, editarEvento, inserirEvento, listarEventos, localizarEvento } from './utils/Evento';
import { logarNoBancoDeDados, usuarioLogado } from './utils/Login';
import { logger } from './utils/logs';

//criar diretório caso ele não exista!
const directory = './data';
if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true }); 
}

export const db = new sqlite3.Database('./data/BancoEventos.db')

export const rl = readline.createInterface({
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

const main = async () => {
    //criar tabelas caso não existam ainda
    await criarTabelaUsuario();
    await criarTabelaEventos();
    logger.info('Sistema Iniciado!')
    //fazer login no Banco
    let autorizado = await logarNoBancoDeDados();
    while (autorizado) {
        //menu inicial
        console.log("\nO que gostaria de fazer? ");
        console.log('1 - Menu Eventos!');
        console.log('2 - Menu Usuarios!');
        console.log('3 - Sair!');
        const escolher = await perguntar('Informe a opção desejada: ');

        switch (escolher) {
            case '1':
                logger.info(`Menu Eventos acessado por: ${usuarioLogado.nome}`)
                //menu de Eventos
                let menuEventosAtivo: boolean = true
                while (menuEventosAtivo) {
                    console.log('\nMenu Eventos...')
                    console.log('1 - Cadastrar Evento!');
                    console.log('2 - Listar Eventos!');
                    console.log('3 - Buscar Evento Por ID!');
                    console.log('4 - Editar Evento!')
                    console.log('5 - Excluir Evento!');
                    console.log('6 - Voltar');
                    const menuEventos = await perguntar('Informe a opção desejada: ');
                    switch (menuEventos) {
                        case '1':
                            //Cadastar novo Evento
                            const nomeEvento = await perguntar('Informe o nome do Evento: ');
                            const dataEvento = await perguntar('Informe a data do Evento: ');
                            await inserirEvento(nomeEvento, dataEvento);
                            break;
                        case '2':
                            //Listar os eventos
                            await listarEventos();
                            break;
                        case '3':
                            //Buscar evento por id
                            const idEventoBuscarString = await perguntar('Informe o ID do Evento que deseja buscar: ')
                            const idEventoBuscar = Number(idEventoBuscarString)
                            await localizarEvento(idEventoBuscar)
                            break;
                        case '4':
                            const idEventoAEditarString = await perguntar('Informe o ID do Evento que deseja editar: ')
                            const idEventoAEditar = Number(idEventoAEditarString)
                            const eventoExiste: boolean = await localizarEvento(idEventoAEditar);
                            if (eventoExiste) {
                                const nomeEventoEditar = await perguntar('Informe o novo nome do Evento: ')
                                const dataEventoEditar = await perguntar('Informe a nova data do Evento: ')
                                await editarEvento(idEventoAEditar, nomeEventoEditar, dataEventoEditar)
                            } else {
                                console.log('Evento não encontrado. Verifique se o ID está correto e tente novamente!')
                            }
                            break;
                        case '5':
                            //excluir um evento
                            const idEventoDeletarString = await perguntar('Informe o ID do Evento que deseja deletar: ')
                            const idEventoDeletar = Number(idEventoDeletarString)
                            await deletarEvento(idEventoDeletar)
                            break;
                        case '6':
                            //retornar ao menu inicial
                            console.log('Menu anterior...');
                            menuEventosAtivo = false;
                            break;
                        default:
                            console.log('Opção Inválida, por favor tente novamente!')
                            break;
                    }
                }
                break;
            case '2':
                logger.info(`Menu Usuarios acessado por: ${usuarioLogado.nome}`)
                //menu de Usuarios
                let menuUsuariosAtivo = true;
                while (menuUsuariosAtivo) {
                    console.log('\nMenu Usuarios...');
                    console.log('1 - Cadastrar Usuario!');
                    console.log('2 - Listar Usuarios!');
                    console.log('3 - Buscar Usuario Por ID!');
                    console.log('4 - Editar dados de um Usuario!')
                    console.log('5 - Excluir Usuario!');
                    console.log('6 - Voltar');
                    const menuUsuarios = await perguntar('Informe a opção desejada: ');
                    switch (menuUsuarios) {
                        case '1':
                            //Cadastrar Usuario
                            const nomeUsuario = await perguntar('Informe o nome do Usuario: ');
                            const emailUsuario = await perguntar('Informe o email do Usuario: ');
                            const senhaUsuario = await perguntar('Informe a senha do Usuario: ');
                            await cadastrarUsuario(nomeUsuario, emailUsuario, senhaUsuario);
                            break;
                        case '2':
                            //Listar usuarios
                            await listarTodosUsuarios();
                            break;
                        case '3':
                            //Buscar Usuario por id
                            const idUsuarioString = await perguntar('Informe o ID do Usuario que deseja buscar: ');
                            const idUsuario = Number(idUsuarioString)
                            await localizarUsuario(idUsuario, usuarioLogado.id);
                            break;
                        case '4':
                            const idUsuarioAEditarString = await perguntar('Informe o ID do Usuario que deseja editar: ')
                            const idUsuarioAEditar = Number(idUsuarioAEditarString)
                            const usuarioExiste = await localizarUsuario(idUsuarioAEditar, usuarioLogado.id)
                            if (usuarioExiste) {
                                const nomeUsuarioEditar = await perguntar('Informe o novo nome do Usuario: ')
                                const emailUsuarioEditar = await perguntar('Informe o novo email do Usuario: ')
                                const senhaUsuarioEditar = await perguntar('Informe a nova senha do Usuario: ')
                                const usuarioEditado = await editarUsuario(idUsuarioAEditar, nomeUsuarioEditar, emailUsuarioEditar, senhaUsuarioEditar, usuarioLogado.id)
                                if (usuarioEditado) {
                                    console.log('Usuario editado com sucesso!')
                                } else {
                                    console.log('Erro ao editar o usuario.')
                                }
                            } else {
                                console.log('Usuario não encontrado. Verifique se o ID está correto e tente novamente!')
                            }
                            break;
                        case '5':
                            //Excluir usuario
                            const idUsuarioExcluirString = await perguntar('Informe o ID do Usuario que deseja deletar: ');
                            const idUsuarioExcluir = Number(idUsuarioExcluirString)
                            await deletarUsuario(idUsuarioExcluir, usuarioLogado.id);
                            break;
                        case '6':
                            //Retornar ao menu inicial
                            console.log('Menu anterior...');
                            menuUsuariosAtivo = false;
                            break;
                        default:
                            console.log('Opção inválida!');
                            break;
                    }
                }
                break;
            case '3':
                //encerrar execução e finalizar a ReadLine
                logger.info(`Usuario: ${usuarioLogado.nome} se desligou do sistema!`)
                autorizado = false;
                console.log('Saindo...');
                rl.close();
                return;
            default:
                console.log('Opção inválida!');
                break;
        }
    }
};

main();