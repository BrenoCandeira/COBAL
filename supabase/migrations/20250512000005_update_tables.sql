/*
  # Atualização das tabelas do sistema
  
  1. Adicionar campos tipo e data_entrega na tabela entregas
  2. Atualizar políticas de acesso
  3. Adicionar índices para otimização
*/

-- Adicionar campos na tabela entregas
ALTER TABLE public.entregas
ADD COLUMN IF NOT EXISTS tipo text CHECK (tipo IN ('trimestral', 'quinzenal')),
ADD COLUMN IF NOT EXISTS data_entrega timestamptz DEFAULT now();

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_entregas_tipo ON public.entregas (tipo);
CREATE INDEX IF NOT EXISTS idx_entregas_data_entrega ON public.entregas (data_entrega);

-- Atualizar políticas de acesso para profiles
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;

CREATE POLICY "Usuários podem ver todos os perfis"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.entregas.tipo IS 'Tipo da entrega (trimestral ou quinzenal)';
COMMENT ON COLUMN public.entregas.data_entrega IS 'Data em que a entrega foi realizada';
COMMENT ON TABLE public.profiles IS 'Perfis dos usuários do sistema';
COMMENT ON COLUMN public.profiles.nome_completo IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.cpf IS 'CPF do usuário (único)';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da última atualização do perfil'; 