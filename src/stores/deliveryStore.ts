import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export interface Inmate {
  id: string;
  name: string;
  registrationNumber: string;
  wing: string;
  cell: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  type: 'personal' | 'miscellaneous' | 'hygiene';
  maxQuantity?: number;
  frequency?: string;
}

export interface DeliveryItem {
  id: string;
  categoryId: string;
  quantity: number;
}

export interface Delivery {
  id: string;
  inmateId: string;
  date: string;
  items: DeliveryItem[];
  createdAt: string;
  updatedAt: string;
}

interface DeliveryState {
  inmates: Inmate[];
  itemCategories: ItemCategory[];
  deliveries: Delivery[];
  
  // Inmates
  addInmate: (inmate: Omit<Inmate, 'id'>) => string;
  getInmateById: (id: string) => Inmate | undefined;
  searchInmates: (query: string) => Inmate[];
  
  // Item Categories
  getItemsByType: (type: ItemCategory['type']) => ItemCategory[];
  
  // Deliveries
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateDelivery: (id: string, delivery: Partial<Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>>) => boolean;
  getDeliveryById: (id: string) => Delivery | undefined;
  searchDeliveries: (query: string) => Delivery[];
  getDeliveriesByInmate: (inmateId: string) => Delivery[];
}

// Define the initial data for the application
const itemCategories: ItemCategory[] = [
  // Personal Items (Yellow)
  { id: 'p1', name: 'Camiseta Branca', type: 'personal', maxQuantity: 5, frequency: 'Trimestral' },
  { id: 'p2', name: 'Bermuda/Shorts', type: 'personal', maxQuantity: 2, frequency: 'Trimestral' },
  { id: 'p3', name: 'Calça', type: 'personal', maxQuantity: 2, frequency: 'Trimestral' },
  { id: 'p4', name: 'Agasalho', type: 'personal', maxQuantity: 1, frequency: 'Trimestral' },
  { id: 'p5', name: 'Chinelo', type: 'personal', maxQuantity: 1, frequency: 'Trimestral' },
  
  // Miscellaneous Items (Blue)
  { id: 'm1', name: 'Cigarro', type: 'miscellaneous' },
  { id: 'm2', name: 'Isqueiro', type: 'miscellaneous' },
  { id: 'm3', name: 'Fotografias', type: 'miscellaneous' },
  { id: 'm4', name: 'Cartas', type: 'miscellaneous' },
  { id: 'm5', name: 'Livros/Revistas', type: 'miscellaneous' },
  
  // Hygiene Items (Green)
  { id: 'h1', name: 'Sabonete', type: 'hygiene', maxQuantity: 2, frequency: 'Quinzenal' },
  { id: 'h2', name: 'Creme Dental', type: 'hygiene', maxQuantity: 1, frequency: 'Quinzenal' },
  { id: 'h3', name: 'Escova de Dentes', type: 'hygiene', maxQuantity: 1, frequency: 'Quinzenal' },
  { id: 'h4', name: 'Shampoo', type: 'hygiene', maxQuantity: 1, frequency: 'Quinzenal' },
  { id: 'h5', name: 'Desodorante Roll-on', type: 'hygiene', maxQuantity: 1, frequency: 'Quinzenal' },
];

// Sample inmates for demonstration
const sampleInmates: Inmate[] = [
  { id: '1', name: 'João Silva', registrationNumber: '12345', wing: 'A', cell: 'A3' },
  { id: '2', name: 'Roberto Pereira', registrationNumber: '23456', wing: 'B', cell: 'B5' },
  { id: '3', name: 'Carlos Oliveira', registrationNumber: '34567', wing: 'C', cell: 'C2' },
];

export const useDeliveryStore = create<DeliveryState>()(
  persist(
    (set, get) => ({
      inmates: sampleInmates,
      itemCategories: itemCategories,
      deliveries: [],
      
      // Inmates
      addInmate: (inmate) => {
        const id = uuidv4();
        set((state) => ({
          inmates: [...state.inmates, { ...inmate, id }],
        }));
        return id;
      },
      
      getInmateById: (id) => {
        return get().inmates.find((inmate) => inmate.id === id);
      },
      
      searchInmates: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().inmates.filter(
          (inmate) =>
            inmate.name.toLowerCase().includes(lowerQuery) ||
            inmate.registrationNumber.includes(lowerQuery)
        );
      },
      
      // Item Categories
      getItemsByType: (type) => {
        return get().itemCategories.filter((item) => item.type === type);
      },
      
      // Deliveries
      addDelivery: (delivery) => {
        const now = new Date();
        const id = uuidv4();
        const newDelivery = {
          ...delivery,
          id,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        
        set((state) => ({
          deliveries: [...state.deliveries, newDelivery],
        }));
        
        return id;
      },
      
      updateDelivery: (id, delivery) => {
        const existingDelivery = get().getDeliveryById(id);
        
        if (!existingDelivery) return false;
        
        set((state) => ({
          deliveries: state.deliveries.map((d) =>
            d.id === id
              ? {
                  ...d,
                  ...delivery,
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        }));
        
        return true;
      },
      
      getDeliveryById: (id) => {
        return get().deliveries.find((delivery) => delivery.id === id);
      },
      
      searchDeliveries: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().deliveries.filter((delivery) => {
          const inmate = get().getInmateById(delivery.inmateId);
          if (!inmate) return false;
          
          return (
            inmate.name.toLowerCase().includes(lowerQuery) ||
            inmate.registrationNumber.includes(lowerQuery)
          );
        });
      },
      
      getDeliveriesByInmate: (inmateId) => {
        return get().deliveries.filter((delivery) => delivery.inmateId === inmateId);
      },
    }),
    {
      name: 'delivery-storage',
      partialize: (state) => ({
        inmates: state.inmates,
        deliveries: state.deliveries,
      }),
    }
  )
);