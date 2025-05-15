import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const success = await login(email, senha);
      if (success) {
        navigate('/dashboard');
      } else {
        setErro('Email ou senha inválidos.');
      }
    } catch (error: any) {
      setErro('Erro ao fazer login: ' + (error?.message || ''));
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
            Login
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <button
                type="submit"
                disabled={carregando}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Não tem uma conta? Cadastre-se
            </button>
          </div>

          <div className="mt-2 text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Esqueceu sua senha?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 