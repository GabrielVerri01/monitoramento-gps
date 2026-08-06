const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setup() {
  try {
    // Limpar dados antigos
    await prisma.aparelho.deleteMany();
    await prisma.veiculo.deleteMany();
    await prisma.usuario.deleteMany();

    // Criar usuário
    const senhaHash = await bcrypt.hash('teste123', 10);
    const usuario = await prisma.usuario.create({
      data: {
        usuario: 'admin',
        email: 'admin@test.com',
        senha: senhaHash,
      }
    });
    console.log('✓ Usuário criado:', usuario.usuario);

    // Criar veículos de teste em São Luís
    const veiculo1 = await prisma.veiculo.create({
      data: {
        nome: 'Carro 1',
        setor: 'Logistica',
        velocidade: 45,
        placa: 'ABC-1234',
        lat: -2.5305,
        lng: -44.2955,
      }
    });
    console.log('✓ Veículo 1 criado:', veiculo1.nome);

    const veiculo2 = await prisma.veiculo.create({
      data: {
        nome: 'Carro 2',
        setor: 'Vendas',
        velocidade: 30,
        placa: 'DEF-5678',
        lat: -2.5205,
        lng: -44.3055,
      }
    });
    console.log('✓ Veículo 2 criado:', veiculo2.nome);

    const veiculo3 = await prisma.veiculo.create({
      data: {
        nome: 'Carro 3',
        setor: 'SAMU',
        velocidade: 60,
        placa: 'GHI-9012',
        lat: -2.5005,
        lng: -44.2855,
      }
    });
    console.log('✓ Veículo 3 criado:', veiculo3.nome);

    // Criar aparelhos
    await prisma.aparelho.createMany({
      data: [
        { veiculoId: veiculo1.id, tipo: 'GPS' },
        { veiculoId: veiculo1.id, tipo: 'RÁDIO' },
        { veiculoId: veiculo2.id, tipo: 'GPS' },
        { veiculoId: veiculo3.id, tipo: 'GPS' },
        { veiculoId: veiculo3.id, tipo: 'RÁDIO' },
      ]
    });
    console.log('✓ Aparelhos criados');

    console.log('\n✅ Setup concluído!');
    console.log('Usuário: admin');
    console.log('Senha: teste123');
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setup();
