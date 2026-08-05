# 🧪 Exemplos Práticos: Usando o Novo Sistema GET

## 1️⃣ Frontend - Buscar Veículos com Filtros

### Exemplo 1: Todos os veículos
```typescript
// app/paginas/mapa/page.tsx
useEffect(() => {
  async function carregarVeiculos() {
    const response = await fetch("/api/veiculos");
    const veiculos = await response.json();
    setVeiculos(veiculos);
  }
  
  carregarVeiculos();
}, []);
```

### Exemplo 2: Veículos de um setor específico
```typescript
const [setor, setSetor] = useState("Logistica");

useEffect(() => {
  async function carregarPorSetor() {
    const response = await fetch(`/api/veiculos?setor=${setor}`);
    const veiculos = await response.json();
    setVeiculos(veiculos);
  }
  
  carregarPorSetor();
}, [setor]);
```

### Exemplo 3: Múltiplos filtros
```typescript
useEffect(() => {
  async function buscarComFiltros() {
    const params = new URLSearchParams();
    params.append("setor", "Vendas");
    params.append("status", "ativo");
    params.append("limite", "50");
    
    const response = await fetch(`/api/veiculos?${params.toString()}`);
    const veiculos = await response.json();
    setVeiculos(veiculos);
  }
  
  buscarComFiltros();
}, []);
```

---

## 2️⃣ Backend - Usar Funções Helper

### Exemplo 1: Buscar todos os veículos
```typescript
// Em qualquer server function ou API route
import { listarVeiculosComPosicao } from "@/app/lib/gps/multiportal";

export async function GET() {
  try {
    const veiculos = await listarVeiculosComPosicao();
    return Response.json(veiculos);
  } catch (error) {
    return Response.json({ error: "Falha ao buscar" }, { status: 500 });
  }
}
```

### Exemplo 2: Buscar por setor
```typescript
import { listarVeiculosPorSetor } from "@/app/lib/gps/multiportal";

const veiculosLogistica = await listarVeiculosPorSetor("Logistica");
console.log(`Encontrados ${veiculosLogistica.length} veículos em Logistica`);
```

### Exemplo 3: Buscar com múltiplos filtros
```typescript
import { buscarVeiculosComFiltros } from "@/app/lib/gps/multiportal";

const resultado = await buscarVeiculosComFiltros({
  setor: "Vendas",
  status: "ativo",
  limite: 25,
  offset: 0
});

console.log(`Página 1: ${resultado.length} veículos`);
```

### Exemplo 4: Histórico de rota
```typescript
import { obterHistoricoRota } from "@/app/lib/gps/multiportal";

const rotaHistorico = await obterHistoricoRota(
  "veiculo-001",
  "2026-08-05",
  "2026-08-06"
);

rotaHistorico.forEach(ponto => {
  console.log(`${ponto.dataHora}: ${ponto.latitude}, ${ponto.longitude}`);
});
```

---

## 3️⃣ URL Query Params - Referência

### Query String Examples
```
/api/veiculos
  → Todos os veículos

/api/veiculos?setor=Logistica
  → Veículos do setor Logistica

/api/veiculos?status=ativo
  → Apenas veículos ativos

/api/veiculos?limite=10
  → Primeiros 10 veículos

/api/veiculos?offset=10&limite=10
  → Veículos 11-20 (paginação)

/api/veiculos?setor=Vendas&status=ativo
  → Veículos de Vendas que estão ativos

/api/veiculos?setor=SEMUSC&status=ativo&limite=50
  → Primeiros 50 veículos ativos de SEMUSC

/api/veiculos?veiculoId=12345
  → Veículo específico
```

---

## 4️⃣ Resposta Esperada

### JSON retornado pelo backend
```json
[
  {
    "id": "1",
    "nome": "Carro 1",
    "placa": "ABC-1234",
    "setor": "Logistica",
    "status": "ativo",
    "velocidade": 62,
    "ligado": true,
    "lat": -23.5505,
    "lng": -46.6333,
    "ultimaAtualizacao": "2026-08-05T12:34:56Z",
    "aparelhos": ["GPS", "RÁDIO"]
  },
  {
    "id": "2",
    "nome": "Carro 2",
    "placa": "DEF-5678",
    "setor": "Vendas",
    "status": "ativo",
    "velocidade": 45,
    "ligado": true,
    "lat": -23.558,
    "lng": -46.641,
    "ultimaAtualizacao": "2026-08-05T12:34:50Z",
    "aparelhos": ["GPS"]
  }
]
```

---

## 5️⃣ Tratamento de Erros

### Exemplo com tratamento completo
```typescript
async function buscarVeiculosSeguro() {
  try {
    const response = await fetch("/api/veiculos?setor=Logistica");
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const veiculos = await response.json();
    
    if (!Array.isArray(veiculos)) {
      throw new Error("Formato de resposta inválido");
    }
    
    return veiculos;
    
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    
    if (error instanceof TypeError) {
      // Erro de conexão
      console.error("Erro de conexão - verifique se servidor está rodando");
    }
    
    return [];  // Retornar vazio em caso de erro
  }
}
```

---

## 6️⃣ Paginação

### Implementar paginação no frontend
```typescript
const [pagina, setPagina] = useState(1);
const ITENS_POR_PAGINA = 10;

useEffect(() => {
  async function buscarPagina() {
    const offset = (pagina - 1) * ITENS_POR_PAGINA;
    
    const params = new URLSearchParams();
    params.append("limite", String(ITENS_POR_PAGINA));
    params.append("offset", String(offset));
    
    const response = await fetch(`/api/veiculos?${params.toString()}`);
    const veiculos = await response.json();
    setVeiculos(veiculos);
  }
  
  buscarPagina();
}, [pagina]);

// Botões de paginação
return (
  <>
    <div>
      {veiculos.map(v => <div key={v.id}>{v.nome}</div>)}
    </div>
    <button onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>
      ← Anterior
    </button>
    <button onClick={() => setPagina(p => p + 1)}>
      Próxima →
    </button>
  </>
);
```

---

## 7️⃣ Filtros Dinâmicos

### Componente com filtros
```typescript
function FiltrosVeiculos() {
  const [setor, setSetor] = useState("");
  const [status, setStatus] = useState("");
  const [veiculos, setVeiculos] = useState([]);

  async function buscar() {
    const params = new URLSearchParams();
    
    if (setor) params.append("setor", setor);
    if (status) params.append("status", status);
    
    const response = await fetch(`/api/veiculos?${params.toString()}`);
    setVeiculos(await response.json());
  }

  return (
    <div>
      <select value={setor} onChange={(e) => setSetor(e.target.value)}>
        <option value="">Todos os setores</option>
        <option value="Logistica">Logistica</option>
        <option value="Vendas">Vendas</option>
        <option value="SEMUSC">SEMUSC</option>
      </select>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>

      <button onClick={buscar}>Buscar</button>

      <div>
        {veiculos.map(v => (
          <div key={v.id}>
            {v.nome} - {v.setor} ({v.status})
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8️⃣ Validação de Configuração

### Validar antes de usar
```typescript
import { validarConfiguracao } from "@/app/lib/gps/multiportal";

export async function GET() {
  const { valid, errors } = validarConfiguracao();
  
  if (!valid) {
    console.error("Configuração inválida:", errors);
    return Response.json(
      { error: "Configuração incompleta", details: errors },
      { status: 500 }
    );
  }
  
  // Prosseguir com a requisição
  const veiculos = await listarVeiculosComPosicao();
  return Response.json(veiculos);
}
```

---

## 9️⃣ Request/Response Completo

### Fluxo completo de uma requisição
```
CLIENT REQUEST:
──────────────
GET /api/veiculos?setor=Logistica&status=ativo
Host: localhost:3001
Authorization: Bearer <user_token>

SERVER PROCESSING:
──────────────────
1. Route Handler (app/api/veiculos/route.ts)
   ├─ Extrai query params: setor="Logistica", status="ativo"
   ├─ Chama: listarVeiculosComPosicao(filtros)
   
2. Multiportal Service (app/lib/gps/multiportal.ts)
   ├─ Carrega config: MULTIPORTAL_GET_VEICULOS_URL
   ├─ Constrói URL: http://api.multiportal.com/veiculos?setor=Logistica&status=ativo
   ├─ Adiciona header: Authorization: Bearer MULTIPORTAL_TOKEN
   ├─ Faz GET request
   
3. API Multiportal
   ├─ Processa filtros
   ├─ Retorna veículos filtrados
   
4. Multiportal Service (combina com posições)
   ├─ Busca posições
   ├─ Combina dados
   ├─ Retorna array de veículos com coordenadas

SERVER RESPONSE:
────────────────
HTTP 200 OK
Content-Type: application/json

[
  {
    "id": "1",
    "nome": "Carro 1",
    "setor": "Logistica",
    "status": "ativo",
    "lat": -23.5505,
    "lng": -46.6333,
    ...
  },
  ...
]

CLIENT RENDER:
──────────────
Mapa exibe marcadores dos veículos filtrados ✅
```

---

## 🔟 Checklist: Implementação Pronta?

- [ ] `.env` tem `MULTIPORTAL_GET_VEICULOS_URL`
- [ ] `.env` tem `MULTIPORTAL_GET_POSICOES_URL`
- [ ] `.env` tem `MULTIPORTAL_TOKEN`
- [ ] `app/lib/gps/config.ts` criado
- [ ] `app/lib/gps/multiportal.ts` atualizado para GET
- [ ] `app/api/veiculos/route.ts` suporta query params
- [ ] Frontend consegue fazer requisições com filtros
- [ ] Mapa exibe veículos corretamente
- [ ] Filtros funcionam sem erros

✅ Se todos os itens estão marcados, você está pronto! 🚀
