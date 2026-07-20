import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'

export async function POST(request: Request) {
    const { usuario, senha } = await request.json()

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

    return NextResponse.json({
        id: usuarioEncontrado.id,
        usuario: usuarioEncontrado.usuario,
        email: usuarioEncontrado.email
    })
}
