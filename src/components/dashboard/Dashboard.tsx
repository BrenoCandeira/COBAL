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
  const [carregando, setCarregando] = useState(false);

  const ENTREGAS_POR_PAGINA = 100;
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    carregarEstatisticas();
  }, [periodo, paginaAtual]);

  const carregarEstatisticas = async () => {
    try {
      setErro(null);
      setCarregando(true);
      
      const dataInicio = new Date();
      if (periodo === 'semana') {
        dataInicio.setDate(dataInicio.getDate() - 7);
      } else {
        dataInicio.setMonth(dataInicio.getMonth() - 1);
      }

      // Buscar total de entregas para paginação
      const { count } = await supabase
        .from('entregas')
        .select('*', { count: 'exact', head: true })
        .gte('data_entrega', dataInicio.toISOString());
      setTotalPaginas(Math.ceil((count || 1) / ENTREGAS_POR_PAGINA));

      // Buscar entregas da página atual
      const { data: entregas, error } = await supabase
        .from('entregas')
        .select('*')
        .gte('data_entrega', dataInicio.toISOString())
        .order('data_entrega', { ascending: false })
        .range((paginaAtual - 1) * ENTREGAS_POR_PAGINA, paginaAtual * ENTREGAS_POR_PAGINA - 1);

      if (error) throw error;

      // Calcular estatísticas
      const stats: Estatisticas = {
        totalEntregas: entregas?.length || 0,
        entregasPorTipo: {
          trimestral: 0,
          quinzenal: 0
        },
        entregasPorCategoria: {
          roupa: 0,
          higiene: 0,
          limpeza: 0
        },
        entregasPorAla: {}
      };

      // Processar cada entrega
      entregas?.forEach((entrega: any) => {
        // Contar por tipo
        if (entrega.tipo === 'trimestral') {
          stats.entregasPorTipo.trimestral++;
        } else if (entrega.tipo === 'quinzenal') {
          stats.entregasPorTipo.quinzenal++;
        }

        // Contar por ala
        if (entrega.ala) {
          stats.entregasPorAla[entrega.ala] = (stats.entregasPorAla[entrega.ala] || 0) + 1;
        }

        // Contar itens por categoria
        Object.entries(entrega).forEach(([key, value]) => {
          if (typeof value === 'number' && value > 0) {
            if (key.includes('lencol') || key.includes('cobertor') || key.includes('toalha') || 
                key.includes('camiseta') || key.includes('bermuda') || key.includes('calca') || 
                key.includes('blusa') || key.includes('cueca') || key.includes('chinelo')) {
              stats.entregasPorCategoria.roupa++;
            } else if (key.includes('creme') || key.includes('desodorante') || key.includes('sabonete') || 
                      key.includes('shampoo') || key.includes('condicionador') || key.includes('absorvente') || 
                      key.includes('papel') || key.includes('escova') || key.includes('barbeador')) {
              stats.entregasPorCategoria.higiene++;
            } else if (key.includes('sabao') || key.includes('desinfetante') || key.includes('agua_sanitaria') || 
                      key.includes('detergente') || key.includes('esponja')) {
              stats.entregasPorCategoria.limpeza++;
            }
          }
        });
      });

      setEstatisticas(stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setErro(`Erro ao carregar estatísticas: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setCarregando(false);
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

      {carregando ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Carregando estatísticas...</div>
        </div>
      ) : (
        <>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
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

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex justify-center my-4 gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span className="px-2">Página {paginaAtual} de {totalPaginas}</span>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 