import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Shield, AlertCircle, Loader, UserPlus } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  useEffect(() => {
    // Verificar se há mensagem de sucesso do registro
    const state = location.state as { message?: string };
    if (state?.message) {
      setSuccessMessage(state.message);
      // Limpar a mensagem do histórico
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email.endsWith('@goias.gov.br')) {
      setError('Por favor, utilize seu email institucional @goias.gov.br');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/', { replace: true });
      } else {
        setError('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
      }
    } catch (err) {
      setError('Erro ao realizar login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email) {
      setError('Digite seu email institucional para recuperar a senha');
      return;
    }
    
    if (!email.endsWith('@goias.gov.br')) {
      setError('Por favor, utilize seu email institucional @goias.gov.br');
      return;
    }
    
    setIsResettingPassword(true);
    
    try {
      const success = await resetPassword(email);
      
      if (success) {
        setSuccessMessage('Instruções para redefinição de senha foram enviadas para seu email');
        setPassword('');
      } else {
        setError('Não foi possível enviar o email de recuperação. Verifique se o email está correto.');
      }
    } catch (err) {
      setError('Erro ao solicitar recuperação de senha. Tente novamente.');
    } finally {
      setIsResettingPassword(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-primary py-6 px-4 sm:px-10">
          <div className="flex justify-center">
            <img
              src="https://www.goias.gov.br/images/imagemTopoTexto.png"
              alt="Emblema da Polícia Penal de Goiás"
              className="h-24 w-auto"
            />
          </div>
          <h2 className="mt-4 text-center text-2xl font-extrabold text-white">
            COBAL Control System
          </h2>
          <p className="mt-2 text-center text-sm text-blue-100">
            CPP Luziânia - Sistema de Controle de Entregas
          </p>
        </div>
        
        <div className="px-4 py-8 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-md flex items-start text-red-800 text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 rounded-md flex items-start text-green-800 text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="form-label">
                Email Institucional
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="seu.nome@goias.gov.br"
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="form-label">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                  className="text-sm font-medium text-primary hover:text-primary-dark focus:outline-none focus:underline"
                >
                  {isResettingPassword ? 'Enviando...' : 'Esqueceu a senha?'}
                </button>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="flex items-center justify-center text-sm text-primary hover:text-primary-dark"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Criar nova conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;