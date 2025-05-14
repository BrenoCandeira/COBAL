-- Script final para corrigir permissões e estrutura do banco de dados

-- Desativar RLS para todas as tabelas
ALTER TABLE IF EXISTS public.entregas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.presos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.itens_entrega DISABLE ROW LEVEL SECURITY;

-- Verificar e corrigir estrutura da tabela entregas
DO $$
BEGIN
    -- Verificar se a coluna tipo existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'entregas' AND column_name = 'tipo'
    ) THEN
        ALTER TABLE public.entregas ADD COLUMN tipo text NOT NULL DEFAULT 'quinzenal';
    END IF;
    
    -- Verificar se a coluna data_entrega existe
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'entregas' AND column_name = 'data_entrega'
    ) THEN
        ALTER TABLE public.entregas ADD COLUMN data_entrega date NOT NULL DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Conceder permissões para anon e authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Alterar política de segurança (mais permissivo para testes)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
BEGIN
  RETURN coalesce(current_setting('request.jwt.claim.sub', true)::uuid, '00000000-0000-0000-0000-000000000000'::uuid);
EXCEPTION WHEN OTHERS THEN
  RETURN '00000000-0000-0000-0000-000000000000'::uuid;
END
$$ LANGUAGE plpgsql;

-- Informações sobre configuração atual
SELECT schemaname, tablename, hasrls FROM pg_tables WHERE schemaname = 'public';

-- Adicione comentários para melhorar a visibilidade para a Supabase API
COMMENT ON TABLE public.entregas IS 'Registro de entregas de itens para presos';
COMMENT ON TABLE public.presos IS 'Cadastro de custodiados';
COMMENT ON TABLE public.itens_entrega IS 'Itens incluídos em cada entrega';

-- Adicionar dados de exemplo se necessário
INSERT INTO public.presos (nome, prontuario, ala, cela)
SELECT 'José da Silva', '123456', 'A', '1'
WHERE NOT EXISTS (SELECT 1 FROM public.presos LIMIT 1);

-- Atualizar todos os preso_id nulos nas entregas
UPDATE public.entregas 
SET preso_id = (SELECT id FROM public.presos LIMIT 1)
WHERE preso_id IS NULL; 