# RastroSystem API Integration

Integração completa da API RastroSystem (v0.1 e v0.2) em Next.js com autenticação OAuth2, gerenciamento automático de tokens e tratamento robusto de erros.

## Configuração

### Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
RASTROSYSTEM_BASE_URL=https://teste.rastrosystem.com.br/api_v3
RASTROSYSTEM_USERNAME=seu_usuario
RASTROSYSTEM_PASSWORD=sua_senha
```

## Estrutura

```
app/lib/rastrosystem/
├── config.ts           # Configurações centralizadas
├── types.ts            # Tipos TypeScript para todos os endpoints
├── client.ts           # Cliente HTTP com gerenciamento de token
├── clientes.ts         # Funções para CRUD de clientes
├── veiculos.ts         # Funções para CRUD e ações de veículos
├── equipamentos.ts     # Funções para CRUD de equipamentos e chips
└── index.ts            # Exports públicos

app/api/rastrosystem/
├── clientes/route.ts   # API routes para clientes
├── veiculos/route.ts   # API routes para veículos
├── chips/route.ts      # API routes para chips
├── equipamentos/route.ts # API routes para equipamentos
└── health/route.ts     # Endpoint de saúde
```

## Uso

### Importar módulo

```typescript
import * as rastroSystem from "@/app/lib/rastrosystem";
// ou importar funções específicas
import { criarCliente, listarVeiculos } from "@/app/lib/rastrosystem";
```

### Autenticação

A autenticação é feita automaticamente na primeira requisição. O token é renovado automaticamente quando próximo de expirar.

### Exemplos de Uso

#### Clientes

```typescript
// Criar cliente
const cliente = await rastroSystem.criarCliente({
  id: "CLI-001",
  nome: "Empresa XYZ",
  sistema: "GPS",
  ativo: "Y",
  cnpj: "12.345.678/0001-90",
  email: "contato@empresa.com",
  endereco: {
    logradouro: "Rua Exemplo",
    numero: "123",
    cep: "12345-678",
    cidade: "São Paulo",
    uf: "SP",
    bairro: "Centro",
  },
  tel: "1133334444",
  cel: "11999998888",
});

// Listar clientes
const clientes = await rastroSystem.listarClientes({
  limit: 10,
  offset: 0,
  ordem: "nome",
});

// Obter cliente específico
const cliente = await rastroSystem.obterClientePorId("CLI-001");
const clientePorCnpj = await rastroSystem.obterClientePorCnpj("12.345.678/0001-90");

// Atualizar cliente
await rastroSystem.atualizarCliente({
  ...cliente,
  nome: "Novo Nome",
});

// Ativar/Desativar
await rastroSystem.ativarCliente("CLI-001");
await rastroSystem.desativarCliente("CLI-001");

// Deletar
await rastroSystem.deletarCliente("CLI-001");
```

#### Veículos V0.2

```typescript
// Criar veículo
const veiculo = await rastroSystem.criarVeiculoV02({
  placa: "ABC-1234",
  status: "ativo",
  pessoa_id: "PESSOA-001",
  marca: "Ford",
  modelo: "Transit",
  cor: "Branco",
  ano: 2023,
  imei: "123456789012345",
});

// Listar veículos
const veiculos = await rastroSystem.listarVeiculosV02({
  cliente: "CLI-001",
  limit: 20,
  offset: 0,
});

// Obter veículo específico
const veiculo = await rastroSystem.obterVeiculoV02PorId(id);
const veiculoPorPlaca = await rastroSystem.obterVeiculoV02PorPlaca("ABC-1234");

// Atualizar veículo
await rastroSystem.atualizarVeiculoV02(id, {
  ...veiculo,
  status: "inativo",
});

// Ações de status
await rastroSystem.ativarVeiculoV02(id);
await rastroSystem.inativarVeiculoV02(id);
await rastroSystem.marcarInadimplenteVeiculoV02(id);

// Deletar
await rastroSystem.deletarVeiculoV02(id);
```

#### Veículos V0.1 (Ações Específicas)

```typescript
// Reativar veículo
await rastroSystem.reativarVeiculoV01({
  id: "VEI-001",
  placa: "ABC-1234",
  marca: "Ford",
  modelo: "Transit",
  ano: 2023,
  anomodelo: 2023,
  ativo: "Y",
  chassi: "ABC123456789",
  renavam: "123456789",
  modulo: "123456789012345",
  sistema: "GPS",
});

// Suspender (inadimplência)
await rastroSystem.suspenderVeiculoV01(id, "inadimplencia");
// Retira inadimplência
await rastroSystem.suspenderVeiculoV01(id, "retira_inadimplencia");

// Trocar equipamento (IMEI)
await rastroSystem.trocarEquipamentoVeiculoV01({
  id: "VEI-001",
  modulo: "987654321098765",
  placa: "ABC-1234",
  sistema: "GPS",
});

// Vínculo veículo-cliente
const vinculos = await rastroSystem.listarVinculosVeiculoCliente({
  id_veiculo: "VEI-001",
});

// Vincular cliente a veículo
await rastroSystem.vincularClienteAoVeiculo("VEI-001", "CLI-001");
```

#### Equipamentos

```typescript
// Listar versões de equipamentos
const versoes = await rastroSystem.listarVersoesEquipamento({
  limit: 50,
});

// Obter versão específica
const versao = await rastroSystem.obterVersaoEquipamento(id);

// ---- CHIPS ----
// Criar chip
const chip = await rastroSystem.criarChip({
  numchip: "5521987654321",
  celmodulo: "123456789012345",
  operadora: "Vivo",
});

// Listar chips
const chips = await rastroSystem.listarChips({
  operadora: "Vivo",
  limit: 20,
});

// Obter chip específico
const chip = await rastroSystem.obterChipPorNumero("5521987654321");

// Atualizar chip
await rastroSystem.atualizarChip(id, {
  numchip: "5521987654322",
  celmodulo: "987654321098765",
  operadora: "Tim",
});

// Deletar chip
await rastroSystem.deletarChip(id);

// ---- EQUIPAMENTOS ----
// Criar equipamento
const equipamento = await rastroSystem.criarEquipamento({
  modulo: "123456789012345", // IMEI
  id_versao: "VERSAO-001",
  id_chip: "CHIP-001",
});

// Listar equipamentos
const equipamentos = await rastroSystem.listarEquipamentos({
  limit: 20,
});

// Obter equipamento específico
const eq = await rastroSystem.obterEquipamentoPorModulo("123456789012345");

// Atualizar equipamento
await rastroSystem.atualizarEquipamento(id, {
  id_chip: "CHIP-002",
});

// Deletar equipamento
await rastroSystem.deletarEquipamento(id);
```

## API Routes

### GET /api/rastrosystem/health

Verifica a saúde da integração e valida a configuração.

```bash
curl http://localhost:3000/api/rastrosystem/health
```

Resposta de sucesso:
```json
{
  "status": "ok",
  "message": "RastroSystem integrado com sucesso",
  "timestamp": "2024-08-14T10:30:00.000Z"
}
```

### Clientes: `/api/rastrosystem/clientes`

- `GET ?id=...&cnpj=...&limit=10&offset=0` - Listar clientes
- `POST` - Criar cliente
- `PUT` - Atualizar cliente
- `DELETE ?id=...` - Deletar cliente

### Veículos: `/api/rastrosystem/veiculos`

- `GET ?id=...&placa=...&cliente=...&limit=10&offset=0` - Listar veículos
- `POST` - Criar veículo
- `PUT` - Atualizar veículo
- `DELETE ?id=...` - Deletar veículo

### Chips: `/api/rastrosystem/chips`

- `GET ?numchip=...&operadora=...&limit=10&offset=0` - Listar chips
- `POST` - Criar chip
- `PUT` - Atualizar chip
- `DELETE ?id=...` - Deletar chip

### Equipamentos: `/api/rastrosystem/equipamentos`

- `GET ?modulo=...&limit=10&offset=0` - Listar equipamentos
- `POST` - Criar equipamento
- `PUT` - Atualizar equipamento
- `DELETE ?id=...` - Deletar equipamento

## Tratamento de Erros

Todos os endpoints retornam erros estruturados:

```json
{
  "error": "Erro ao criar cliente",
  "message": "CNPJ já existe no sistema"
}
```

Códigos de status HTTP:
- `200/201` - Sucesso
- `400` - Erro de validação (dados obrigatórios faltando)
- `401` - Não autorizado (token inválido - será renovado automaticamente)
- `500` - Erro no servidor

## Gerenciamento Automático de Token

- O cliente HTTP detecta automaticamente quando o token está próximo de expirar (60 segundos antes)
- Quando o token está próximo de expirar, uma renovação é feita automaticamente
- Se o refresh token estiver inválido, faz um novo login
- Em caso de erro 401, tenta renovar o token automaticamente (com limite de 3 tentativas)

## Logging

A integração registra logs estruturados com prefixos:
- `[AUTH]` - Autenticação e renovação de token
- `[CLIENTE]` - Cliente HTTP genérico
- `[CLIENTES]` - Operações de clientes
- `[VEÍCULOS V0.2]` - Operações veículos v0.2
- `[VEÍCULOS V0.1]` - Operações veículos v0.1
- `[EQUIPAMENTOS]` - Operações de equipamentos
- `[API]` - Logs de API routes
- `[CONFIG]` - Validação de configuração
- `[HEALTH]` - Endpoint de saúde

Todos os logs são colocados no console do Node.js.

## Validação de Configuração

Chame `validarConfiguracao()` para verificar se todas as variáveis de ambiente necessárias estão configuradas:

```typescript
const resultado = await rastroSystem.validarConfiguracao();

if (!resultado.valid) {
  console.error("Erros:", resultado.errors);
}
```

## Tipos TypeScript

Todos os tipos estão em `app/lib/rastrosystem/types.ts` e são exportados pelo index. Use-os em seus componentes e páginas:

```typescript
import type {
  ClienteResponse,
  VeiculoV02Response,
  ChipResponse,
  EquipamentoResponse,
} from "@/app/lib/rastrosystem";
```
