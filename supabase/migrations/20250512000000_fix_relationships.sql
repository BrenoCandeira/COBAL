/*
  # Correção de modelo relacional para o sistema de COBAL

  Este script corrige a estrutura do banco de dados para suportar o modelo relacional
  usado no código, criando tabelas para presos e itens_entrega e atualizando a tabela
  de entregas para usar chaves estrangeiras.
*/

-- Criar tabela de presos (se não existir)
CREATE TABLE IF NOT EXISTS public.presos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prontuario text NOT NULL UNIQUE,
  nome text NOT NULL,
  sexo text NOT NULL DEFAULT 'masculino',
  ala text NOT NULL,
  cela text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT ala_valida CHECK (ala IN ('A', 'B', 'C', 'D', 'SEGURO'))
);

-- Adicionar índices para presos
CREATE INDEX IF NOT EXISTS idx_presos_prontuario ON public.presos (prontuario);
CREATE INDEX IF NOT EXISTS idx_presos_nome ON public.presos (nome);

-- Habilitar RLS para presos
ALTER TABLE public.presos ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas para presos
CREATE POLICY "Usuários autenticados podem ver todos os presos"
  ON public.presos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar presos"
  ON public.presos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Modificar a tabela de entregas para usar referência a presos
-- Primeiro, vamos criar uma nova tabela
CREATE TABLE IF NOT EXISTS public.entregas_nova (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  preso_id uuid REFERENCES public.presos(id) NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('trimestral', 'quinzenal')),
  data_entrega date NOT NULL DEFAULT CURRENT_DATE,
  observacoes text,
  usuario_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de itens_entrega
CREATE TABLE IF NOT EXISTS public.itens_entrega (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entrega_id uuid REFERENCES public.entregas_nova(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  quantidade integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT quantidade_positiva CHECK (quantidade > 0)
);

-- Adicionar índice para itens_entrega
CREATE INDEX IF NOT EXISTS idx_itens_entrega_entrega ON public.itens_entrega (entrega_id);

-- Habilitar RLS para entregas_nova e itens_entrega
ALTER TABLE public.entregas_nova ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_entrega ENABLE ROW LEVEL SECURITY;

-- Adicionar políticas para entregas_nova
CREATE POLICY "Usuários autenticados podem ver todas as entregas"
  ON public.entregas_nova
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem criar novas entregas"
  ON public.entregas_nova
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- Adicionar políticas para itens_entrega
CREATE POLICY "Usuários autenticados podem ver todos os itens"
  ON public.itens_entrega
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir itens"
  ON public.itens_entrega
  FOR INSERT
  TO authenticated
  USING (true);

-- Adicionar trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER set_presos_updated_at
  BEFORE UPDATE ON public.presos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_entregas_nova_updated_at
  BEFORE UPDATE ON public.entregas_nova
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comentário para o DBA: Após aplicar essa migração, é necessário:
-- 1. Migrar dados da tabela entregas para entregas_nova e presos
-- 2. Criar os itens_entrega a partir do campo jsonb itens
-- 3. Renomear entregas_nova para entregas (após backup) 