//monta o react flow, gerencia conexões e persiste estado
import { useCallback, useEffect, useState, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    ControlButton,
    MiniMap,
    useNodesState,
    useEdgesState,
    reconnectEdge,
    addEdge,
    Panel,
    type Connection,
    type Edge,
    type Node,
    BackgroundVariant,
    type ReactFlowInstance,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FunilNode from './FunilNode';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { Plus, Menu, Maximize } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

import {
    getInitialNodes,
    getInitialEdges,
    getInitialGridState,
    getInitialAnimateState,
    MAP_LIMIT
} from '../constants/Constantes';
import { useFunilHistorico } from '../hooks/FunilHistorico';
import FunilSidebar from './FunilSidebar';

const nodeTypes = {
    funilCard: FunilNode,
};

export default function FunilGrid() {
    const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(getInitialEdges());
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showGrid, setShowGrid] = useState<boolean>(getInitialGridState());
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
    const [animateFlow, setAnimateFlow] = useState<boolean>(getInitialAnimateState());
    const { theme, setTheme } = useTheme();
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    //flag pra diferenciar exclusão de nó de exclusão manual de aresta
    //sem isso deletar um no dispara "conexão removida" pra cada aresta associada
    const isNodeDeletionRef = useRef(false);

    useFunilHistorico(nodes, edges, setNodes, setEdges);

    //persiste tudo no localStorage a cada mudança de estado
    useEffect(() => {
        localStorage.setItem('twr-nodes', JSON.stringify(nodes));
        localStorage.setItem('twr-edges', JSON.stringify(edges));
        localStorage.setItem('twr-showgrid', JSON.stringify(showGrid));
        localStorage.setItem('twr-animate', JSON.stringify(animateFlow));
    }, [nodes, edges, showGrid, animateFlow]);

    //escuta o evento customizado do NoEditar 
    useEffect(() => {
        const handleManualDelete = () => {
            isNodeDeletionRef.current = true;
            setTimeout(() => {
                isNodeDeletionRef.current = false;
            }, 100);
        };
        window.addEventListener('manualNodeDelete', handleManualDelete);
        return () => window.removeEventListener('manualNodeDelete', handleManualDelete);
    }, []);

    const onBeforeDelete = useCallback(async ({ nodes }: { nodes: Node[], edges: Edge[] }) => {
        if (nodes.length > 0) {
            isNodeDeletionRef.current = true;
        }
        return true;
    }, []);

    const onNodesDelete = useCallback((deletedNodes: Node[]) => {
        deletedNodes.forEach(node => {
            toast(`Etapa "${node.data.title}" removida`);
        });

        setTimeout(() => {
            isNodeDeletionRef.current = false;
        }, 100);
    }, []);

    //so mostra notificacao de aresta se nao foi consequencia de deletar um nó
    const onEdgesDelete = useCallback(() => {
        if (isNodeDeletionRef.current) return;
        toast("Conexão removida");
    }, []);

    const edgeReconnectSuccessful = useRef(true);

    //impede conexões duplicatas entre o mesmo par de nós
    const onConnect = useCallback(
        (params: Connection | Edge) => {
            const edgeExists = edges.some(
                (e) => e.source === params.source && e.target === params.target
            );

            if (edgeExists) {
                toast.warning("Estas etapas já estão conectadas!");
                return;
            }

            setEdges((eds) => addEdge(params, eds));
            toast.success("Etapas conectadas com sucesso!");
        },
        [edges, setEdges]
    );

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    //limpa seleção ao iniciar conexão pra evitar conflito visual com as arestas destacadas
    const onConnectStart = useCallback(() => {
        setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    }, [setEdges, setNodes]);

    const onReconnect = useCallback(
        (oldEdge: Edge, newConnection: Connection) => {
            edgeReconnectSuccessful.current = true;

            //valida se o novo destino já tem uma conexão com a mesma origem
            const edgeExists = edges.some(
                (e) => e.source === newConnection.source &&
                    e.target === newConnection.target &&
                    e.id !== oldEdge.id
            );

            if (edgeExists) {
                toast.warning("Estas etapas já estão conectadas!");
                return;
            }

            if (oldEdge.source !== newConnection.source || oldEdge.target !== newConnection.target) {
                setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
                toast.success("Conexão atualizada!");
            }
        },
        [edges, setEdges]
    );

    //se o usuário soltou a aresta no vazio remove ela
    const onReconnectEnd = useCallback(
        (_: any, edge: Edge) => {
            if (!edgeReconnectSuccessful.current) {
                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
                toast.info("Conexão removida", {
                    description: "A ligação foi excluída."
                });
            }
            edgeReconnectSuccessful.current = true;
        },
        [setEdges]
    );

    const handleAddNode = useCallback(() => {
        const newNodeId = `node-${Date.now()}`;

        let position = { x: 100, y: 100 };

        //converte o centro da tela pra coordenadas do flow pra criar o nó onde o usuário vê
        if (rfInstance) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            position = rfInstance.screenToFlowPosition({
                x: centerX,
                y: centerY,
            });

            //evita empilhamento exato quando cria vários nós seguidos
            position.x += (Math.random() - 0.5) * 60;
            position.y += (Math.random() - 0.5) * 60;
        }

        const newNode = {
            id: newNodeId,
            position,
            type: 'funilCard',
            data: { title: 'Nova Etapa', views: 0, conversions: 0 },
        };
        setNodes((nds) => [...nds, newNode]);
        toast.success("Nova etapa criada!");
    }, [setNodes, rfInstance]);

    //ao selecionar, a linha dobra de espessura mas a seta reduz pela metade.
    const styledEdges: Edge[] = edges.map(edge => {
        const isSelected = edge.selected;
        let color = isDarkMode ? '#fafafa' : '#18181b';

        //azul calibrado por tema
        if (isSelected) {
            color = isDarkMode ? '#3b82f6' : '#2563eb';
        }

        return {
            ...edge,
            zIndex: isSelected ? 1000 : 0,
            animated: animateFlow,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: isSelected ? 10 : 20,
                height: isSelected ? 10 : 20,
                color: color,
            },
            style: {
                ...edge.style,
                strokeWidth: isSelected ? 4 : 2,
                stroke: color,
            }
        };
    });

    return (
        <div className="relative flex w-screen h-screen overflow-hidden bg-background">
            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />

            <div className={`relative flex-1 h-full transition-all duration-300 ease-in-out bg-zinc-200 dark:bg-zinc-950 overflow-hidden ${isMenuOpen ? 'sm:mr-[350px]' : 'mr-0'}`}>
                <ReactFlow
                    nodes={nodes}
                    edges={styledEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onConnectStart={onConnectStart}
                    onReconnect={onReconnect}
                    onReconnectStart={onReconnectStart}
                    onReconnectEnd={onReconnectEnd}
                    onBeforeDelete={onBeforeDelete}
                    onNodesDelete={onNodesDelete}
                    onEdgesDelete={onEdgesDelete}
                    nodeTypes={nodeTypes}
                    onPaneClick={() => setIsMenuOpen(false)}
                    colorMode={isDarkMode ? 'dark' : 'light'}
                    fitView
                    onInit={setRfInstance}
                    defaultEdgeOptions={{
                        interactionWidth: 40,
                        animated: animateFlow,
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            width: 20,
                            height: 20,
                            color: isDarkMode ? '#fafafa' : '#18181b',
                        },
                        style: {
                            strokeWidth: 2,
                            stroke: isDarkMode ? '#fafafa' : '#18181b',
                        }
                    }}
                    translateExtent={MAP_LIMIT}
                    nodeExtent={MAP_LIMIT}
                >
                    {!isMenuOpen && (
                        <Panel position="top-right" className="m-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsMenuOpen(true)}
                                className="h-12 w-12 bg-background/80 backdrop-blur-sm border-zinc-300 dark:border-zinc-700 shadow-sm transition-transform hover:scale-105"
                            >
                                <Menu className="w-6 h-6 text-foreground" />
                            </Button>
                        </Panel>
                    )}

                    {showGrid && (
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={24}
                            size={2}
                            color={isDarkMode ? '#58585dff' : '#71717a'}
                        />
                    )}

                    <Controls showFitView={false} className="bg-background border-zinc-300 dark:border-zinc-700 shadow-sm m-4 scale-[1.5] origin-bottom-left fill-foreground border-b-0 [&>button]:border-b [&>button]:border-zinc-300 dark:[&>button]:border-zinc-700">
                        <ControlButton onClick={() => rfInstance?.fitView({ duration: 800, padding: 0.2 })} title="Centralizar Funil">
                            <Maximize className="w-3.5 h-3.5" />
                        </ControlButton>
                    </Controls>

                    <MiniMap
                        className="hidden sm:block rounded-lg shadow-xl m-4 overflow-hidden !w-[200px] !h-[150px]"
                        maskColor={isDarkMode ? '#fafafacc' : '#18181be6'}
                        maskStrokeWidth={0}
                        nodeColor={isDarkMode ? '#f4f4f5' : '#3f3f46'}
                        nodeStrokeWidth={0}
                        style={{
                            backgroundColor: isDarkMode ? '#161618ff' : '#ffffff',
                        }}
                    />

                    <Panel
                        position="bottom-right"
                        className="z-50"
                        style={{ marginRight: '84px', marginBottom: '180px' }}
                    >
                        <Button
                            onClick={handleAddNode}
                            size="icon"
                            className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer border-0"
                            style={{
                                backgroundColor: isDarkMode ? '#fafafae6' : '#18181be6',
                            }}
                        >
                            <Plus className="w-8 h-8" />
                        </Button>
                    </Panel>
                </ReactFlow>
            </div>

            <FunilSidebar
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                nodes={nodes}
                setNodes={setNodes}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                theme={theme}
                setTheme={setTheme}
                animateFlow={animateFlow}
                setAnimateFlow={setAnimateFlow}
            />
        </div>
    );
}