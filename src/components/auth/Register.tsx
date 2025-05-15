import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { validarCPF } from '../../utils/validadores';

function formatarCPF(valor: string) {
  valor = valor.replace(/\D/g, '');
  if (valor.length > 11) valor = valor.slice(0, 11);
  if (valor.length > 9) return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  if (valor.length > 6) return valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  if (valor.length > 3) return valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  return valor;
}

export function Register() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!nome.trim()) {
      setErro('Nome completo é obrigatório.');
      return;
    }
    if (!validarCPF(cpf)) {
      setErro('CPF inválido.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);
    try {
      // Primeiro, criar o usuário no auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha
      });

      if (authError) throw authError;

      if (authData.user) {
        // Depois, criar o perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              nome_completo: nome,
              cpf: cpf.replace(/\D/g, '')
            }
          ]);

        if (profileError) {
          // Se houver erro ao criar o perfil, tentar deletar o usuário
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw profileError;
        }

        setSucesso('Cadastro realizado com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      setErro('Erro ao cadastrar usuário: ' + (error?.message || ''));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 py-6 px-4 sm:px-10">
          <div className="flex justify-center">
            <img
              src="/emblema-ppgo.png"
              alt="Emblema da Polícia Penal de Goiás"
              className="h-24 w-auto"
            />
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-white">
            Cadastro de Usuário
          </h2>
          <p className="mt-2 text-center text-sm text-blue-100">
            CPP Luziânia - Sistema de Controle de Entregas
          </p>
        </div>

        <div className="p-6">
          {erro && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                id="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                CPF
              </label>
              <input
                id="cpf"
                type="text"
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                required
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={carregando}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {carregando ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Já tem uma conta? Faça login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 