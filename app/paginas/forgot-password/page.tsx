 "use client"
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    return(
        <main>
            <h1 className="text-2xl font-bold">Recuperar Senha</h1>
            <form onSubmit={(e) => { e.preventDefault(); alert('Instruções de recuperação de senha enviadas para o email fornecido.'); }} className="flex flex-col gap-2 justify-center items-center">
                <h2 className="text-xl font-semibold">Nos informe seu email</h2>
                <label className="font-medium">Email:</label>
                <input type="email" placeholder="Email" className="border border-gray-300 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 mt-2">Recuperar Senha</button>
            </form>
        </main>
    )
}