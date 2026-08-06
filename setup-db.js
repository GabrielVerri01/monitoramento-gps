const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

async function setup() {
  try {
    // Criar tabelas se não existirem
    db.exec(`
      CREATE TABLE IF NOT EXISTS "Usuario" (
        "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
        "usuario" text NOT NULL UNIQUE,
        "email" text NOT NULL UNIQUE,
        "senha" text NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Veiculo" (
        "id" text NOT NULL PRIMARY KEY,
        "nome" text NOT NULL,
        "setor" text NOT NULL,
        "velocidade" integer NOT NULL DEFAULT 0,
        "placa" text NOT NULL,
        "lat" real NOT NULL,
        "lng" real NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "Aparelho" (
        "id" text NOT NULL PRIMARY KEY,
        "veiculoId" text NOT NULL,
        "tipo" text NOT NULL,
        FOREIGN KEY ("veiculoId") REFERENCES "Veiculo" ("id")
      );
    `);

    // Limpar dados antigos
    db.prepare('DELETE FROM "Aparelho"').run();
    db.prepare('DELETE FROM "Veiculo"').run();
    db.prepare('DELETE FROM "Usuario"').run();

    // Criar usuário
    const senhaHash = bcrypt.hashSync('teste123', 10);
    db.prepare(`
      INSERT INTO "Usuario" (usuario, email, senha)
      VALUES (?, ?, ?)
    `).run('admin', 'admin@test.com', senhaHash);
    console.log('✓ Usuário criado: admin');

    // Criar veículos de teste em São Luís
    const veiculos = [
      { id: '1', nome: 'Carro Logística 1', setor: 'Logistica', velocidade: 45, placa: 'ABC-1234', lat: -2.5305, lng: -44.2955 },
      { id: '2', nome: 'Carro Vendas 1', setor: 'Vendas', velocidade: 30, placa: 'DEF-5678', lat: -2.5205, lng: -44.3055 },
      { id: '3', nome: 'Carro SAMU 1', setor: 'SAMU', velocidade: 60, placa: 'GHI-9012', lat: -2.5005, lng: -44.2855 },
      { id: '4', nome: 'Carro SEMUSC 1', setor: 'SEMUSC', velocidade: 35, placa: 'JKL-3456', lat: -2.51, lng: -44.29 },
    ];

    const insertVeiculo = db.prepare(`
      INSERT INTO "Veiculo" (id, nome, setor, velocidade, placa, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    veiculos.forEach(v => {
      insertVeiculo.run(v.id, v.nome, v.setor, v.velocidade, v.placa, v.lat, v.lng);
    });
    console.log('✓ Veículos criados:', veiculos.length);

    // Criar aparelhos
    const aparelhos = [
      { id: '1', veiculoId: '1', tipo: 'GPS' },
      { id: '2', veiculoId: '1', tipo: 'RÁDIO' },
      { id: '3', veiculoId: '2', tipo: 'GPS' },
      { id: '4', veiculoId: '3', tipo: 'GPS' },
      { id: '5', veiculoId: '3', tipo: 'RÁDIO' },
      { id: '6', veiculoId: '4', tipo: 'GPS' },
    ];

    const insertAparelho = db.prepare(`
      INSERT INTO "Aparelho" (id, veiculoId, tipo)
      VALUES (?, ?, ?)
    `);

    aparelhos.forEach(a => {
      insertAparelho.run(a.id, a.veiculoId, a.tipo);
    });
    console.log('✓ Aparelhos criados:', aparelhos.length);

    console.log('\n✅ Setup concluído!');
    console.log('Credenciais:');
    console.log('  Usuário: admin');
    console.log('  Senha: teste123');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    db.close();
  }
}

setup();
