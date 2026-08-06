const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

console.log('🔍 AUDITORIA DO SISTEMA\n');

// 1. Verificar tabelas
console.log('📊 TABELAS NO BANCO:');
const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
`).all();
tables.forEach(t => console.log(`  ✓ ${t.name}`));

// 2. Verificar dados
console.log('\n📦 DADOS:');
const usuarios = db.prepare(`SELECT COUNT(*) as count FROM "Usuario"`).get();
console.log(`  - Usuários: ${usuarios.count}`);

const veiculos = db.prepare(`SELECT COUNT(*) as count FROM "Veiculo"`).get();
console.log(`  - Veículos locais: ${veiculos.count}`);

const aparelhos = db.prepare(`SELECT COUNT(*) as count FROM "Aparelho"`).get();
console.log(`  - Aparelhos: ${aparelhos.count}`);

try {
  const veiculosGEDUC = db.prepare(`SELECT COUNT(*) as count FROM "VeiculoGEDUC"`).get();
  console.log(`  - Veículos GEDUC: ${veiculosGEDUC.count}`);
} catch (e) {
  console.log(`  - Veículos GEDUC: ⚠️ Tabela não existe (normal, será criada na primeira sincronização)`);
}

db.close();

// 3. Verificar variáveis de ambiente
console.log('\n🔐 VARIÁVEIS DE AMBIENTE (.env.local):');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  const hasGEDUC_KEY = env.includes('GEDUC_API_KEY');
  const hasGEDUC_TENANT = env.includes('GEDUC_TENANT_ID');
  console.log(`  ${hasGEDUC_KEY ? '✓' : '✗'} GEDUC_API_KEY ${hasGEDUC_KEY ? '✓' : '❌ FALTANDO'}`);
  console.log(`  ${hasGEDUC_TENANT ? '✓' : '✗'} GEDUC_TENANT_ID ${hasGEDUC_TENANT ? '✓' : '❌ FALTANDO'}`);
} else {
  console.log(`  ❌ Arquivo .env.local não encontrado`);
}

// 4. Verificar arquivos críticos
console.log('\n📁 ARQUIVOS CRÍTICOS:');
const files = [
  'app/api/veiculos/route.ts',
  'app/api/geduc/posicoes/route.ts',
  'app/api/geduc/veiculos/route.ts',
  'app/api/geduc/config/route.ts',
  'app/paginas/mapa/page.tsx',
  'app/paginas/mapa/_components/MapComponent.tsx',
  'app/page.tsx',
];

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
});

console.log('\n✅ Auditoria concluída!');
