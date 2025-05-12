import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDeliveryStore, Inmate, DeliveryItem, ItemCategory } from '../stores/deliveryStore';
import { format } from 'date-fns';
import { Search, Save, AlertCircle, CheckCircle } from 'lucide-react';

type FormData = {
  inmateId: string;
  date: string;
  items: Record<string, number>;
};

const DeliveryRegistration: React.FC = () => {
  const { inmates, itemCategories, getItemsByType, addDelivery } = useDeliveryStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInmates, setFilteredInmates] = useState<Inmate[]>([]);
  const [showInmateResults, setShowInmateResults] = useState(false);
  const [selectedInmate, setSelectedInmate] = useState<Inmate | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      items: {},
    },
  });
  
  const personalItems = getItemsByType('personal');
  const miscellaneousItems = getItemsByType('miscellaneous');
  const hygieneItems = getItemsByType('hygiene');
  
  const handleSearchInmate = () => {
    if (searchQuery.trim() === '') {
      setFilteredInmates([]);
      return;
    }
    
    const results = inmates.filter(
      (inmate) =>
        inmate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inmate.registrationNumber.includes(searchQuery)
    );
    
    setFilteredInmates(results);
    setShowInmateResults(true);
  };
  
  const handleSelectInmate = (inmate: Inmate) => {
    setSelectedInmate(inmate);
    setShowInmateResults(false);
  };
  
  const onSubmit = (data: FormData) => {
    if (!selectedInmate) {
      setNotification({
        type: 'error',
        message: 'Por favor, selecione um detento.',
      });
      return;
    }
    
    // Transform items object to array
    const deliveryItems: DeliveryItem[] = Object.entries(data.items)
      .filter(([_, quantity]) => quantity > 0)
      .map(([categoryId, quantity]) => ({
        id: `item-${Date.now()}-${categoryId}`,
        categoryId,
        quantity,
      }));
    
    if (deliveryItems.length === 0) {
      setNotification({
        type: 'error',
        message: 'Por favor, adicione pelo menos um item à entrega.',
      });
      return;
    }
    
    // Create delivery
    const deliveryId = addDelivery({
      inmateId: selectedInmate.id,
      date: data.date,
      items: deliveryItems,
    });
    
    // Show success notification
    setNotification({
      type: 'success',
      message: 'Entrega registrada com sucesso!',
    });
    
    // Reset form
    reset();
    setSelectedInmate(null);
    setSearchQuery('');
    
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const renderItemCategory = (
    title: string,
    description: string,
    items: ItemCategory[],
    colorClass: string
  ) => (
    <div className={`item-category ${colorClass}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm mb-4">{description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor={`item-${item.id}`} className="font-medium text-gray-700">
                {item.name}
              </label>
              {item.maxQuantity && (
                <span className="text-xs text-gray-500">Máx: {item.maxQuantity}</span>
              )}
            </div>
            {item.frequency && (
              <div className="text-xs text-gray-500 mb-2">{item.frequency}</div>
            )}
            <input
              id={`item-${item.id}`}
              type="number"
              min="0"
              max={item.maxQuantity}
              className="w-full p-2 border border-gray-300 rounded"
              {...register(`items.${item.id}`, {
                valueAsNumber: true,
                min: 0,
                max: item.maxQuantity,
              })}
            />
          </div>
        ))}
      </div>
    </div>
  );
  
  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Registro de Entrega COBAL</h2>
        
        {notification && (
          <div
            className={`mb-6 p-4 rounded-md flex items-center ${
              notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{notification.message}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">1. Informações do Detento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Buscar Detento</label>
                <div className="relative">
                  <div className="flex">
                    <input
                      type="text"
                      className="form-input rounded-r-none flex-1"
                      placeholder="Nome ou Número de Registro"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary rounded-l-none px-3"
                      onClick={handleSearchInmate}
                    >
                      <Search size={20} />
                    </button>
                  </div>
                  
                  {showInmateResults && filteredInmates.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                      {filteredInmates.map((inmate) => (
                        <button
                          key={inmate.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                          onClick={() => handleSelectInmate(inmate)}
                        >
                          <div className="font-medium">{inmate.name}</div>
                          <div className="text-sm text-gray-500">
                            Registro: {inmate.registrationNumber} | Ala: {inmate.wing} | Cela: {inmate.cell}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedInmate && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <h4 className="font-medium text-blue-800">Detento Selecionado</h4>
                  <div className="mt-2">
                    <p>
                      <span className="font-medium">Nome:</span> {selectedInmate.name}
                    </p>
                    <p>
                      <span className="font-medium">Número de Registro:</span>{' '}
                      {selectedInmate.registrationNumber}
                    </p>
                    <p>
                      <span className="font-medium">Localização:</span> Ala {selectedInmate.wing},
                      Cela {selectedInmate.cell}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">2. Data da Entrega</h3>
            <div>
              <label htmlFor="date" className="form-label">
                Data
              </label>
              <input
                id="date"
                type="date"
                className="form-input"
                {...register('date', { required: true })}
              />
              {errors.date && (
                <p className="form-error">Data da entrega é obrigatória</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">3. Itens para Entrega</h3>
            
            {renderItemCategory(
              'Itens Pessoais',
              'Trimestrais (Devolução Obrigatória)',
              personalItems,
              'personal-items'
            )}
            
            {renderItemCategory(
              'Itens Diversos',
              'Requer devolução de itens anteriores',
              miscellaneousItems,
              'miscellaneous-items'
            )}
            
            {renderItemCategory(
              'Itens de Higiene',
              'Quinzenais (Limite Máximo)',
              hygieneItems,
              'hygiene-items'
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              Registrar Entrega
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryRegistration;