 "use client"

 import {useState} from "react";
 import { useRouter } from "next/navigation";
 

export default function CadastrarPage() {
    const [usuario, setUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const router = useRouter();

    async function cadastrarUsuario() {
        const response = await fetch('/api/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ usuario, email, senha }),
        });
        const data = await response.json();

        if (!response.ok) {
            alert('Erro ao cadastrar usuário: ' + data.error);
            return;
        }

        alert('Usuário cadastrado com sucesso!');
        router.push('/'); 
    }


    return(
        <main>
            <h1 className="text-2xl font-bold">Cadastro de Usuário</h1>
            <form onSubmit={(e) => { e.preventDefault(); cadastrarUsuario(); }} className="flex flex-col gap-2 justify-center items-center">
                <h2 className="text-xl font-semibold">Preencha os campos abaixo</h2>
                <label className="font-medium">Usuário:</label>
                <input type="text" placeholder="Nome de usuário" className="border border-gray-300 rounded" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
                <label className="font-medium">Email:</label>
                <input type="email" placeholder="Email" className="border border-gray-300 rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label className="font-medium">Senha:</label>
                <input type="password" placeholder="Senha" className="border border-gray-300 rounded" value={senha} onChange={(e) => setSenha(e.target.value)} />
                <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2 mt-2">Cadastrar</button>
            </form>
        </main>
    )
}