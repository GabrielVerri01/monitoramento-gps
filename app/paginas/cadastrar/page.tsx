"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUserPlus } from "react-icons/fa";

export default function CadastrarPage() {
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  async function cadastrarUsuario() {
    if (!usuario || !email || !senha) {
      setErro("Por favor, preencha todos os campos");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const response = await fetch("/api/cadastrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || "Erro ao cadastrar usuário");
        return;
      }

      alert("Usuário cadastrado com sucesso!");
      router.push("/");
    } catch (err) {
      setErro("Erro ao conectar com o servidor. Tente novamente.");
      console.error("Erro:", err);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page min-h-screen flex items-center justify-center" style={{ background: "#FFFFFF" }}>
      <div className="login-form-container">
        {/* Logo SEMIT com Imagem */}
        <div className="semit-logo-container">
          <Image
            src="/images/logo-semit.png"
            alt="Prefeitura de São Luís"
            width={280}
            height={80}
            priority
            style={{ width: "auto", height: "auto", maxWidth: "100%" }}
          />
        </div>

        {/* Título */}
        <h1 className="login-title">Cadastro de Usuário</h1>

        {/* Erro */}
        {erro && <div className="login-error">{erro}</div>}

        {/* Formulário */}
        <form onSubmit={(e) => { e.preventDefault(); cadastrarUsuario(); }}>
          <input
            type="text"
            placeholder="Nome de usuário"
            className="login-input"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            disabled={carregando}
          />

          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={carregando}
          />

          <input
            type="password"
            placeholder="Senha"
            className="login-input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={carregando}
          />

          <button
            type="submit"
            className="login-button"
            disabled={carregando}
          >
            {carregando ? "Cadastrando..." : (<><FaUserPlus className="inline-block mr-2" />CADASTRAR</>)}
          </button>
        </form>

        {/* Links */}
        <div className="login-links">
          <a href="/" className="login-link">
            Voltar ao Login
          </a>
        </div>

        {/* Footer */}
        <p className="login-footer">
          © 2026 Prefeitura de São Luís - SEMIT
        </p>
      </div>
    </main>
  );
}