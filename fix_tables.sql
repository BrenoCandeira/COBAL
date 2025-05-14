-- Primeiro, desativar RLS em todas as tabelas
DO $$
DECLARE
    curr_table text;
BEGIN
    FOR curr_table IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(curr_table) || ' DISABLE ROW LEVEL SECURITY;';
    END LOOP;
END$$;

-- Deletar tabelas existentes (se necessário)
DROP TABLE IF EXISTS public.itens_entrega;
DROP TABLE IF EXISTS public.entregas;
DROP TABLE IF EXISTS public.presos;

-- Criar tabela de presos
CREATE TABLE public.presos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  prontuario text NOT NULL UNIQUE,
  sexo text NOT NULL DEFAULT 'masculino',
  ala text NOT NULL,
  cela text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de entregas
CREATE TABLE public.entregas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  preso_id uuid REFERENCES public.presos(id),
  tipo text NOT NULL CHECK (tipo IN ('trimestral', 'quinzenal')),
  data_entrega date NOT NULL DEFAULT CURRENT_DATE,
  observacoes text,
  usuario_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de itens_entrega
CREATE TABLE public.itens_entrega (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entrega_id uuid REFERENCES public.entregas(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  quantidade integer NOT NULL CHECK (quantidade > 0),
  created_at timestamptz DEFAULT now()
);

-- Inserir alguns dados de exemplo
INSERT INTO public.presos (id, nome, prontuario, ala, cela) VALUES
  ('00000000-0000-0000-0000-000000000001', 'João da Silva', '12345', 'A', '1'),
  ('00000000-0000-0000-0000-000000000002', 'Carlos Santos', '67890', 'B', '2');
  
INSERT INTO public.entregas (id, preso_id, tipo, data_entrega, usuario_id) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'trimestral', CURRENT_DATE, NULL),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000002', 'quinzenal', CURRENT_DATE, NULL);
  
INSERT INTO public.itens_entrega (entrega_id, item_id, quantidade) VALUES
  ('00000000-0000-0000-0000-000000000010', 'camiseta', 3),
  ('00000000-0000-0000-0000-000000000010', 'cueca', 2),
  ('00000000-0000-0000-0000-000000000011', 'sabonete', 1),
  ('00000000-0000-0000-0000-000000000011', 'shampoo', 1);

-- Conceder privilégios completos ao usuário anon
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon; 