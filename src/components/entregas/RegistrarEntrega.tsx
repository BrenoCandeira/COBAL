import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

type EntregaFormData = {
  preso_id: string;
  itens: {
    [key: string]: number;
  };
};

interface Item {
  nome: string;
  max: number;
  sexo?: 'masculino' | 'feminino';
}

interface ItensMap {
  [key: string]: Item;
}

// ITENS TRIMESTRAIS (com devolução obrigatória dos anteriores)
export const ITENS_TRIMESTRAIS: ItensMap = {
  'lencol': { nome: 'Lençol de solteiro (amarelo ou branco, sem estampa)', max: 1 },
  'cobertor': { nome: 'Cobertor (não dupla face, amarelo ou branco, sem estampa)', max: 1 },
  'toalha': { nome: 'Toalha (amarela ou branca, sem estampa)', max: 1 },
  'camiseta': { nome: 'Camiseta (amarela, malha ou algodão)', max: 3 },
  'bermuda': { nome: 'Bermuda (amarela, sem bolsos, cordões ou zíper, malha ou algodão)', max: 2 },
  'calca': { nome: 'Calça (amarela, sem bolsos ou cordões, malha ou algodão)', max: 1 },
  'blusa_manga_longa': { nome: 'Blusa de manga longa (amarela, malha ou algodão)', max: 1 },
  'cueca': { nome: 'Cueca (amarela, sem estampa)', max: 4 },
  'chinelo': { nome: 'Par de chinelos "havaianas" (amarelo ou branco, sem estampa)', max: 1 },
};

// ITENS DIVERSOS (entrega pontual)
export const ITENS_PONTUAIS: ItensMap = {
  'colchao': { nome: 'Colchão de solteiro (fino, até 12 cm)', max: 1 },
  'colher_plastica': { nome: 'Colher plástica escolar', max: 1 },
  'copo_plastico': { nome: 'Copo plástico escolar', max: 1 },
  'esponja_lavar': { nome: 'Esponja de lavar vasilhas', max: 1 },
  'rodo': { nome: 'Rodo de limpeza (cabo de madeira, corpo de plástico)', max: 1 },
  'vassoura': { nome: 'Vassoura de pelo (cabo de madeira, corpo de plástico)', max: 1 },
};

// ITENS QUINZENAIS (higiene, limpeza, alimentação)
export const ITENS_QUINZENAIS: ItensMap = {
  'creme_dental': { nome: 'Creme dental em gel (exceto vermelho e branco)', max: 90 },
  'desodorante': { nome: 'Desodorante roll-on (embalagem branca e transparente)', max: 50 },
  'sabao_po': { nome: 'Sabão em pó (em saco plástico, até 800g)', max: 800 },
  'desinfetante': { nome: 'Desinfetante (garrafa pet transparente, sem rótulo, até 4L)', max: 4000 },
  'sabonete_liquido': { nome: 'Sabonete líquido (garrafa pet transparente, sem rótulo, até 500ml)', max: 500 },
  'agua_sanitaria': { nome: 'Água sanitária (em saco plástico, até 1L)', max: 1000 },
  'detergente_500ml': { nome: 'Detergente (transparente e sem rótulo, até 1000ml total)', max: 1000 },
  'esponja_banho': { nome: 'Esponja de banho (industrializada, até 15 cm)', max: 1 },
  'shampoo': { nome: 'Shampoo (em saco plástico, até 300ml)', max: 300 },
  'condicionador': { nome: 'Condicionador (em saco plástico, até 400ml)', max: 400 },
  'absorvente': { nome: 'Absorventes (só para unidades femininas, até 20 unidades)', max: 20, sexo: 'feminino' },
  'papel_higienico': { nome: 'Papel higiênico (masculino, até 2 rolos)', max: 2, sexo: 'masculino' },
  'papel_higienico_fem': { nome: 'Papel higiênico (feminino, até 6 rolos)', max: 6, sexo: 'feminino' },
  'cotonetes': { nome: 'Cotonetes (em saco plástico, até 10 unidades)', max: 10 },
  'escova_dental': { nome: 'Escova dental modelo viagem (com capa/copinho desmontável)', max: 1 },
  'barbeador': { nome: 'Barbeadores plásticos com no máximo duas lâminas (até 2, com devolução dos usados)', max: 2 },
  'bolacha': { nome: 'Bolachas (sal ou doce – maizena, maria, cream cracker – em saco plástico, até 1kg)', max: 1000 },
  'pao_forma': { nome: 'Pão de forma (fatiado, em saco plástico, até 2kg total)', max: 2000 },
  'presunto': { nome: 'Presunto e/ou salame ou apresuntado (fatiado, em saco plástico, até 100g)', max: 100 },
  'mussarela': { nome: 'Muçarela fatiada (industrializada, em saco plástico, até 100g)', max: 100 },
  'frutas': { nome: 'Frutas picadas e descascadas (em saco plástico, até 250g)', max: 250 },
};

// Unificar todos os itens em um único objeto
const ITENS_TODOS: ItensMap = { ...ITENS_TRIMESTRAIS, ...ITENS_QUINZENAIS, ...ITENS_PONTUAIS };

// Adicionar unidade/medida para cada item (exemplo)
export const UNIDADES: { [key: string]: string } = {
  lencol: 'unidade',
  cobertor: 'unidade',
  toalha: 'unidade',
  camiseta: 'unidade',
  bermuda: 'unidade',
  calca: 'unidade',
  blusa_manga_longa: 'unidade',
  cueca: 'unidade',
  chinelo: 'par',
  colchao: 'unidade',
  colher_plastica: 'unidade',
  copo_plastico: 'unidade',
  esponja_lavar: 'unidade',
  rodo: 'unidade',
  vassoura: 'unidade',
  creme_dental: 'g',
  desodorante: 'ml',
  sabao_po: 'g',
  desinfetante: 'ml',
  sabonete_liquido: 'ml',
  agua_sanitaria: 'ml',
  detergente_500ml: 'ml',
  esponja_banho: 'unidade',
  shampoo: 'ml',
  condicionador: 'ml',
  absorvente: 'unidade',
  papel_higienico: 'rolo',
  papel_higienico_fem: 'rolo',
  cotonetes: 'unidade',
  escova_dental: 'unidade',
  barbeador: 'unidade',
  bolacha: 'g',
  pao_forma: 'g',
  presunto: 'g',
  mussarela: 'g',
  frutas: 'g',
};

interface Preso {
  id: string;
  nome: string;
  prontuario: string;
  sexo: 'masculino' | 'feminino';
  ala: string;
  cela: string;
}

export function RegistrarEntrega() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [presoSelecionado, setPresoSelecionado] = useState<Preso | null>(null);
  const [sugestoesPresos, setSugestoesPresos] = useState<Preso[]>([]);
  const [buscaPreso, setBuscaPreso] = useState('');
  const { user } = useAuthStore();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EntregaFormData>();

  // Buscar sugestões de presos por nome ou prontuário
  useEffect(() => {
    const buscar = async () => {
      if (buscaPreso.length < 2) {
        setSugestoesPresos([]);
        return;
      }
      const { data, error } = await supabase
        .from('presos')
        .select('*')
        .or(`nome.ilike.%${buscaPreso}%,prontuario.ilike.%${buscaPreso}%`);
      setSugestoesPresos(data || []);
    };
    buscar();
  }, [buscaPreso]);

  // Função para selecionar preso da sugestão
  const selecionarPreso = (preso: Preso) => {
    setPresoSelecionado(preso);
    setBuscaPreso(preso.nome);
    setSugestoesPresos([]);
    // Definir o preso_id no formulário quando selecionar o preso
    setValue('preso_id', preso.id);
  };

  const onSubmit = async (data: EntregaFormData) => {
    try {
      setLoading(true);
      setError('');
      if (!presoSelecionado || !presoSelecionado.id) {
        throw new Error('Selecione um preso para registrar a entrega');
      }

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('nome_completo')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Filtrar apenas itens com quantidade > 0
      const itensSelecionados = Object.entries(data.itens || {}).filter(([_, quantidade]) => quantidade && quantidade > 0);
      if (itensSelecionados.length === 0) {
        throw new Error('Selecione ao menos um item para registrar a entrega.');
      }

      // Buscar última entrega do preso
      const { data: ultimas } = await supabase
        .from('entregas')
        .select('data_entrega, ' + Object.keys(ITENS_TODOS).join(', '))
        .eq('preso_id', presoSelecionado.id)
        .order('data_entrega', { ascending: false })
        .limit(1);

      const hoje = new Date();
      if (ultimas && ultimas.length > 0) {
        const ultima = ultimas[0] as { data_entrega: string; [key: string]: any };
        for (const [itemId, quantidade] of itensSelecionados) {
          const item = ITENS_TODOS[itemId];
          if (!item) continue;
          if (quantidade > item.max) {
            setValue(`itens.${itemId}`, item.max);
            throw new Error(`Quantidade excede o limite permitido para ${item.nome}`);
          }
          if (ultima[itemId] && ultima[itemId] > 0) {
            const diff = (hoje.getTime() - new Date(ultima.data_entrega).getTime()) / (1000 * 60 * 60 * 24);
            if (Object.keys(ITENS_TRIMESTRAIS).includes(itemId) && diff < 90) {
              throw new Error(`${item.nome} só pode ser entregue a cada 90 dias.`);
            }
            if (Object.keys(ITENS_QUINZENAIS).includes(itemId) && diff < 15) {
              throw new Error(`${item.nome} só pode ser entregue a cada 15 dias.`);
            }
          }
        }
      }

      // Montar objeto para insert
      const dadosEntrega: any = {
        preso_id: presoSelecionado.id,
        data_entrega: new Date().toISOString(),
        recebido_por: userData.nome_completo,
        usuario_id: user.id
      };
      for (const [itemId, quantidade] of itensSelecionados) {
        dadosEntrega[itemId] = quantidade;
      }

      const { error } = await supabase.from('entregas').insert([dadosEntrega]);
      if (error) throw error;

      alert('Entrega registrada com sucesso!');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar entrega');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Registrar Entrega</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome ou Prontuário do Preso
          </label>
          <div className="mt-1 flex rounded-md shadow-sm relative">
            <input
              type="text"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Digite o nome ou prontuário"
              value={buscaPreso}
              onChange={e => {
                setBuscaPreso(e.target.value);
                setPresoSelecionado(null);
              }}
              autoComplete="off"
            />
            {sugestoesPresos.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                {sugestoesPresos.map((preso) => (
                  <li
                    key={preso.id}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                    onClick={() => selecionarPreso(preso)}
                  >
                    {preso.nome} — {preso.prontuario}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {presoSelecionado && (
          <>
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium">Dados do Preso</h3>
              <p>Nome: {presoSelecionado.nome}</p>
              <p>Ala: {presoSelecionado.ala}</p>
              <p>Cela: {presoSelecionado.cela}</p>
            </div>

            {/* Balão de Itens Trimestrais */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
              <h3 className="text-md font-semibold mb-2 text-blue-800">Itens Trimestrais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(ITENS_TRIMESTRAIS).map(([id, item]) => {
                  if (item.sexo && item.sexo !== presoSelecionado.sexo) return null;
                  return (
                    <div key={id} className="flex items-center space-x-4">
                      <label className="flex-1 text-sm font-medium text-gray-700">{item.nome}</label>
                      <input
                        type="number"
                        min="0"
                        max={item.max}
                        step="1"
                        {...register(`itens.${id}`, {
                          min: 0,
                          max: item.max,
                          valueAsNumber: true,
                        })}
                        onInput={(e) => {
                          const value = parseInt((e.target as HTMLInputElement).value);
                          if (value > item.max) {
                            (e.target as HTMLInputElement).value = item.max.toString();
                          }
                          if (value < 0) {
                            (e.target as HTMLInputElement).value = "0";
                          }
                        }}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-xs text-gray-500">{UNIDADES[id] || 'unidade'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Balão de Itens Quinzenais */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
              <h3 className="text-md font-semibold mb-2 text-green-800">Itens Quinzenais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(ITENS_QUINZENAIS).map(([id, item]) => {
                  if (item.sexo && item.sexo !== presoSelecionado.sexo) return null;
                  return (
                    <div key={id} className="flex items-center space-x-4">
                      <label className="flex-1 text-sm font-medium text-gray-700">{item.nome}</label>
                      <input
                        type="number"
                        min="0"
                        max={item.max}
                        step="1"
                        {...register(`itens.${id}`, {
                          min: 0,
                          max: item.max,
                          valueAsNumber: true,
                        })}
                        onInput={(e) => {
                          const value = parseInt((e.target as HTMLInputElement).value);
                          if (value > item.max) {
                            (e.target as HTMLInputElement).value = item.max.toString();
                          }
                          if (value < 0) {
                            (e.target as HTMLInputElement).value = "0";
                          }
                        }}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                      <span className="text-xs text-gray-500">{UNIDADES[id] || 'unidade'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !presoSelecionado}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Registrando...' : 'Registrar Entrega'}
          </button>
        </div>
      </form>
    </div>
  );
}