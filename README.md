# Sistema de Controle COBAL - CPP Luziânia

Sistema desenvolvido para o controle de entregas COBAL do Centro de Progressão Penal de Luziânia, em conformidade com a Portaria nº 324/2022 da DGAP (Goiás).

## Funcionalidades

- Sistema completo de login com validação de email institucional
- Registro de entregas trimestrais e quinzenais
- Dashboard com estatísticas e gráficos
- Busca e filtros de entregas
- Geração de relatórios em Excel e PDF
- Gerenciamento de usuários
- Interface responsiva e moderna

## Tecnologias Utilizadas

- React
- TypeScript
- Tailwind CSS
- Supabase (Backend)
- Vite
- ESLint
- Prettier

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Conta no Supabase

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/cobal-control-system.git
cd cobal-control-system
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis com suas credenciais do Supabase:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas no Supabase:

- `usuarios`: Armazena informações dos usuários do sistema
- `presos`: Cadastro dos presos
- `entregas`: Registro das entregas
- `itens_entrega`: Itens entregues em cada entrega
- `itens`: Catálogo de itens permitidos

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera a versão de produção
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código com Prettier
- `npm run preview`: Visualiza a versão de produção localmente

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contato

Para mais informações, entre em contato com a equipe de desenvolvimento. 