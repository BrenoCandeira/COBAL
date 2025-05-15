/*
  # Adição de restrições de unicidade e validação de email
  
  Este script adiciona:
  1. Restrição de domínio de email (@goias.gov.br)
  2. Restrições de unicidade para CPF e nome completo
  3. Índices para melhorar performance de busca
*/

-- Adicionar coluna CPF à tabela de perfis
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cpf text UNIQUE;

-- Adicionar restrições de unicidade
ALTER TABLE public.profiles
ADD CONSTRAINT nome_completo_unique UNIQUE (nome_completo);

-- Adicionar check constraint para domínio de email
ALTER TABLE auth.users
ADD CONSTRAINT email_domain_check 
CHECK (email ~ '^[A-Za-z0-9._%+-]+@goias\.gov\.br$');

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_nome_completo ON public.profiles (nome_completo);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles (cpf);

-- Adicionar trigger para validar email antes de inserção/atualização
CREATE OR REPLACE FUNCTION validate_email() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@goias\.gov\.br$' THEN
    RAISE EXCEPTION 'O email deve pertencer ao domínio @goias.gov.br';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_email_trigger
BEFORE INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION validate_email();

-- Comentários para documentação
COMMENT ON CONSTRAINT email_domain_check ON auth.users IS 'Garante que apenas emails @goias.gov.br sejam aceitos';
COMMENT ON CONSTRAINT nome_completo_unique ON public.profiles IS 'Garante que não haja duplicação de nomes completos';
COMMENT ON COLUMN public.profiles.cpf IS 'CPF do usuário (único)'; 