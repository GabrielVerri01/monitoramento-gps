import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: Request) {
    const { usuario, senha } = await request.json()

    console.log('Login attempt:', { usuario, senha })

    const usuarioEncontrado = await prisma.usuario.findUnique({
        where: { usuario }
    })

    console.log('Usuário encontrado:', usuarioEncontrado ? 'sim' : 'não')

    if (!usuarioEncontrado) {
        console.log('Usuário não encontrado')
        return NextResponse.json(
            { error: 'Usuario ou senha invalidos.' },
            { status: 401 }
        )
    }

    const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha)

    console.log('Senha correta:', senhaCorreta)

    if (!senhaCorreta) {
        console.log('Senha incorreta')
        return NextResponse.json(
            { error: 'Usuario ou senha invalidos.' },
            { status: 401 }
        )
    }

    return NextResponse.json({
        id: usuarioEncontrado.id,
        usuario: usuarioEncontrado.usuario,
        email: usuarioEncontrado.email
    })
}
