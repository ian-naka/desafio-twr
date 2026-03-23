- Desafio 
    Este projeto é um construtor de funis de marketing digital desenvolvido como desafio técnico: a aplicação permite a criação, conexão, edição e remoção de etapas, com persistência de dados.
    
- Stack Tecnológica
* Versões mais recentes das tecnologias:
    - React 19
    - TypeScript
    - Vite 8
    - Tailwind CSS 4
    - @xyflow/react (v12)(React Flow)
    - Shadcn UI


- Funcionalidades Diferenciais
    1. Sistema de Histórico
        Implementei um sistema com hook useFunilHistorico. Ele captura estados do funil e permite que o usuário desfaça ações (até 30 passos) usando o atalho universal Ctrl+Z.

    2. Monitoramento de Métricas em Tempo Real
        Cada etapa do funil tem seu diferencial:
            - Cálculo Automático: A taxa de conversão é recalculada instantaneamente conforme os dados são editados.
            - Feedback Visual: Barra de progresso dinâmica.
            - Categorização Semântica: Nós categorizados (Anúncio, LP, Checkout, etc) possuem iconografia e cores específicas para facilitar a leitura do fluxo.

    3. Refinamentos de Interatividade
        - Física de Conexão: Aumento da área de interação das arestas para facilitar o manuseio.
        - Priorização Visual: Arestas selecionadas recebem prioridade de camada e estilo destacado, facilitando a edição.
        - Validação de Dados: O sistema impede estados inválidos, como o número de conversões ser superior ao de acessos.

- Arquitetura e Organização
    O projeto segue princípios de Separação de Preocupações e Clean Code:
        - Hooks: Lógica de negócio (histórico) isolada da interface.
        - Centralização de Configuração: Regras de design e estados iniciais consolidados em um único ponto.
        - Persistência Local: Sincronização automática com localStorage para que o usuário não perca seu progresso.

    src/
    ├── components/
    │   ├── funil/         #Grid, Node, Sidebar e Editor
    │   ├── ui/            #Componentes (Shadcn)
    │   └── constants/     #Configurações globais
    ├── hooks/             #Lógica de Desfazer
    ├── types/             #Interfaces TypeScript
    └── theme-provider.tsx #Gestão de Light/Dark Mode


- Como Executar
    Instale as dependências:
    Bash
    npm install


    Inicie o servidor de desenvolvimento:
    Bash
    npm run dev


    O projeto estará disponível em http://localhost:5173.

