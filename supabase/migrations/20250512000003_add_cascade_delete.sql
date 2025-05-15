/*
  # Adição de exclusão em cascata para entregas
  
  Este script modifica as relações entre as tabelas para garantir que:
  1. Quando um preso é excluído, todas as suas entregas são excluídas
  2. Quando uma entrega é excluída, todos os seus itens são excluídos
*/

-- Primeiro, remover a constraint existente
ALTER TABLE public.entregas
DROP CONSTRAINT IF EXISTS entregas_preso_id_fkey;

-- Adicionar a nova constraint com CASCADE
ALTER TABLE public.entregas
ADD CONSTRAINT entregas_preso_id_fkey
FOREIGN KEY (preso_id)
REFERENCES public.presos(id)
ON DELETE CASCADE;

-- Verificar e corrigir a constraint dos itens_entrega
ALTER TABLE public.itens_entrega
DROP CONSTRAINT IF EXISTS itens_entrega_entrega_id_fkey;

ALTER TABLE public.itens_entrega
ADD CONSTRAINT itens_entrega_entrega_id_fkey
FOREIGN KEY (entrega_id)
REFERENCES public.entregas(id)
ON DELETE CASCADE;

-- Comentários para documentação
COMMENT ON CONSTRAINT entregas_preso_id_fkey ON public.entregas IS 'Exclui automaticamente as entregas quando um preso é removido';
COMMENT ON CONSTRAINT itens_entrega_entrega_id_fkey ON public.itens_entrega IS 'Exclui automaticamente os itens quando uma entrega é removida'; 