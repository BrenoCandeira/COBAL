/*
  # Criação da tabela profiles
  
  Este script cria a tabela de perfis de usuário com:
  1. Campos básicos (nome_completo, cpf)
  2. Restrições de unicidade
  3. Índices para performance
*/

-- Remover constraints e triggers existentes
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS handle_updated_at();
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS nome_completo_unique;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS nome_completo_length;

-- Criar a tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome_completo text NOT NULL,
  cpf text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar restrições
ALTER TABLE public.profiles
ADD CONSTRAINT nome_completo_unique UNIQUE (nome_completo),
ADD CONSTRAINT nome_completo_length CHECK (char_length(nome_completo) >= 3);

-- Remover índices antigos se existirem
DROP INDEX IF EXISTS idx_profiles_nome_completo;
DROP INDEX IF EXISTS idx_profiles_cpf;

-- Criar índices
CREATE INDEX idx_profiles_nome_completo ON public.profiles (nome_completo);
CREATE INDEX idx_profiles_cpf ON public.profiles (cpf);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;

-- Criar políticas de acesso
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

-- Criar trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.profiles IS 'Perfis dos usuários do sistema';
COMMENT ON COLUMN public.profiles.nome_completo IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.cpf IS 'CPF do usuário (único)';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da última atualização do perfil'; 