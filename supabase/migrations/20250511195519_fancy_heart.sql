/*
  # Schema inicial do sistema de Controle de COBAL

  1. Novas Tabelas
    - `profiles`
      - Armazena informações adicionais dos usuários
      - Vinculada à tabela auth.users do Supabase
    
    - `entregas`
      - Registros de entregas de COBAL
      - Inclui informações do custodiado e itens entregues
      - Vinculada ao usuário que registrou

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas em autenticação
    - Proteção contra modificação não autorizada
*/

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  nome_completo text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (id),
  CONSTRAINT nome_completo_length CHECK (char_length(nome_completo) >= 3)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tabela de entregas
CREATE TABLE public.entregas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_preso text NOT NULL,
  prontuario text NOT NULL,
  ala text NOT NULL,
  cela text NOT NULL,
  data_entrega date NOT NULL,
  itens jsonb NOT NULL,
  observacoes text,
  servidor_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT ala_valida CHECK (ala IN ('A', 'B', 'C', 'D', 'SEGURO')),
  CONSTRAINT cela_valida CHECK (
    (ala = 'A' AND cela ~ '^A[1-6]$') OR
    (ala = 'B' AND cela ~ '^B[1-8]$') OR
    (ala = 'C' AND cela ~ '^C[1-3]$') OR
    (ala = 'D' AND cela ~ '^D[1-3]$') OR
    (ala = 'SEGURO' AND cela = 'SEGURO')
  )
);

ALTER TABLE public.entregas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para entregas
CREATE POLICY "Usuários autenticados podem ver todas as entregas"
  ON public.entregas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem criar novas entregas"
  ON public.entregas
  FOR INSERT
  TO authenticated
  WITH CHECK (servidor_id = auth.uid());

-- Funções e triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_entregas_updated_at
  BEFORE UPDATE ON public.entregas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Índices para otimização de busca
CREATE INDEX idx_entregas_nome_preso ON public.entregas (nome_preso);
CREATE INDEX idx_entregas_prontuario ON public.entregas (prontuario);
CREATE INDEX idx_entregas_data ON public.entregas (data_entrega);