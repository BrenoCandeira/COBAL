/*
  # Migração de dados do modelo antigo para o novo modelo relacional
  
  Este script faz o seguinte:
  1. Migra dados da tabela entregas antiga para as novas tabelas presos e entregas_nova
  2. Converte os dados do campo JSONB itens para a tabela itens_entrega
*/

-- Função para migrar dados
CREATE OR REPLACE FUNCTION migrate_entregas_data() RETURNS void AS $$
DECLARE
  e RECORD;
  preso_id UUID;
  entrega_id UUID;
  i JSONB;
  item_key TEXT;
  item_value INTEGER;
BEGIN
  -- Para cada entrega na tabela antiga
  FOR e IN SELECT * FROM public.entregas LOOP
    -- Inserir o preso (se não existir)
    INSERT INTO public.presos (prontuario, nome, ala, cela, sexo, created_at)
    VALUES (e.prontuario, e.nome_preso, e.ala, e.cela, 'masculino', e.created_at)
    ON CONFLICT (prontuario) DO NOTHING
    RETURNING id INTO preso_id;
    
    -- Se o preso já existia, buscar seu ID
    IF preso_id IS NULL THEN
      SELECT id INTO preso_id FROM public.presos WHERE prontuario = e.prontuario LIMIT 1;
    END IF;
    
    -- Inserir a entrega usando o ID do preso
    INSERT INTO public.entregas_nova (
      id, preso_id, data_entrega, observacoes, 
      usuario_id, created_at, updated_at,
      tipo
    ) VALUES (
      e.id, preso_id, e.data_entrega, e.observacoes,
      e.servidor_id, e.created_at, e.updated_at,
      'quinzenal' -- Valor padrão, ajuste conforme necessário
    ) RETURNING id INTO entrega_id;
    
    -- Processar os itens da entrega (campo JSONB)
    FOR item_key, item_value IN SELECT * FROM jsonb_each_text(e.itens) LOOP
      -- Converter para número
      IF item_value ~ E'^\\d+$' THEN
        INSERT INTO public.itens_entrega (entrega_id, item_id, quantidade, created_at)
        VALUES (entrega_id, item_key, item_value::integer, e.created_at);
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar a migração
SELECT migrate_entregas_data();

-- Remover a função temporária
DROP FUNCTION migrate_entregas_data();

-- Renomear tabelas para finalizar a migração
ALTER TABLE public.entregas RENAME TO entregas_old;
ALTER TABLE public.entregas_nova RENAME TO entregas;

-- Comentário para o DBA: Após verificar que a migração foi bem-sucedida, 
-- você pode excluir a tabela entregas_old se desejar
-- DROP TABLE public.entregas_old; 