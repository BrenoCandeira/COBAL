import { useState, useEffect } from 'react';
import { supabase, Preso } from '../../lib/supabase';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';

const ALAS = [
  { id: 'A', celas: ['1', '2', '3', '4', '5', '6'] },
  { id: 'B', celas: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  { id: 'C', celas: ['1', '2', '3', 'Seguro'] },
  { id: 'D', celas: ['1', '2', '3'] },
];

const CELAS_ESPECIAIS = ['Trabalhadores', 'Triagem', 'Seguro'];

export function CadastroPresos() {
  const [presos, setPresos] = useState<Preso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState<Preso | null>(null);
  const [importando, setImportando] = useState(false);
  const [dadosImportados, setDadosImportados] = useState<any[]>([]);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Preso>();
  
  const alaSelecionada = watch('ala');
  const [showAjuda, setShowAjuda] = useState(false);
  const [supabaseError, setSupabaseError] = useState<any>(null);
  const [presosSelecionados, setPresosSelecionados] = useState<string[]>([]);

  useEffect(() => {
    carregarPresos();
  }, []);

  const carregarPresos = async () => {
    setLoading(true);
    setError('');
    setSupabaseError(null);
    const { data, error } = await supabase.from('presos').select('*').order('created_at', { ascending: false });
    if (error) {
      setError('Erro ao carregar presos');
      setSupabaseError(error);
    }
    setPresos(data || []);
    setLoading(false);
  };

  const onSubmit = async (data: Preso) => {
    setLoading(true);
    setError('');
    try {
      // Garantir que o sexo seja sempre masculino
      data.sexo = 'masculino';
      
      if (editando) {
        const { error } = await supabase.from('presos').update(data).eq('id', editando.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('presos').insert(data);
        if (error) throw error;
      }
      reset();
      setEditando(null);
      carregarPresos();
    } catch (err) {
      setError('Erro ao salvar preso');
    }
    setLoading(false);
  };

  const handleEditar = (preso: Preso) => {
    setEditando(preso);
    reset(preso);
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Deseja excluir este preso?')) return;
    setLoading(true);
    await supabase.from('presos').delete().eq('id', id);
    carregarPresos();
    setLoading(false);
  };

  // Função para selecionar/deselecionar todos
  const handleSelecionarTodos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setPresosSelecionados(presos.map((p) => p.id));
    } else {
      setPresosSelecionados([]);
    }
  };

  // Função para selecionar/deselecionar um preso
  const handleSelecionarPreso = (id: string) => {
    setPresosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Função para excluir em massa
  const handleExcluirSelecionados = async () => {
    if (presosSelecionados.length === 0) return;
    if (!window.confirm('Deseja excluir os presos selecionados?')) return;
    setLoading(true);
    await supabase.from('presos').delete().in('id', presosSelecionados);
    setPresosSelecionados([]);
    carregarPresos();
    setLoading(false);
  };

  // Função para importar Excel
  const handleImportarExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportando(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      let data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      // Padronizar e limpar dados
      data = data.map((item: any) => {
        return {
          prontuario: (item.prontuario || '').toString().trim(),
          nome: (item.nome || '').toString().trim(),
          ala: (item.ala || '').toString().trim(),
          cela: (item.cela || '').toString().trim(),
        };
      });
      setDadosImportados(data);
      setImportando(false);
    };
    reader.readAsBinaryString(file);
  };

  // Função para cadastrar em lote
  const cadastrarEmLote = async () => {
    setLoading(true);
    setError('');
    try {
      // Buscar prontuários já existentes
      const { data: existentes, error: errorExistentes } = await supabase.from('presos').select('prontuario');
      if (errorExistentes) throw errorExistentes;
      const prontuariosExistentes = (existentes || []).map((p: any) => p.prontuario);
      // Filtrar para não inserir duplicados
      const presosParaInserir = dadosImportados
        .filter((item) => item.prontuario && !prontuariosExistentes.includes(item.prontuario))
        .map((item) => ({
          prontuario: item.prontuario,
          nome: item.nome,
          sexo: 'masculino',
          ala: item.ala,
          cela: item.cela,
        }));
      if (presosParaInserir.length === 0) {
        alert('Nenhum novo preso para cadastrar. Todos já existem ou dados inválidos.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.from('presos').insert(presosParaInserir);
      if (error) throw error;
      setDadosImportados([]);
      carregarPresos();
      alert('Cadastro em lote realizado com sucesso!');
    } catch (err) {
      setError('Erro ao cadastrar em lote. Verifique os dados.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Cadastro de Presos</h2>

      {/* Importação Excel */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center mb-2 gap-2">
          <label className="block text-sm font-medium text-gray-700">Importar presos via Excel (.xlsx)</label>
          <button
            type="button"
            className="ml-1 text-blue-600 hover:text-blue-800 text-lg font-bold cursor-pointer"
            onClick={() => setShowAjuda((v) => !v)}
            title="Ajuda sobre importação"
          >
            ?
          </button>
        </div>
        {showAjuda && (
          <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-800 max-w-xl">
            <div className="font-semibold mb-1">Como importar presos via Excel:</div>
            <ul className="list-disc pl-5 mb-2">
              <li>O arquivo deve ser do tipo <b>.xlsx</b> (Excel).</li>
              <li>A primeira linha deve conter os nomes das colunas: <b>prontuario</b>, <b>nome</b>, <b>ala</b>, <b>cela</b>.</li>
              <li>Exemplo de planilha:</li>
            </ul>
            <div className="overflow-x-auto">
              <table className="min-w-max border text-xs mb-2">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border px-2 py-1">prontuario</th>
                    <th className="border px-2 py-1">nome</th>
                    <th className="border px-2 py-1">ala</th>
                    <th className="border px-2 py-1">cela</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">12345</td>
                    <td className="border px-2 py-1">JOÃO DA SILVA</td>
                    <td className="border px-2 py-1">A</td>
                    <td className="border px-2 py-1">1</td>
                  </tr>
                  <tr>
                    <td className="border px-2 py-1">67890</td>
                    <td className="border px-2 py-1">CARLOS SOUZA</td>
                    <td className="border px-2 py-1">B</td>
                    <td className="border px-2 py-1">3</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>Preencha uma linha para cada preso. Não altere o nome das colunas.</div>
          </div>
        )}
        <input type="file" accept=".xlsx" onChange={handleImportarExcel} className="mb-2" />
        {importando && <div className="text-blue-600 text-sm">Lendo arquivo...</div>}
        {dadosImportados.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold mb-2">Prévia dos dados importados:</div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1">Prontuário</th>
                    <th className="px-2 py-1">Nome</th>
                    <th className="px-2 py-1">Ala</th>
                    <th className="px-2 py-1">Cela</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosImportados.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1">{item.prontuario}</td>
                      <td className="px-2 py-1">{item.nome}</td>
                      <td className="px-2 py-1">{item.ala}</td>
                      <td className="px-2 py-1">{item.cela}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={cadastrarEmLote} className="btn-primary mt-2">Cadastrar todos</button>
          </div>
        )}
      </div>

      {/* Cadastro manual individual */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prontuário</label>
            <input type="text" {...register('prontuario', { required: 'Obrigatório' })} className="input-primary" />
            {errors.prontuario && <p className="text-red-600 text-sm">{errors.prontuario.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" {...register('nome', { required: 'Obrigatório' })} className="input-primary" />
            {errors.nome && <p className="text-red-600 text-sm">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ala</label>
            <select {...register('ala')} className="input-primary">
              <option value="">Sem Ala (para celas especiais)</option>
              {ALAS.map(ala => (
                <option key={ala.id} value={ala.id}>Ala {ala.id}</option>
              ))}
            </select>
            {errors.ala && <p className="text-red-600 text-sm">{errors.ala.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cela</label>
            <select {...register('cela', { required: 'Obrigatório' })} className="input-primary">
              <option value="">Selecione a Cela</option>
              {/* Se não houver ala selecionada, mostrar apenas celas especiais */}
              {!alaSelecionada && CELAS_ESPECIAIS.map(cela => (
                <option key={cela} value={cela}>{cela}</option>
              ))}
              {/* Se houver ala selecionada, mostrar apenas celas da ala */}
              {alaSelecionada &&
                ALAS.find(a => a.id === alaSelecionada)?.celas.map(cela => (
                  <option key={cela} value={cela}>Cela {cela}</option>
                ))}
            </select>
            {errors.cela && <p className="text-red-600 text-sm">{errors.cela.message}</p>}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex space-x-4">
            {editando && (
              <button type="button" onClick={() => { setEditando(null); reset(); }} className="btn-secondary">Cancelar</button>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : editando ? 'Atualizar' : 'Cadastrar'}</button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={presosSelecionados.length === 0 || loading}
              onClick={handleExcluirSelecionados}
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir Selecionados
            </button>
            <span className="text-sm text-gray-600 font-medium">
              {presosSelecionados.length} {presosSelecionados.length === 1 ? 'preso selecionado' : 'presos selecionados'}
            </span>
          </div>
          {loading && (
            <div className="text-sm text-gray-600">
              Processando...
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3">
                  <input
                    type="checkbox"
                    checked={presosSelecionados.length === presos.length && presos.length > 0}
                    onChange={handleSelecionarTodos}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prontuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ala</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cela</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">Carregando...</td></tr>
              ) : presos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center">Nenhum preso cadastrado</td></tr>
              ) : (
                presos.map((preso) => (
                  <tr key={preso.id} className="hover:bg-gray-50">
                    <td className="px-2 py-4">
                      <input
                        type="checkbox"
                        checked={presosSelecionados.includes(preso.id)}
                        onChange={() => handleSelecionarPreso(preso.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{preso.prontuario}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{preso.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ala {preso.ala}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Cela {preso.cela}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button onClick={() => handleEditar(preso)} className="text-blue-600 hover:text-blue-900 mr-2">Editar</button>
                      <button onClick={() => handleExcluir(preso.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 