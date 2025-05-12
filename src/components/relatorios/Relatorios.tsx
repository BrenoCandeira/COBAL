import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;
  ala?: string;
  cela?: string;
  tipo?: 'trimestral' | 'quinzenal';
}

interface Entrega {
  id: string;
  created_at: string;
  tipo: 'trimestral' | 'quinzenal';
  presos: {
    nome: string;
    prontuario: string;
    ala: string;
    cela: string;
  };
  itens_entrega: Array<{
    quantidade: number;
    item_id: string;
  }>;
}

export function Relatorios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({});
  const [entregas, setEntregas] = useState<Entrega[]>([]);

  const handleFiltroChange = (campo: keyof FiltrosRelatorio, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor || undefined,
    }));
  };

  const buscarEntregas = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('entregas')
        .select(`
          *,
          presos (
            nome,
            prontuario,
            ala,
            cela
          ),
          itens_entrega (
            quantidade,
            item_id
          )
        `);

      // Aplicar filtros
      if (filtros.dataInicio) {
        query = query.gte('created_at', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        query = query.lte('created_at', filtros.dataFim);
      }
      if (filtros.ala) {
        query = query.eq('presos.ala', filtros.ala);
      }
      if (filtros.cela) {
        query = query.eq('presos.cela', filtros.cela);
      }
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setEntregas(data as Entrega[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar entregas');
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    const dados = entregas.map((entrega) => ({
      Data: format(new Date(entrega.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      'Nome do Preso': entrega.presos.nome,
      Prontuário: entrega.presos.prontuario,
      Ala: entrega.presos.ala,
      Cela: entrega.presos.cela,
      'Tipo de Entrega': entrega.tipo === 'trimestral' ? 'Trimestral' : 'Quinzenal',
      'Itens Entregues': entrega.itens_entrega
        .map((item) => `${item.item_id}: ${item.quantidade}`)
        .join(', '),
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Entregas');
    XLSX.writeFile(wb, 'relatorio_entregas.xlsx');
  };

  const exportarPDF = async () => {
    try {
      setLoading(true);
      setError('');

      // Aqui você pode implementar a geração do PDF usando uma biblioteca como jsPDF
      // Por enquanto, vamos apenas mostrar um alerta
      alert('Funcionalidade de exportação para PDF em desenvolvimento');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Relatórios</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Início</label>
            <input
              type="date"
              value={filtros.dataInicio || ''}
              onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data Fim</label>
            <input
              type="date"
              value={filtros.dataFim || ''}
              onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ala</label>
            <input
              type="text"
              value={filtros.ala || ''}
              onChange={(e) => handleFiltroChange('ala', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cela</label>
            <input
              type="text"
              value={filtros.cela || ''}
              onChange={(e) => handleFiltroChange('cela', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Entrega</label>
            <select
              value={filtros.tipo || ''}
              onChange={(e) => handleFiltroChange('tipo', e.target.value as 'trimestral' | 'quinzenal')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Todos</option>
              <option value="trimestral">Trimestral</option>
              <option value="quinzenal">Quinzenal</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={buscarEntregas}
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {entregas.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {entregas.length} entregas encontradas
              </h3>
              <div className="flex space-x-4">
                <button
                  onClick={exportarExcel}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Exportar Excel
                </button>
                <button
                  onClick={exportarPDF}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prontuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ala/Cela
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Itens
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entregas.map((entrega) => (
                  <tr key={entrega.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(entrega.created_at), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entrega.presos.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entrega.presos.prontuario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entrega.presos.ala} / {entrega.presos.cela}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entrega.tipo === 'trimestral' ? 'Trimestral' : 'Quinzenal'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ul className="list-disc list-inside">
                        {entrega.itens_entrega.map((item, index) => (
                          <li key={index}>
                            {item.item_id}: {item.quantidade}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 