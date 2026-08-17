import Link from "next/link";

export default function RastroSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">RastroSystem</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/rastrosystem" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/rastrosystem/veiculos" className="text-gray-600 hover:text-gray-900">
                Veículos
              </Link>
              <Link href="/rastrosystem/clientes" className="text-gray-600 hover:text-gray-900">
                Clientes
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
