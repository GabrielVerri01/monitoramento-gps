# 📚 Documentação: API GET - Consumo de Dados de Rastreamento

## 🔄 Mudanças Implementadas

### De POST para GET
O sistema foi migrado de usar `POST` para `GET` nas requisições à API Multiportal.

**Antes:**
```typescript
POST /veiculos (com body)
POST /posicoes/ultimaPosicao (com body)
```

**Agora:**
```typescript
GET /api/v1/veiculos?setor=Logistica&status=ativo
GET /api/v1/posicoes/ultimaPosicao?limite=100
```

---

## ⚙️ Configuração (`.env`)

```env
# Endpoints GET
MULTIPORTAL_GET_VEICULOS_URL="http://apiv1.multiportal.com.br:9870/api/v1/veiculos"
MULTIPORTAL_GET_POSICOES_URL="http://apiv1.multiportal.com.br:9870/api/v1/posicoes/ultimaPosicao"

# Query params padrão (deixe vazio se não precisar)
MULTIPORTAL_VEICULOS_QUERY_PARAMS=""
MULTIPORTAL_POSICOES_QUERY_PARAMS="limite=100"

# Autenticação
MULTIPORTAL_TOKEN="seu_token_aqui"
MULTIPORTAL_AUTH_HEADER="Authorization"  # Ajuste se necessário
```

---

## 📡 Exemplos de Requisições

### 1. **Frontend - Buscar todos os veículos**
```typescript
// app/paginas/mapa/page.tsx
const response = await fetch("/api/veiculos");
const veiculos = await response.json();
```

### 2. **Frontend - Buscar com filtros**
```typescript
const params = new URLSearchParams();
params.append("setor", "Logistica");
params.append("status", "ativo");

const response = await fetch(`/api/veiculos?${params.toString()}`);
const veiculos = await response.json();
```

### 3. **Backend - Buscar veículos de um setor**
```typescript
// Usar a função helper
import { listarVeiculosPorSetor } from "@/app/lib/gps/multiportal";

const veiculos = await listarVeiculosPorSetor("Logistica");
```

### 4. **Backend - Buscar com múltiplos filtros**
```typescript
import { buscarVeiculosComFiltros } from "@/app/lib/gps/multiportal";

const veiculos = await buscarVeiculosComFiltros({
  setor: "Vendas",
  status: "ativo",
  limite: 50,
  offset: 0,
});
```

### 5. **Backend - Histórico de rota**
```typescript
import { obterHistoricoRota } from "@/app/lib/gps/multiportal";

const rotaHistorico = await obterHistoricoRota(
  "veiculo-123",
  "2026-08-05",
  "2026-08-06"
);
```

---

## 📋 Query Params Suportados

### Veículos (`GET /api/veiculos`)
| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `setor` | string | Filtrar por setor | `?setor=Logistica` |
| `status` | string | Filtrar por status | `?status=ativo` |
| `limite` | number | Limitar resultados | `?limite=50` |
| `offset` | number | Paginação | `?offset=10` |
| `veiculoId` | string | ID específico | `?veiculoId=123` |

### Posições (`GET /api/v1/posicoes/ultimaPosicao`)
| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `limite` | number | Limitar resultados | `?limite=100` |
| `dataInicio` | string | Data inicial | `?dataInicio=2026-08-05` |
| `dataFim` | string | Data final | `?dataFim=2026-08-06` |

---

## 🎯 Estrutura de Arquivos

```
app/lib/gps/
├── config.ts           ← Configurações centralizadas
├── multiportal.ts      ← Funções GET (antes era POST)
└── types.ts           ← (Opcional) Tipos TypeScript

app/api/
├── veiculos/
│   └── route.ts        ← Suporta query params
└── aparelhos/
    └── route.ts        ← Já era GET
```

---

## 🔄 Fluxo de Requisição

```
Cliente
  ↓
GET /api/veiculos?setor=Logistica
  ↓
Route Handler (app/api/veiculos/route.ts)
  ├→ Extrai query params
  ├→ Chama listarVeiculosComPosicao(filtros)
  ↓
multiportal.ts
  ├→ Valida token
  ├→ Constrói URL: /api/v1/veiculos?setor=Logistica
  ├→ Adiciona headers: Authorization: Bearer TOKEN
  ├→ Faz GET request
  ↓
API Multiportal
  ↓
Retorna JSON com veículos
  ↓
Frontend exibe no mapa ✅
```

---

## ✅ Checklist de Validação

- [ ] `.env` configurado com endpoints GET
- [ ] `MULTIPORTAL_TOKEN` fornecido
- [ ] Testar: `curl http://localhost:3001/api/veiculos`
- [ ] Testar com filtros: `curl http://localhost:3001/api/veiculos?setor=Logistica`
- [ ] Mapa exibe veículos corretamente
- [ ] Filtros funcionam sem erros

---

## 🚀 Próximas Etapas

Quando a empresa fornecedora disponibilizar os endpoints GET finais:

1. Atualizar URLs no `.env`:
   ```env
   MULTIPORTAL_GET_VEICULOS_URL="novo_endpoint_aqui"
   MULTIPORTAL_GET_POSICOES_URL="novo_endpoint_aqui"
   ```

2. Ajustar query params se necessário:
   ```env
   MULTIPORTAL_VEICULOS_QUERY_PARAMS="novos_parametros"
   ```

3. **Nenhuma alteração de código necessária!** ✅

---

## 🔧 Troubleshooting

### "MULTIPORTAL_TOKEN não configurado"
**Solução:** Adicione `MULTIPORTAL_TOKEN` no `.env`

### "Erro ao buscar veículos (401)"
**Solução:** Token inválido ou expirado. Verifique `MULTIPORTAL_TOKEN`

### "Erro ao buscar veículos (404)"
**Solução:** URL do endpoint incorreta. Verifique `MULTIPORTAL_GET_VEICULOS_URL`

### Formato de resposta inesperado
**Solução:** Verifique qual formato a API retorna (array, `{data: [...]}`, etc). 
A função `extrairLista()` em `multiportal.ts` tenta detectar automaticamente.

---

## 📞 Suporte

Para dúvidas sobre a implementação, revise:
- `CHANGES.md` - Plano detalhado de alterações
- `app/lib/gps/config.ts` - Configurações
- `app/lib/gps/multiportal.ts` - Implementação GET
