-- Adicionar política para permitir inserção de novos perfis
CREATE POLICY "Usuários podem criar seus próprios perfis"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Garantir que a tabela tem RLS habilitado
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

COMMENT ON POLICY "Usuários podem criar seus próprios perfis" ON public.profiles
  IS 'Permite que usuários autenticados criem seus próprios perfis durante o registro'; 