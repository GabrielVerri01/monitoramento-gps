"use client";

import { useState, useEffect } from "react";

interface HealthStatus {
  status: "ok" | "erro";
  message: string;
  timestamp?: string;
  error?: string;
}

export default function RastroSystemDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testando, setTestando] = useState(false);
  const [ultimaTentativa, setUltimaTentativa] = useState<string | null>(null);

  const testarConexao = async () => {
    setTestando(true);
    try {
      const response = await fetch("/api/rastrosystem/health");
      const data = await response.json();
      setHealthStatus(data);
      setUltimaTentativa(new Date().toLocaleTimeString("pt-BR"));
    } catch (erro) {
      setHealthStatus({
        status: "erro",
        message: "Erro ao conectar com o servidor",
        error: erro instanceof Error ? erro.message : "Erro desconhecido",
      });
    } finally {
      setTestando(false);
    }
  };

  useEffect(() => {
    testarConexao();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard RastroSystem</h2>
        <p className="mt-2 text-gray-600">Integração com API RastroSystem</p>
      </div>

      {/* Status Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Status da Conexão</h3>

            <div className="mt-6 space-y-4">
              {loading && !healthStatus ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Verificando conexão...</p>
                </div>
              ) : healthStatus ? (
                <>
                  {/* Status Indicator */}
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        healthStatus.status === "ok" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span
                      className={`text-lg font-semibold ${
                        healthStatus.status === "ok" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {healthStatus.status === "ok" ? "Conectado" : "Desconectado"}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-gray-700">{healthStatus.message}</p>
                    {healthStatus.error && (
                      <p className="text-red-600 text-sm mt-2">{healthStatus.error}</p>
                    )}
                  </div>

                  {/* Timestamp */}
                  {healthStatus.timestamp && (
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Última sincronização:</strong> {healthStatus.timestamp}
                      </p>
                    </div>
                  )}

                  {ultimaTentativa && (
                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Última tentativa:</strong> {ultimaTentativa}
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={testarConexao}
            disabled={testando}
            className={`ml-4 px-4 py-2 rounded font-medium text-white transition-colors ${
              testando
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {testando ? "Testando..." : "Testar Conexão"}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-gray-600 text-sm font-medium uppercase">Clientes</h4>
          <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
          <p className="text-sm text-gray-600 mt-2">Sincronizados</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-gray-600 text-sm font-medium uppercase">Veículos</h4>
          <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
          <p className="text-sm text-gray-600 mt-2">Sincronizados</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-gray-600 text-sm font-medium uppercase">Equipamentos</h4>
          <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
          <p className="text-sm text-gray-600 mt-2">Sincronizados</p>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-blue-900 font-medium">Configuração Necessária</h4>
        <p className="text-blue-800 mt-2 text-sm">
          Para que a integração funcione, você precisa adicionar no arquivo <code className="bg-white px-2 py-1 rounded">.env.local</code>:
        </p>
        <pre className="bg-white rounded p-3 mt-3 text-sm overflow-x-auto border border-blue-200">
          <code>{`RASTROSYSTEM_BASE_URL=https://teste.rastrosystem.com.br/api_v3
RASTROSYSTEM_USERNAME=seu_usuario
RASTROSYSTEM_PASSWORD=sua_senha`}</code>
        </pre>
      </div>
    </div>
  );
}
