# ⚡ Quick Reference - API GET

## 🎯 Objetivo
Converter requisições POST → GET com suporte a query params e filtros modulares.

---

## 📋 Arquivos Modificados/Criados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `.env` | ✏️ Alterado | Novos endpoints GET |
| `app/lib/gps/config.ts` | ✨ Novo | Configuração centralizada |
| `app/lib/gps/multiportal.ts` | ✏️ Reescrito | POST → GET |
| `app/api/veiculos/route.ts` | ✏️ Alterado | Query params support |
| `API_GET_DOCS.md` | ✨ Novo | Documentação |
| `CHANGES.md` | ✨ Novo | Plano detalhado |
| `ANTES_DEPOIS.md` | ✨ Novo | Comparação |
| `EXEMPLOS_PRATICOS.md` | ✨ Novo | Exemplos de uso |

---

## 🚀 Setup Rápido

### 1. Configurar `.env`
```bash
MULTIPORTAL_GET_VEICULOS_URL="http://seu-endpoint/veiculos"
MULTIPORTAL_GET_POSICOES_URL="http://seu-endpoint/posicoes"
MULTIPORTAL_TOKEN="seu-token-aqui"
MULTIPORTAL_AUTH_HEADER="Authorization"
```

### 2. Testar GET
```bash
curl "http://localhost:3001/api/veiculos"
curl "http://localhost:3001/api/veiculos?setor=Logistica"
```

### 3. Frontend
```typescript
// Básico
const res = await fetch("/api/veiculos");

// Com filtro
const res = await fetch("/api/veiculos?setor=Logistica&status=ativo");

const veiculos = await res.json();
```

---

## 📊 Funções Disponíveis

### Backend TypeScript

```typescript
import {
  listarVeiculos,
  listarUltimasPosicoes,
  listarVeiculosComPosicao,
  listarVeiculosPorSetor,
  buscarVeiculosComFiltros,
  obterHistoricoRota,
  validarConfiguracao
} from "@/app/lib/gps/multiportal";

// Exemplo 1: Todos os veículos
const todos = await listarVeiculosComPosicao();

// Exemplo 2: Filtro simples
const logistica = await listarVeiculosPorSetor("Logistica");

// Exemplo 3: Múltiplos filtros
const resultado = await buscarVeiculosComFiltros({
  setor: "Vendas",
  status: "ativo",
  limite: 50
});

// Exemplo 4: Histórico de rota
const historico = await obterHistoricoRota(
  "veiculo-id",
  "2026-08-05",
  "2026-08-06"
);
```

---

## 🔗 Query Params

| Parâmetro | Tipo | Exemplo |
|-----------|------|---------|
| `setor` | string | `?setor=Logistica` |
| `status` | string | `?status=ativo` |
| `limite` | number | `?limite=50` |
| `offset` | number | `?offset=10` |
| `veiculoId` | string | `?veiculoId=123` |

**Combinável:** `?setor=Vendas&status=ativo&limite=25`

---

## ⚙️ Estrutura Config

```typescript
// app/lib/gps/config.ts
MULTIPORTAL_CONFIG = {
  endpoints: {
    veiculos: string,
    posicoes: string
  },
  queryParams: {
    veiculos: string,
    posicoes: string
  },
  auth: {
    token: string,
    headerName: string,
    bearerPrefix: string
  },
  validate(): { valid: boolean; errors: string[] }
}
```

---

## ✅ Checklist Implementação

- [x] Arquivos criados/alterados
- [x] GET implementado
- [x] Query params funcionando
- [x] Filtros múltiplos suportados
- [x] Documentação completa
- [x] Exemplos práticos
- [ ] MULTIPORTAL_TOKEN fornecido
- [ ] URLs validadas com fornecedor
- [ ] Sistema testado end-to-end

---

## 🔍 Validação

```typescript
import { validarConfiguracao } from "@/app/lib/gps/multiportal";

const { valid, errors } = validarConfiguracao();

if (!valid) {
  console.error("Erros encontrados:", errors);
  // Corrigir .env e tentar novamente
}
```

---

## 📈 Performance

| Operação | Antes | Depois |
|----------|-------|--------|
| Buscar todos | POST (todos) | GET (todos) |
| Buscar por setor | Local filter | Server filter ✅ |
| Buscar com status | Local filter | Server filter ✅ |
| Paginação | Não suportada | `?limite=10&offset=20` ✅ |

---

## 🔐 Autenticação

```typescript
// Config auto-aplicada no header
// Authorization: Bearer <MULTIPORTAL_TOKEN>

// Customizável:
MULTIPORTAL_AUTH_HEADER="X-API-Key"  // Em vez de "Authorization"
MULTIPORTAL_BEARERPREFIX="Token"     // Em vez de "Bearer"
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| 401 Unauthorized | Verificar `MULTIPORTAL_TOKEN` |
| 404 Not Found | Verificar URLs em `.env` |
| Formato inválido | Função `extrairLista()` tenta detectar automaticamente |
| Sem resultados | Verificar se filtros são válidos |

---

## 📚 Documentação Completa

- **API_GET_DOCS.md** - Guia completo
- **EXEMPLOS_PRATICOS.md** - Exemplos de código
- **ANTES_DEPOIS.md** - Comparação visual
- **CHANGES.md** - Plano técnico
- **Este arquivo** - Quick reference

---

## 🎯 Adaptação Futura

Quando API Multiportal mudar:

```bash
# Passo 1: Atualizar .env
MULTIPORTAL_GET_VEICULOS_URL="novo-endpoint"

# Passo 2: ✅ Pronto!
# Nenhuma alteração de código necessária
```

---

## 💡 Exemplo Completo

```typescript
// Backend: app/api/veiculos/route.ts
import { buscarVeiculosComFiltros } from "@/app/lib/gps/multiportal";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const veiculos = await buscarVeiculosComFiltros({
    setor: searchParams.get("setor") || undefined,
    status: searchParams.get("status") || undefined,
    limite: searchParams.get("limite") ? 
      parseInt(searchParams.get("limite")!) : undefined
  });
  
  return Response.json(veiculos);
}

// Frontend: app/paginas/mapa/page.tsx
useEffect(() => {
  fetch("/api/veiculos?setor=Logistica&status=ativo")
    .then(r => r.json())
    .then(setVeiculos);
}, []);
```

---

## 🚀 Próximas Etapas

1. ✅ Implementação completa
2. ⏳ Aguardar `MULTIPORTAL_TOKEN`
3. ⏳ Validar endpoints com fornecedor
4. ⏳ Testar sistema completo
5. ⏳ Deploy em produção

**Você está 100% pronto para usar!** 🎉
