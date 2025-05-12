import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/entregas/registrar', label: 'Registrar COBAL', icon: '📝' },
    { path: '/entregas/buscar', label: 'Buscar Entregas', icon: '🔍' },
    { path: '/relatorios', label: 'Relatórios', icon: '📋' },
    { path: '/presos/cadastro', label: 'Cadastro de Presos', icon: '🧑‍⚖️' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                src="/emblema-ppgo.png"
                alt="Emblema Polícia Penal de Goiás"
                className="h-16 w-auto mr-4"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema de Controle COBAL
                </h1>
                <p className="text-sm text-gray-500">
                  Casa de Prisão Provisória PP Jaílton Barbo Ferreira de Luziânia GO
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Menu lateral */}
        <aside
          className={`fixed inset-y-0 left-0 transform ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out z-30`}
        >
          <div className="h-full w-64 bg-white shadow-lg">
            <nav className="mt-5 px-2">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      location.pathname === item.path
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Botão de menu para mobile */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40"
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>
    </div>
  );
} 