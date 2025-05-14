import { createClient } from '@supabase/supabase-js';

// Usar valores diretamente para testes
const supabaseUrl = 'https://afjfyqleairpbgpoeioi.supabase.co';
// Substitua pela sua chave anon real
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  }
});

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

// Interface para o perfil do usuário
export type Profile = {
  id: string;
  nome_completo: string;
  created_at: string;
  updated_at: string;
};