import React, { useState, useEffect } from 'react';
import { useDeliveryStore, Delivery } from '../stores/deliveryStore';
import { format, parseISO, subDays } from 'date-fns';
import { Calendar, Filter, ChevronRight, ChevronDown } from 'lucide-react';

const DeliveryHistory: React.FC = () => {
  const { deliveries, getInmateById, itemCategories } = useDeliveryStore();
  
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: string; end: string}>({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [wingFilter, setWingFilter] = useState<string>('all');
  
  useEffect(() => {
    filterDeliveries();
  }, [deliveries, dateRange, wingFilter]);
  
  const filterDeliveries = () => {
    let filtered = [...deliveries];
    
    // Filter by date range
    filtered = filtered.filter((delivery) => {
      const deliveryDate = parseISO(delivery.date);
      const startDate = parseISO(dateRange.start);
      const endDate = parseISO(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the end date fully
      
      return deliveryDate >= startDate && deliveryDate <= endDate;
    });
    
    // Filter by wing
    if (wingFilter !== 'all') {
      filtered = filtered.filter((delivery) => {
        const inmate = getInmateById(delivery.inmateId);
        return inmate && inmate.wing === wingFilter;
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setFilteredDeliveries(filtered);
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
  
  const getWingOptions = () => {
    const wings = ['A', 'B', 'C', 'D', 'SEGURO'];
    return [
      { value: 'all', label: 'Todas as Alas' },
      ...wings.map((wing) => ({ value: wing, label: `Ala ${wing}` })),
    ];
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
              Registro: {inmate.registrationNumber} | Ala: {inmate.wing}, Cela: {inmate.cell}
            </div>
            <div className="text-sm text-gray-500">
              Data: {format(parseISO(delivery.date), 'dd/MM/yyyy')}
            </div>
          </div>
          <div>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
        
        {isExpanded && (
          <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Entregas</h2>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Filter className="mr-2 h-5 w-5 text-primary" />
            Filtros
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                Período de Início
              </label>
              <input
                type="date"
                className="form-input"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            
            <div>
              <label className="form-label flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                Período de Fim
              </label>
              <input
                type="date"
                className="form-input"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="form-label">Filtrar por Ala</label>
              <select
                className="form-input"
                value={wingFilter}
                onChange={(e) => setWingFilter(e.target.value)}
              >
                {getWingOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Entregas no Período ({filteredDeliveries.length})
          </h3>
          
          {filteredDeliveries.length > 0 ? (
            <div>{filteredDeliveries.map(renderDeliveryCard)}</div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma entrega encontrada para o período selecionado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryHistory;