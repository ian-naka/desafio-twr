import { useCallback } from 'react';

//importações dos componentes e hooks principais do react flow
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    BackgroundVariant,
} from '@xyflow/react';

//importação dos estilos bases do react flow para a grid e os nós não aparecerem em lista quebrada
import '@xyflow/react/dist/style.css';

//importação do nosso cartão customizado do funil
import FunilNode from './FunilNode';

//dicionário que mapeia os componentes customizados para o react flow
const nodeTypes = {
    funilCard: FunilNode,
};

//estado inicial
//guarda a lista inicial de Nós (no caso blocos) que vão aparecer quando ocorrer a renderização
const NodesIniciais = [
    {
        id: 'node-1', //cada nó tem um id único
        position: { x: 400, y: 150 }, //a posição inicial deste bloco referenciando X e Y 
        type: 'funilCard', //tipo visual do nó - apontando para o nosso dicionário
        data: {
            title: 'Anúncio no Instagram',
            views: 15400,
            conversions: 820,
        }, //dados internos
    },
    {
        id: 'node-2',
        position: { x: 400, y: 400 },
        type: 'funilCard',
        data: {
            title: 'Página de Vendas (LP)',
            views: 820,
            conversions: 105,
        },
    }
];

//lista inicial de conexões (arestas, começa com 0)
const EdgeIniciais: Edge[] = [
    { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true }
];

export default function FunnelCanvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState(NodesIniciais);
    const [edges, setEdges, onEdgesChange] = useEdgesState(EdgeIniciais);

    //funcao disparada toda vez que o usuario arrasta um nó até um conector
    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    //renderizacao na tela
    return (
        <div className="w-full h-full">

            {/* componente principal react flow*/}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes} //injetando o dicionário de componentes customizados
                fitView //zoom inicial
            >
                {/*espaçamento de 24 pixels e raio de 2 pixels; cores herdadas do tailwind */}
                <Background variant={BackgroundVariant.Dots} gap={24} size={2} className="text-muted-foreground/20" />

                {/*botões de zoom e centralização*/}
                <Controls className="bg-background border-border shadow-sm" />

                {/*minimapa pequeno*/}
                <MiniMap className="bg-background border-border" maskColor="rgb(0, 0, 0, 0.1)" />

            </ReactFlow>
        </div>
    );
}