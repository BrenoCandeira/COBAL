import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importar os mapas de itens do RegistrarEntrega
import { ITENS_TRIMESTRAIS, ITENS_QUINZENAIS, ITENS_PONTUAIS } from './RegistrarEntrega';

interface EntregaWide {
  id: string;
  created_at: string;
  data_entrega: string;
  preso_id: string;
  criado_por?: string;
  presos: {
    nome: string;
    prontuario: string;
    ala: string;
    cela: string;
  };
  [key: string]: any;
}

interface Filtros {
  nome?: string;
  prontuario?: string;
  ala?: string;
  cela?: string;
  dataInicio?: string;
  dataFim?: string;
}

export function BuscarEntregas() {
  const [entregas, setEntregas] = useState<EntregaWide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filtros, setFiltros] = useState<Filtros>({});
  const [entregaExpandida, setEntregaExpandida] = useState<string | null>(null);

  useEffect(() => {
    buscarEntregas();
  }, [filtros]);

  const buscarEntregas = async () => {
    try {
      setLoading(true);
      setError('');
      let query = supabase
        .from('entregas')
        .select(`*, presos (nome, prontuario, ala, cela)`);
      // Filtros
      if (filtros.nome) query = query.ilike('presos.nome', `%${filtros.nome}%`);
      if (filtros.prontuario) query = query.eq('presos.prontuario', filtros.prontuario);
      if (filtros.ala) query = query.eq('presos.ala', filtros.ala);
      if (filtros.cela) query = query.eq('presos.cela', filtros.cela);
      if (filtros.dataInicio) query = query.gte('created_at', filtros.dataInicio);
      if (filtros.dataFim) query = query.lte('created_at', filtros.dataFim);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setEntregas(data as EntregaWide[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar entregas');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo: keyof Filtros, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor || undefined }));
  };

  const toggleExpandirEntrega = (id: string) => {
    setEntregaExpandida(entregaExpandida === id ? null : id);
  };

  // Função para checar aptidão de recebimento
  function aptoReceber(entrega: EntregaWide, itemId: string): string {
    const dias = Math.floor((new Date().getTime() - new Date(entrega.data_entrega).getTime()) / (1000 * 60 * 60 * 24));
    if (Object.keys(ITENS_TRIMESTRAIS).includes(itemId)) {
      return dias >= 90 ? 'Apto (Trimestral)' : `Aguardando (${90 - dias} dias)`;
    }
    if (Object.keys(ITENS_QUINZENAIS).includes(itemId)) {
      return dias >= 15 ? 'Apto (Quinzenal)' : `Aguardando (${15 - dias} dias)`;
    }
    return 'Entrega pontual';
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Buscar Entregas</h2>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Preso</label>
            <input type="text" value={filtros.nome || ''} onChange={e => handleFiltroChange('nome', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prontuário</label>
            <input type="text" value={filtros.prontuario || ''} onChange={e => handleFiltroChange('prontuario', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ala</label>
            <input type="text" value={filtros.ala || ''} onChange={e => handleFiltroChange('ala', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cela</label>
            <input type="text" value={filtros.cela || ''} onChange={e => handleFiltroChange('cela', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Início</label>
            <input type="date" value={filtros.dataInicio || ''} onChange={e => handleFiltroChange('dataInicio', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Fim</label>
            <input type="date" value={filtros.dataFim || ''} onChange={e => handleFiltroChange('dataFim', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
        </div>
      </div>
      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prontuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ala/Cela</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado por</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">Carregando...</td></tr>
              ) : entregas.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">Nenhuma entrega encontrada</td></tr>
              ) : (
                entregas.map((entrega) => (
                  <>
                    <tr key={entrega.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(entrega.data_entrega || entrega.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entrega.presos?.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrega.presos?.prontuario}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrega.presos?.ala} / {entrega.presos?.cela}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entrega.criado_por || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer" onClick={() => toggleExpandirEntrega(entrega.id)}>{entregaExpandida === entrega.id ? 'Ocultar' : 'Ver Detalhes'}</td>
                    </tr>
                    {entregaExpandida === entrega.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <h4 className="font-medium mb-2">Itens Entregues:</h4>
                            <ul className="list-disc list-inside">
                              {Object.entries({ ...ITENS_TRIMESTRAIS, ...ITENS_QUINZENAIS, ...ITENS_PONTUAIS })
                                .filter(([itemId]) => entrega[itemId] && entrega[itemId] > 0)
                                .map(([itemId, item]) => (
                                  <li key={itemId}>
                                    {item.nome}: {entrega[itemId]} unidade(s) — <span className="text-xs">{aptoReceber(entrega, itemId)}</span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 