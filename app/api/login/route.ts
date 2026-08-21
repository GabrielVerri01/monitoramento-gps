import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'
import {
    SESSION_COOKIE_NAME,
    createSessionValue,
    getSessionCookieOptions,
} from '@/app/lib/session'

const tentativasPorOrigem = new Map<string, { inicio: number; total: number }>()
const JANELA_RATE_LIMIT_MS = 15 * 60 * 1000
const MAX_TENTATIVAS = 10

function origemDaRequisicao(request: Request): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'desconhecida'
}

function excedeuLimite(origem: string): boolean {
    const agora = Date.now()
    const atual = tentativasPorOrigem.get(origem)
    if (!atual || agora - atual.inicio >= JANELA_RATE_LIMIT_MS) {
        tentativasPorOrigem.set(origem, { inicio: agora, total: 1 })
        return false
    }
    atual.total += 1
    return atual.total > MAX_TENTATIVAS
}

export async function POST(request: Request) {
    try {
        if (excedeuLimite(origemDaRequisicao(request))) {
            return NextResponse.json(
                { error: 'Muitas tentativas. Tente novamente mais tarde.' },
                { status: 429 }
            )
        }

        const body = await request.json()
        const usuario = typeof body.usuario === 'string' ? body.usuario.trim() : ''
        const senha = typeof body.senha === 'string' ? body.senha : ''

        if (!usuario || !senha) {
            return NextResponse.json(
                { error: 'Usuario ou senha invalidos.' },
                { status: 401 }
            )
        }

        const usuarioEncontrado = await prisma.usuario.findUnique({
            where: { usuario }
        })

        if (!usuarioEncontrado) {
            return NextResponse.json(
                { error: 'Usuario ou senha invalidos.' },
                { status: 401 }
            )
        }

        const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha)

        if (!senhaCorreta) {
            return NextResponse.json(
                { error: 'Usuario ou senha invalidos.' },
                { status: 401 }
            )
        }

        const resposta = NextResponse.json({
            id: usuarioEncontrado.id,
            usuario: usuarioEncontrado.usuario,
            email: usuarioEncontrado.email
        })
        resposta.cookies.set(
            SESSION_COOKIE_NAME,
            createSessionValue({ id: usuarioEncontrado.id, usuario: usuarioEncontrado.usuario }),
            getSessionCookieOptions()
        )
        return resposta
    } catch (error) {
        console.error('Erro interno no login:', error instanceof Error ? error.message : 'erro desconhecido')
        return NextResponse.json(
            { error: 'Não foi possível realizar o login. Verifique a configuração do servidor.' },
            { status: 500 }
        )
    }
}
