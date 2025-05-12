import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Shield, AlertCircle, Loader, ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!nomeCompleto || !email || !password || !confirmPassword) {
      setError('Todos os campos são obrigatórios');
      return;
    }
    
    if (nomeCompleto.length < 3) {
      setError('O nome completo deve ter pelo menos 3 caracteres');
      return;
    }
    
    if (!email.endsWith('@goias.gov.br')) {
      setError('Por favor, utilize seu email institucional @goias.gov.br');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register(email, password, nomeCompleto);
      
      if (success) {
        navigate('/login', { 
          replace: true,
          state: { 
            message: 'Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.' 
          }
        });
      } else {
        setError('Não foi possível realizar o cadastro. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
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
            Cadastro de Usuário
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
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nomeCompleto" className="form-label">
                Nome Completo
              </label>
              <div className="mt-1">
                <input
                  id="nomeCompleto"
                  name="nomeCompleto"
                  type="text"
                  required
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="form-input"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
            
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
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Senha
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Digite a senha novamente"
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
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Cadastrar
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-primary hover:text-primary-dark"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;