# Correção da Estrutura do Banco de Dados

## Problema Identificado

O sistema está apresentando erros ao registrar entregas de COBAL e ao carregar o Dashboard, com a seguinte mensagem:

```
Erro ao carregar estatísticas: {
  code: 'PGRST200', 
  details: "Searched for a foreign key relationship between 'entregas' and 'presos' in the schema cache, but no matches were found.",
  message: "Could not find a relationship between 'entregas' and 'presos' in the schema cache"
}
```

### Causa

A estrutura atual do banco de dados não corresponde ao modelo de dados usado no código:

- **No código**: as consultas assumem um modelo relacional onde `entregas` tem relacionamentos com `presos` e `itens_entrega`
- **No banco**: a tabela `entregas` armazena dados do preso diretamente (nome, prontuário, etc.) e itens em um campo JSONB

## Solução

Foram criados dois scripts de migração para corrigir esta inconsistência:

1. `20250512000000_fix_relationships.sql`: Cria novas tabelas com o modelo relacional correto
2. `20250512000001_migrate_data.sql`: Migra os dados do modelo antigo para o novo

### Como aplicar a migração

Para aplicar estas mudanças no seu ambiente, siga os passos abaixo:

1. **Faça backup do banco de dados**
   ```bash
   supabase db dump > backup.sql
   ```

2. **Aplique os scripts de migração**
   ```bash
   supabase db push
   ```

3. **Verifique se a migração foi bem-sucedida**
   - Acesse o painel Admin do Supabase
   - Verifique se as tabelas `presos`, `entregas` e `itens_entrega` foram criadas corretamente
   - Confirme se os dados foram migrados corretamente

4. **Caso precise reverter a migração**
   ```bash
   supabase db reset
   supabase db push backup.sql
   ```

## Mudanças Realizadas

### 1. Novas Tabelas Criadas

- `presos`: Armazena informações dos custodiados (antes estavam embutidas em cada entrega)
- `itens_entrega`: Armazena os itens de cada entrega (antes estavam em um campo JSONB)
- `entregas`: Versão atualizada que usa chaves estrangeiras para `presos` e relacionamentos com `itens_entrega`

### 2. Relações Entre Tabelas

```
presos (1) ----< entregas (1) ----< itens_entrega (N)
```

- Um preso pode ter várias entregas
- Uma entrega pertence a um preso
- Uma entrega pode ter vários itens

### 3. Migração de Dados

- Todos os dados da estrutura antiga foram preservados e transferidos para o novo modelo
- A tabela antiga foi renomeada para `entregas_old` para referência 