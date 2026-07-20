"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage(){
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  async function LoginUser() {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usuario, senha }),
    });
    const data = await response.json();
    if (response.ok) {
      alert("Login realizado com sucesso!");
      router.push("/paginas/mapa");
    } else {
      alert("Falha no login. Verifique suas credenciais.");
    }
  }

  return(
    <main>
      <h1 className="text-2xl font-bold">Monitoramento GPS</h1>
      <form className="flex flex-col gap-2 justify-center items-center" onSubmit={(e) => { e.preventDefault(); LoginUser(); }}>
        <h2 className="text-xl font-semibold">Faça seu login</h2>
        <label className="font-medium">Usuário:</label>
        <input type="text" placeholder="Usuário" className="border border-gray-300 rounded" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <label className="font-medium">Senha:</label>
        <input type="password" placeholder="Senha" className="border border-gray-300 rounded" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 mt-2">Entrar</button>
      </form>
      <p className="flex gap-2 justify-center items-center py-4">Não tem uma conta?<a href="./paginas/cadastrar">Cadastre-se</a></p>
      <p className="flex gap-2 justify-center items-center py-4">Esqueceu a senha?<a href="./paginas/forgot-password">Clique aqui</a></p>
    </main>
  )
}