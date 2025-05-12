import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button 
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none"
              >
                <Menu size={24} />
              </button>
              <div className="hidden md:flex items-center">
                <img 
                  src="https://www.goias.gov.br/images/imagemTopoTexto.png" 
                  alt="Emblema da Polícia Penal de Goiás" 
                  className="h-10 w-auto mr-3"
                />
                <h1 className="text-lg md:text-xl font-semibold text-primary">COBAL Control System</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="hidden md:block text-sm font-medium text-gray-700 mr-4">
                  {user?.name}
                </span>
                <button
                  onClick={logout}
                  className="p-1 rounded-full text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <span className="sr-only">Sair</span>
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;