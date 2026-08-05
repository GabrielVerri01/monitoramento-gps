const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new sqlite3('./dev.db');

try {
  const senha = bcrypt.hashSync('123456', 10);

  const stmt = db.prepare(`
    INSERT INTO Usuario (usuario, email, senha)
    VALUES (?, ?, ?)
  `);

  stmt.run('teste', 'teste@example.com', senha);

  console.log('✓ Usuário criado com sucesso!');
  console.log('  Usuário: teste');
  console.log('  Senha: 123456');
} catch (error) {
  if (error.message.includes('UNIQUE constraint failed')) {
    console.log('ℹ Usuário já existe');
  } else {
    console.error('Erro:', error.message);
  }
} finally {
  db.close();
}
