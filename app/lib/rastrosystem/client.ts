import { RASTROSYSTEM_CONFIG } from "./config";
import { AuthTokenResponse, ErroResponse } from "./types";

// ============================================
// GERENCIADOR DE TOKEN
// ============================================

let currentToken: AuthTokenResponse | null = null;
let tokenExpirationTime: number = 0;
let tokenRefreshPromise: Promise<AuthTokenResponse> | null = null;

async function autenticar(): Promise<AuthTokenResponse> {
  const { baseUrl, auth } = RASTROSYSTEM_CONFIG;

  const params = new URLSearchParams();
  params.append("username", auth.username);
  params.append("password", auth.password);
  params.append("grant_type", "password");

  const url = `${baseUrl}${RASTROSYSTEM_CONFIG.endpoints.oauth}`;

  console.log(`[AUTH] Autenticando em ${url}`);
  console.log(`[AUTH] Username: ${auth.username}`);
  console.log(`[AUTH] Password: ${auth.password ? "***" : "VAZIO"}`);
  console.log(`[AUTH] Body: ${params.toString()}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`[AUTH] Erro: ${response.status}`);
    console.error(`[AUTH] Resposta da API: ${error}`);
    throw new Error(
      `Falha ao autenticar com RastroSystem: ${response.status} ${response.statusText} - ${error}`
    );
  }

  const data: AuthTokenResponse = await response.json();
  const expirationTime = Date.now() + (data.expires_in || 3600) * 1000;

  currentToken = data;
  tokenExpirationTime = expirationTime;
  tokenRefreshPromise = null;

  console.log(`[AUTH] Token obtido com sucesso, expira em ${new Date(expirationTime)}`);

  return data;
}

async function refreshToken(): Promise<AuthTokenResponse> {
  if (!currentToken?.refresh_token) {
    console.log("[AUTH] Sem refresh_token, fazendo novo login");
    return autenticar();
  }

  const { baseUrl } = RASTROSYSTEM_CONFIG;
  const params = new URLSearchParams();
  params.append("auth_token", currentToken.access_token);
  params.append("refresh_token", currentToken.refresh_token);
  params.append("grant_type", "refresh_token");

  const url = `${baseUrl}${RASTROSYSTEM_CONFIG.endpoints.oauth}`;

  console.log(`[AUTH] Renovando token`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    console.log("[AUTH] Refresh falhou, fazendo novo login");
    return autenticar();
  }

  const data: AuthTokenResponse = await response.json();
  const expirationTime = Date.now() + (data.expires_in || 3600) * 1000;

  currentToken = data;
  tokenExpirationTime = expirationTime;
  tokenRefreshPromise = null;

  console.log(`[AUTH] Token renovado, expira em ${new Date(expirationTime)}`);

  return data;
}

async function obterToken(): Promise<string> {
  const agora = Date.now();
  const isTokenProximoDeExpirar =
    !currentToken || agora + RASTROSYSTEM_CONFIG.tokenRefreshThresholdMs >= tokenExpirationTime;

  if (isTokenProximoDeExpirar) {
    // Se já existe uma renovação em andamento, esperar por ela
    if (tokenRefreshPromise) {
      const token = await tokenRefreshPromise;
      return token.access_token;
    }

    // Iniciar novo refresh
    tokenRefreshPromise = refreshToken();
    const token = await tokenRefreshPromise;
    return token.access_token;
  }

  return currentToken!.access_token;
}

// ============================================
// CLIENTE HTTP COM RETRY
// ============================================

export async function fazerRequisicao(
  metodo: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  opcoes?: {
    body?: unknown;
    queryParams?: Record<string, any>;
    headers?: Record<string, string>;
  }
): Promise<any> {
  const { baseUrl } = RASTROSYSTEM_CONFIG;
  const token = await obterToken();

  // Construir URL
  const url = new URL(`${baseUrl}${endpoint}`);
  if (opcoes?.queryParams) {
    Object.entries(opcoes.queryParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Headers padrão com autenticação
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...opcoes?.headers,
  };

  // Body
  let body: string | undefined;
  if (opcoes?.body) {
    body = JSON.stringify(opcoes.body);
  }

  // Retry logic
  let ultimoErro: Error | null = null;

  for (let tentativa = 1; tentativa <= RASTROSYSTEM_CONFIG.maxRetries; tentativa++) {
    try {
      console.log(`[${metodo}] ${url.toString()} (tentativa ${tentativa})`);

      const response = await fetch(url.toString(), {
        method: metodo,
        headers,
        body,
      });

      // Sucesso
      if (response.ok) {
        const data = await response.json();
        console.log(`[${metodo}] OK ${response.status}`);
        return data;
      }

      // Erro 401 (não autorizado) → tentar refresh
      if (response.status === 401 && tentativa < RASTROSYSTEM_CONFIG.maxRetries) {
        console.log("[CLIENTE] Token inválido ou expirado, tentando refresh");
        currentToken = null;
        tokenExpirationTime = 0;
        const novoToken = await obterToken();
        headers.Authorization = `Bearer ${novoToken}`;
        continue;
      }

      // Erro 5xx → retry
      if (response.status >= 500 && tentativa < RASTROSYSTEM_CONFIG.maxRetries) {
        const errorText = await response.text();
        ultimoErro = new Error(
          `[${metodo}] Erro ${response.status}: ${errorText.substring(0, 200)}`
        );
        console.log(`${ultimoErro.message}, tentando novamente...`);
        await new Promise((r) => setTimeout(r, RASTROSYSTEM_CONFIG.retryDelayMs * tentativa));
        continue;
      }

      // Erro 4xx ou final
      const errorText = await response.text();
      let errorData: ErroResponse;

      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText, status: response.status };
      }

      throw new Error(
        `[${metodo}] ${response.status} ${response.statusText}: ${errorData.message || errorText.substring(0, 200)}`
      );
    } catch (erro) {
      ultimoErro = erro instanceof Error ? erro : new Error(String(erro));

      // Se é a última tentativa, lançar
      if (tentativa === RASTROSYSTEM_CONFIG.maxRetries) {
        throw ultimoErro;
      }

      console.error(`${ultimoErro.message}, tentando novamente...`);
      await new Promise((r) => setTimeout(r, RASTROSYSTEM_CONFIG.retryDelayMs * tentativa));
    }
  }

  throw ultimoErro || new Error("Erro desconhecido após múltiplas tentativas");
}

// ============================================
// FUNÇÕES HELPER
// ============================================

export async function validarConfiguracao(): Promise<{ valid: boolean; errors: string[] }> {
  const resultado = RASTROSYSTEM_CONFIG.validate();

  if (!resultado.valid) {
    console.error("[CONFIG] Erros de configuração:", resultado.errors);
  }

  return resultado;
}

export async function testarConexao(): Promise<boolean> {
  try {
    const validacao = await validarConfiguracao();
    if (!validacao.valid) {
      return false;
    }

    console.log("[CLIENTE] Testando autenticação...");
    await obterToken();
    console.log("[CLIENTE] Autenticação OK!");
    return true;
  } catch (erro) {
    console.error("[CLIENTE] Erro ao testar conexão:", erro);
    return false;
  }
}
