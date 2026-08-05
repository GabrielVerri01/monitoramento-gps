# Plano de Adaptação: POST → GET para API Multiportal

## 📋 Análise da Estrutura Atual

### Arquivo: `app/lib/gps/multiportal.ts`
**Status Atual:**
- `listarVeiculos()` → POST `/veiculos`
- `listarUltimasPosicoes()` → POST `/posicoes/ultimaPosicao`
- Ambas usam headers com token de autenticação

**Problema:** Usando POST quando deveria usar GET

---

## ✅ Alterações Necessárias

### 1. **Atualizar `.env`** com novos endpoints GET
```env
# Endpoints GET (nova abordagem)
MULTIPORTAL_GET_VEICULOS_URL="http://apiv1.multiportal.com.br:9870/api/v1/veiculos"
MULTIPORTAL_GET_POSICOES_URL="http://apiv1.multiportal.com.br:9870/api/v1/posicoes/ultimaPosicao"

# Query params (configuráveis)
MULTIPORTAL_VEICULOS_QUERY_PARAMS="status=ativo"
MULTIPORTAL_POSICOES_QUERY_PARAMS="limite=100"

# Autenticação
MULTIPORTAL_TOKEN=""
MULTIPORTAL_API_KEY=""  # Se a API usar API Key em vez de Token
MULTIPORTAL_AUTH_HEADER="Authorization"  # Nome do header de autenticação
```

### 2. **Reescrever `app/lib/gps/multiportal.ts`**
Transformar funções POST em GET mantendo compatibilidade

**Novo arquivo estruturado:**
```typescript
// Configurações
const MULTIPORTAL_ENDPOINTS = {
  VEICULOS: process.env.MULTIPORTAL_GET_VEICULOS_URL,
  POSICOES: process.env.MULTIPORTAL_GET_POSICOES_URL,
};

// Headers com token
function getHeaders() {
  const token = process.env.MULTIPORTAL_TOKEN;
  const authHeader = process.env.MULTIPORTAL_AUTH_HEADER || "Authorization";
  
  if (!token) throw new Error("MULTIPORTAL_TOKEN não configurado");
  
  return {
    "Content-Type": "application/json",
    [authHeader]: `Bearer ${token}`,  // Ajustável
  };
}

// Construir query string (modular)
function buildQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}

// GET Veículos (transformação POST → GET)
export async function listarVeiculos(filtros?: Record<string, any>) {
  const url = new URL(MULTIPORTAL_ENDPOINTS.VEICULOS);
  
  // Adicionar query params padrão
  const queryParams = new URLSearchParams(process.env.MULTIPORTAL_VEICULOS_QUERY_PARAMS || "");
  
  // Adicionar filtros customizados
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
  }
  
  url.search = queryParams.toString();
  
  const response = await fetch(url.toString(), {
    method: "GET",  // ✅ Mudança principal
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar veículos (${response.status})`);
  }

  return extrairLista(response);
}

// GET Posições (transformação POST → GET)
export async function listarUltimasPosicoes(filtros?: Record<string, any>) {
  const url = new URL(MULTIPORTAL_ENDPOINTS.POSICOES);
  
  // Adicionar query params padrão
  const queryParams = new URLSearchParams(process.env.MULTIPORTAL_POSICOES_QUERY_PARAMS || "");
  
  // Adicionar filtros customizados
  if (filtros) {
    Object.entries(filtros).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
  }
  
  url.search = queryParams.toString();
  
  const response = await fetch(url.toString(), {
    method: "GET",  // ✅ Mudança principal
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar posições (${response.status})`);
  }

  return extrairLista(response);
}

// Manter compatibilidade com chamadas existentes
export async function listarVeiculosComPosicao() {
  const [veiculos, posicoes] = await Promise.all([
    listarVeiculos(),
    listarUltimasPosicoes(),
  ]);

  const posicaoPorVeiculo = new Map(
    posicoes.map((p) => [p.veiculoId, p])
  );

  return veiculos.map((veiculo) => {
    const posicao = posicaoPorVeiculo.get(veiculo.id);
    return {
      ...veiculo,
      lat: posicao?.latitude ?? null,
      lng: posicao?.longitude ?? null,
    };
  });
}
```

### 3. **Melhorias no `app/api/veiculos/route.ts`**
Adicionar suporte a query params para filtros
```typescript
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extrair filtros da query string
    const filtros: Record<string, any> = {};
    
    if (searchParams.has("setor")) {
      filtros.setor = searchParams.get("setor");
    }
    if (searchParams.has("status")) {
      filtros.status = searchParams.get("status");
    }
    if (searchParams.has("limite")) {
      filtros.limite = parseInt(searchParams.get("limite") || "100");
    }
    
    // Passar filtros para a função
    const veiculos = await listarVeiculosComPosicao(filtros);
    
    return NextResponse.json(veiculos);
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    return NextResponse.json(
      {
        error: "Falha ao buscar veículos",
        detalhe: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
```

### 4. **Frontend: Atualizar chamadas em `app/paginas/mapa/page.tsx`**
Passar filtros via query string
```typescript
// Antes (sem filtros)
const respostaVeiculos = await fetch("/api/veiculos");

// Depois (com filtros opcionais)
const queryParams = new URLSearchParams();
queryParams.append("setor", "Logistica");
queryParams.append("status", "ativo");

const respostaVeiculos = await fetch(`/api/veiculos?${queryParams.toString()}`);
```

---

## 🎯 Estrutura Modular Final

```
app/
├── lib/gps/
│   ├── multiportal.ts          ← GET com query params
│   ├── config.ts               ← Centralize configurações (novo)
│   └── types.ts                ← Tipos TypeScript (novo)
├── api/
│   ├── veiculos/route.ts       ← Suporta query params
│   └── aparelhos/route.ts      ← Já está em GET ✅
└── paginas/mapa/
    └── page.tsx                ← Pronto para passar filtros
```

---

## 📝 Checklist de Implementação

- [ ] Atualizar `.env` com novos endpoints GET
- [ ] Reescrever `app/lib/gps/multiportal.ts` (POST → GET)
- [ ] Melhorar `app/api/veiculos/route.ts` com query params
- [ ] Testar com dados mock primeiro
- [ ] Quando fornecedor disponibilizar endpoints GET, apenas ajustar URLs no `.env`

---

## ⚠️ Notas Importantes

1. **Compatibilidade Reversa:** As funções mantêm a mesma assinatura, então código existente não quebra
2. **Query Params:** Modular e configurável via `.env`
3. **Headers:** Ajustável para diferentes tipos de autenticação
4. **Filtros:** Suportam filtros customizados sem alterar código

**Próximo passo:** Implementar essas alterações no código!
