-- Adicionar campo recebido_por e usuario_id na tabela entregas
ALTER TABLE public.entregas
ADD COLUMN IF NOT EXISTS recebido_por text,
ADD COLUMN IF NOT EXISTS usuario_id uuid REFERENCES auth.users(id);

-- Criar índice para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_entregas_recebido_por ON public.entregas(recebido_por);
CREATE INDEX IF NOT EXISTS idx_entregas_usuario_id ON public.entregas(usuario_id); 