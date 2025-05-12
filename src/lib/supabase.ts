import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Credenciais do Supabase não encontradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas do Supabase
export type Usuario = {
  id: string;
  email: string;
  nome: string;
  nivel: 'gestor' | 'servidor';
  created_at: string;
};

export type Preso = {
  id: string;
  prontuario: string;
  nome: string;
  sexo: 'masculino' | 'feminino';
  ala: string;
  cela: string;
  created_at: string;
};

export type Entrega = {
  id: string;
  preso_id: string;
  usuario_id: string;
  tipo: 'trimestral' | 'quinzenal';
  data_entrega: string;
  observacoes?: string;
  created_at: string;
};

export type ItemEntrega = {
  id: string;
  entrega_id: string;
  item_id: string;
  quantidade: number;
  created_at: string;
};

export type Item = {
  id: string;
  nome: string;
  tipo: 'trimestral' | 'quinzenal';
  categoria: 'roupa' | 'higiene' | 'limpeza';
  restricao_sexo?: 'masculino' | 'feminino';
  observacoes?: string;
  created_at: string;
};