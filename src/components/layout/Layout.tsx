import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
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

  const renderMenu = (isMobile = false) => (
    <nav className={`${isMobile ? 'p-4' : 'p-6'}`}>
      {menuItems.map((item) => (
        <a
          key={item.path}
          href={item.path}
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-md mb-2 ${
            location.pathname === item.path
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={(e) => {
            e.preventDefault();
            navigate(item.path);
            if (isMobile) setIsMenuOpen(false);
          }}
        >
          <span className="mr-3">{item.icon}</span>
          {item.label}
        </a>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Menu lateral fixo para desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-lg">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
            <span className="text-white font-semibold text-lg">COBAL Control</span>
          </div>
          {renderMenu()}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 md:ml-64">
        {/* Cabeçalho */}
        <header className="bg-white shadow">
          <div className="container-responsive">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="flex items-center">
                  <img
                    src="/emblema-ppgo.png"
                    alt="Emblema Polícia Penal de Goiás"
                    className="h-12 w-auto sm:h-16 mr-3"
                  />
                  <div className="mobile-stack">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                      Sistema de Controle COBAL
                    </h1>
                    <p className="text-sm text-gray-500 hide-on-mobile">
                      Casa de Prisão Provisória PP Jaílton Barbo Ferreira de Luziânia GO
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Menu lateral móvel */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          {renderMenu(true)}
        </div>

        {/* Conteúdo principal */}
        <main className="container-responsive py-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 