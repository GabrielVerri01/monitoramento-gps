import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'

const cadastrosPorOrigem = new Map<string, { inicio: number; total: number }>()
const JANELA_RATE_LIMIT_MS = 60 * 60 * 1000
const MAX_CADASTROS = 5

function cadastroBloqueado(request: Request): boolean {
    const origem = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'desconhecida'
    const agora = Date.now()
    const atual = cadastrosPorOrigem.get(origem)
    if (!atual || agora - atual.inicio >= JANELA_RATE_LIMIT_MS) {
        cadastrosPorOrigem.set(origem, { inicio: agora, total: 1 })
        return false
    }
    atual.total += 1
    return atual.total > MAX_CADASTROS
}

export async function POST(request: Request) {
    if (cadastroBloqueado(request)) {
        return NextResponse.json(
            { error: 'Limite de cadastros atingido. Tente novamente mais tarde.' },
            { status: 429 }
        )
    }

    const { usuario, email, senha,} = await request.json()

    if (!usuario || !email || !senha) {
        return NextResponse.json(
            { error: 'Preencha nome, email e senha' },
            { status: 400 }
        )
    }

    if (usuario.length > 80 || email.length > 254 || senha.length < 12 || senha.length > 200) {
        return NextResponse.json(
            { error: 'Dados inválidos. Use uma senha entre 12 e 200 caracteres.' },
            { status: 400 }
        )
    }

    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
    })

    if (usuarioExistente) {
        return NextResponse.json(
            { error: 'Este email ja esta cadastrado.' },
            { status: 409 }
        )
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10)

    const novoUsuario = await prisma.usuario.create({
        data: {
            usuario,
            email,
            senha: senhaCriptografada,
        },
        select: {
            id: true,
            usuario: true,
            email: true,
        }
    })

    return NextResponse.json(novoUsuario, { status: 201 })
}