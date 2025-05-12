import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardList, Search, History } from 'lucide-react';

const navItems = [
  { path: '/', icon: <ClipboardList size={20} />, label: 'Registrar Entrega' },
  { path: '/search', icon: <Search size={20} />, label: 'Buscar Entrega' },
  { path: '/history', icon: <History size={20} />, label: 'Histórico' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <div className="flex justify-center">
          <img 
            src="https://www.goias.gov.br/images/imagemTopoTexto.png" 
            alt="Emblema da Polícia Penal de Goiás" 
            className="h-16 w-auto"
          />
        </div>
        <h2 className="mt-3 text-center text-lg font-semibold text-gray-900">CPP Luziânia</h2>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
              ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t text-center text-sm text-gray-500">
        COBAL Control System v0.1.0
      </div>
    </aside>
  );
};

export default Sidebar;