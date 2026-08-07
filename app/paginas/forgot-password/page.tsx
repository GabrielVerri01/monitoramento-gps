 "use client"
import { useState } from "react";
import Image from "next/image";
import { HiKey } from "react-icons/hi2";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    return(
        <main className="login-page min-h-screen flex items-center justify-center" style={{ background: '#FFFFFF' }}>
            <div className="login-form-container">
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
                <h1 className="login-title">Recuperar Senha</h1>
                <form onSubmit={(e) => { e.preventDefault(); setMessage("Instruções para recuperar a senha foram enviadas para o seu email."); /* Lógica para recuperar senha */ }}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className="login-button">
                        <HiKey className="inline-block mr-2" />
                        Recuperar Senha
                    </button>
                    {message && <p className="login-message">{message}</p>}
                </form>
                <div className="login-links">
                    <a href="/" className="login-link">Voltar para Login</a>
                </div>
                    <p className="login-footer">© 2026 Prefeitura de São Luís - SEMIT</p>
            </div>
        </main>
    );
}

// POR ENQUANTO DESNECESSARIO, O SISTEMA É INTERNO