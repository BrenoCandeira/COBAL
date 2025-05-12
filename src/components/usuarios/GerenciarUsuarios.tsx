import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useForm } from 'react-hook-form';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  nivel: 'gestor' | 'servidor';
  created_at: string;
}

interface UsuarioFormData {
  email: string;
  nome: string;
  nivel: 'gestor' | 'servidor';
  senha: string;
}

export function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UsuarioFormData>();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data as Usuario[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      setLoading(true);
      setError('');

      // Validar domínio do email
      if (!data.email.endsWith('@goias.gov.br')) {
        setError('Apenas emails institucionais (@goias.gov.br) são permitidos');
        return;
      }

      if (usuarioEditando) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('usuarios')
          .update({
            nome: data.nome,
            nivel: data.nivel,
          })
          .eq('id', usuarioEditando.id);

        if (error) throw error;

        // Se a senha foi fornecida, atualizar
        if (data.senha) {
          const { error: authError } = await supabase.auth.updateUser({
            password: data.senha,
          });

          if (authError) throw authError;
        }
      } else {
        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.senha,
        });

        if (authError) throw authError;

        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user?.id,
            email: data.email,
            nome: data.nome,
            nivel: data.nivel,
          });

        if (dbError) throw dbError;
      }

      // Limpar formulário e recarregar lista
      reset();
      setUsuarioEditando(null);
      carregarUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    reset({
      email: usuario.email,
      nome: usuario.nome,
      nivel: usuario.nivel,
    });
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      carregarUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleResetarSenha = async (id: string) => {
    try {
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.resetPasswordForEmail(
        usuarios.find(u => u.id === id)?.email || '',
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      alert('Email de redefinição de senha enviado com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao resetar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gerenciar Usuários</h2>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">
          {usuarioEditando ? 'Editar Usuário' : 'Novo Usuário'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Institucional</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@goias\.gov\.br$/i,
                  message: 'Email institucional inválido',
                },
              })}
              disabled={!!usuarioEditando}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              {...register('nome', { required: 'Nome é obrigatório' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nível de Acesso</label>
            <select
              {...register('nivel', { required: 'Nível de acesso é obrigatório' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="servidor">Servidor</option>
              <option value="gestor">Gestor</option>
            </select>
            {errors.nivel && (
              <p className="mt-1 text-sm text-red-600">{errors.nivel.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {usuarioEditando ? 'Nova Senha (opcional)' : 'Senha'}
            </label>
            <input
              type="password"
              {...register('senha', {
                required: !usuarioEditando && 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'A senha deve ter no mínimo 6 caracteres',
                },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.senha && (
              <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            {usuarioEditando && (
              <button
                type="button"
                onClick={() => {
                  setUsuarioEditando(null);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Salvando...' : usuarioEditando ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nível
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    Carregando...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {usuario.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.nivel === 'gestor' ? 'Gestor' : 'Servidor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEditar(usuario)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleResetarSenha(usuario.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Resetar Senha
                        </button>
                        <button
                          onClick={() => handleExcluir(usuario.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
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