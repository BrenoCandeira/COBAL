import React, { useState } from 'react';
import { useDeliveryStore, Delivery } from '../stores/deliveryStore';
import { Search, Edit, ChevronRight, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const DeliverySearch: React.FC = () => {
  const { searchDeliveries, getInmateById, itemCategories } = useDeliveryStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Delivery[]>([]);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);
  
  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = searchDeliveries(searchQuery);
    setSearchResults(results);
  };
  
  const toggleExpand = (deliveryId: string) => {
    if (expandedDeliveryId === deliveryId) {
      setExpandedDeliveryId(null);
    } else {
      setExpandedDeliveryId(deliveryId);
    }
  };
  
  const getCategoryById = (categoryId: string) => {
    return itemCategories.find((category) => category.id === categoryId);
  };
  
  const renderDeliveryCard = (delivery: Delivery) => {
    const inmate = getInmateById(delivery.inmateId);
    const isExpanded = expandedDeliveryId === delivery.id;
    
    if (!inmate) return null;
    
    return (
      <div 
        key={delivery.id} 
        className="bg-white rounded-lg shadow-sm overflow-hidden mb-4 transition-all duration-200 hover:shadow-md"
      >
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleExpand(delivery.id)}
        >
          <div>
            <div className="font-medium text-lg">{inmate.name}</div>
            <div className="text-sm text-gray-500">
              Registro: {inmate.registrationNumber} | Data: {format(parseISO(delivery.date), 'dd/MM/yyyy')}
            </div>
          </div>
          <div className="flex items-center">
            <Link to={`/edit/${delivery.id}`} className="mr-3 text-blue-600 hover:text-blue-800" onClick={(e) => e.stopPropagation()}>
              <Edit size={18} />
            </Link>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
        
        {isExpanded && (
          <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in">
            <h3 className="font-medium mb-3">Detalhes da Entrega</h3>
            
            <div className="mb-4">
              <div className="text-sm">
                <span className="font-medium">Localização:</span> Ala {inmate.wing}, Cela {inmate.cell}
              </div>
              <div className="text-sm">
                <span className="font-medium">Data de Entrega:</span> {format(parseISO(delivery.date), 'dd/MM/yyyy')}
              </div>
              <div className="text-sm">
                <span className="font-medium">Registrado em:</span> {format(parseISO(delivery.createdAt), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
            
            <h4 className="font-medium mb-2">Itens Entregues:</h4>
            <div className="space-y-4">
              {delivery.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {delivery.items.map((item) => {
                    const category = getCategoryById(item.categoryId);
                    if (!category) return null;
                    
                    let badgeClass = '';
                    if (category.type === 'personal') badgeClass = 'badge-yellow';
                    if (category.type === 'miscellaneous') badgeClass = 'badge-blue';
                    if (category.type === 'hygiene') badgeClass = 'badge-green';
                    
                    return (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                        <div>
                          <span className="font-medium">{category.name}</span>
                          <span className={`ml-2 badge ${badgeClass}`}>
                            {category.type === 'personal' ? 'Pessoal' : category.type === 'miscellaneous' ? 'Diversos' : 'Higiene'}
                          </span>
                        </div>
                        <div className="text-gray-700">
                          Qtd: <span className="font-medium">{item.quantity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">Nenhum item registrado</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Buscar Entregas</h2>
        
        <div className="mb-6">
          <div className="flex">
            <input
              type="text"
              className="form-input rounded-r-none flex-1"
              placeholder="Nome do detento ou número de registro"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              type="button"
              className="btn btn-primary rounded-l-none px-4"
              onClick={handleSearch}
            >
              <Search size={20} className="mr-2" />
              Buscar
            </button>
          </div>
        </div>
        
        <div>
          {searchResults.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Resultados da Busca</h3>
              {searchResults.map(renderDeliveryCard)}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum resultado encontrado para "{searchQuery}"
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Digite um nome de detento ou número de registro para buscar entregas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliverySearch;