"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSignInAlt } from "react-icons/fa";

export default function LoginPage(){
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  async function LoginUser() {
    if (!usuario || !senha) {
      setErro("Por favor, preencha todos os campos");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, senha }),
      });

      const textoResposta = await response.text();
      let data: { error?: string } = {};
      try {
        data = textoResposta ? JSON.parse(textoResposta) : {};
      } catch {
        data = {};
      }

      if (response.ok) {
        alert("Login realizado com sucesso!");
        router.push("/paginas/mapa");
      } else {
        setErro(data.error || "Falha no login. Verifique suas credenciais.");
      }
    } catch (err) {
      setErro("Erro ao conectar com o servidor. Tente novamente.");
      console.error("Erro:", err);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page min-h-screen flex items-center justify-center" style={{ background: '#FFFFFF' }}>
      <div className="login-form-container">
        {/* Logo SEMIT com Imagem */}
        <div className="semit-logo-container">
          <Image
            src="/images/logo-semit.png"
            alt="Prefeitura de São Luís"
            width={280}
            height={80}
            priority
            style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
          />
        </div>

        {/* Título */}
        <h1 className="login-title">Monitoramento GPS</h1>

        {/* Erro */}
        {erro && (
          <div className="login-error">
            {erro}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={(e) => { e.preventDefault(); LoginUser(); }}>
          <input
            type="text"
            placeholder="Usuário"
            className="login-input"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            disabled={carregando}
          />

          <input
            type="password"
            placeholder="Senha"
            className="login-input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={carregando}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                LoginUser();
              }
            }}
          />

          <button
            type="submit"
            className="login-button"
            disabled={carregando}
          >
            {carregando ? "Entrando..." : (<><FaSignInAlt className="inline-block mr-2" />ENTRAR</>)}
          </button>
        </form>

        {/* Links */}
        <div className="login-links">
          <a href="./paginas/forgot-password" className="login-link">
            Esqueceu a senha?
          </a>
          <a href="./paginas/cadastrar" className="login-link">
            Cadastre-se
          </a>
        </div>

        {/* Footer */}
        <p className="login-footer">
          © 2026 Prefeitura de São Luís - SEMIT
        </p>
      </div>
    </main>
  )
}