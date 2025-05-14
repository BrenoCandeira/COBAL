import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Estatisticas {
  totalEntregas: number;
  entregasPorTipo: {
    trimestral: number;
    quinzenal: number;
  };
  entregasPorCategoria: {
    roupa: number;
    higiene: number;
    limpeza: number;
  };
  entregasPorAla: {
    [key: string]: number;
  };
}

// Interface simplificada para teste
interface Entrega {
  id: string;
  tipo: 'trimestral' | 'quinzenal';
  // Removemos as relações aninhadas para teste
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function Dashboard() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalEntregas: 0,
    entregasPorTipo: { trimestral: 0, quinzenal: 0 },
    entregasPorCategoria: { roupa: 0, higiene: 0, limpeza: 0 },
    entregasPorAla: {},
  });

  const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarEstatisticas();
  }, [periodo]);

  const carregarEstatisticas = async () => {
    try {
      setErro(null);
      const dataInicio = new Date();
      if (periodo === 'semana') {
        dataInicio.setDate(dataInicio.getDate() - 7);
      } else {
        dataInicio.setMonth(dataInicio.getMonth() - 1);
      }

      console.log('Início da consulta ao Supabase');
      
      // Consulta simplificada - apenas para teste
      const { data: entregas, error } = await supabase
        .from('entregas')
        .select('*')
        .gte('created_at', dataInicio.toISOString());

      console.log('Consulta realizada, resultado:', { entregas, error });
        
      if (error) {
        console.error('Error details:', error);
        setErro(`Erro na consulta: ${error.message}`);
        throw error;
      }

      // Estatísticas fixas para teste
      const stats: Estatisticas = {
        totalEntregas: entregas?.length || 0,
        entregasPorTipo: { 
          trimestral: 2, 
          quinzenal: 3 
        },
        entregasPorCategoria: { 
          roupa: 10, 
          higiene: 15, 
          limpeza: 8 
        },
        entregasPorAla: {
          'A': 3,
          'B': 5,
          'C': 2
        },
      };

      setEstatisticas(stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setErro(`Erro ao carregar estatísticas: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const dadosPorTipo = [
    { name: 'Trimestral', value: estatisticas.entregasPorTipo.trimestral },
    { name: 'Quinzenal', value: estatisticas.entregasPorTipo.quinzenal },
  ];

  const dadosPorCategoria = [
    { name: 'Roupa', value: estatisticas.entregasPorCategoria.roupa },
    { name: 'Higiene', value: estatisticas.entregasPorCategoria.higiene },
    { name: 'Limpeza', value: estatisticas.entregasPorCategoria.limpeza },
  ];

  const dadosPorAla = Object.entries(estatisticas.entregasPorAla).map(([ala, quantidade]) => ({
    name: ala,
    value: quantidade,
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setPeriodo('semana')}
            className={`px-4 py-2 rounded ${
              periodo === 'semana'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setPeriodo('mes')}
            className={`px-4 py-2 rounded ${
              periodo === 'mes'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Último Mês
          </button>
        </div>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total de Entregas</h3>
          <p className="text-3xl font-bold">{estatisticas.totalEntregas}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Entregas Trimestrais</h3>
          <p className="text-3xl font-bold">{estatisticas.entregasPorTipo.trimestral}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Entregas Quinzenais</h3>
          <p className="text-3xl font-bold">{estatisticas.entregasPorTipo.quinzenal}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Entregas por Tipo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPorTipo}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {dadosPorTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Entregas por Categoria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-medium mb-4">Entregas por Ala</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorAla}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 