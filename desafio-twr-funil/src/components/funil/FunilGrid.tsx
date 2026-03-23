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

import { Plus, Menu, Maximize, Square, MousePointerClick } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

    const isNodeDeletionRef = useRef(false);

    useFunilHistorico(nodes, edges, setNodes, setEdges);

    useEffect(() => {
        localStorage.setItem('twr-nodes', JSON.stringify(nodes));
        localStorage.setItem('twr-edges', JSON.stringify(edges));
        localStorage.setItem('twr-showgrid', JSON.stringify(showGrid));
        localStorage.setItem('twr-animate', JSON.stringify(animateFlow));
    }, [nodes, edges, showGrid, animateFlow]);

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

    const onEdgesDelete = useCallback(() => {
        if (isNodeDeletionRef.current) return;
        toast("Conexão removida");
    }, []);

    const edgeReconnectSuccessful = useRef(true);

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

    const onConnectStart = useCallback(() => {
        setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    }, [setEdges, setNodes]);

    const onReconnect = useCallback(
        (oldEdge: Edge, newConnection: Connection) => {
            edgeReconnectSuccessful.current = true;
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

    const onReconnectEnd = useCallback(
        (_: any, edge: Edge) => {
            if (!edgeReconnectSuccessful.current) {
                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
                toast.info("Conexão removida");
            }
            edgeReconnectSuccessful.current = true;
        },
        [setEdges]
    );


    const handleAddNode = useCallback((formato: 'etapa' | 'origem') => {
        const newNodeId = `node-${Date.now()}`;

        //pega o centro da tela atual
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const projectedPosition = rfInstance?.screenToFlowPosition({ x: centerX, y: centerY }) || { x: 100, y: 100 };

        //evita pilha
        const stackOffset = (nodes.length % 5) * 40;

        //se for origem, joga 300px para a esquerda do centro- se for etapa mantem no centro.
        const finalPosition = {
            x: formato === 'origem' ? projectedPosition.x - 300 + stackOffset : projectedPosition.x + stackOffset,
            y: projectedPosition.y + stackOffset
        };

        const newNode = {
            id: newNodeId,
            position: finalPosition,
            type: 'funilCard',
            data: {
                title: formato === 'origem' ? 'Nova Origem' : 'Nova Etapa',
                views: 0,
                conversions: 0,
                formatoNode: formato
            },
        };

        setNodes((nds) => [...nds, newNode]);
        toast.success(formato === 'origem' ? "Origem criada!" : "Etapa criada!");
    }, [rfInstance, nodes.length, setNodes]);

    const styledEdges: Edge[] = edges.map(edge => {
        const isSelected = edge.selected;
        let color = isDarkMode ? '#fafafa' : '#18181b';
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
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
                    translateExtent={MAP_LIMIT}
                    nodeExtent={MAP_LIMIT}
                >
                    {!isMenuOpen && (
                        <Panel position="top-right" className="m-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsMenuOpen(true)}
                                className="h-12 w-12 bg-background/80 backdrop-blur-sm border-zinc-300 dark:border-zinc-700 shadow-sm"
                            >
                                <Menu className="w-6 h-6 text-foreground" />
                            </Button>
                        </Panel>
                    )}

                    {showGrid && (
                        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color={isDarkMode ? '#58585dff' : '#71717a'} />
                    )}

                    <Controls showFitView={false} className="bg-background border-zinc-300 dark:border-zinc-700 shadow-sm m-4 scale-[1.5] origin-bottom-left fill-foreground border-b-0 [&>button]:border-b [&>button]:border-zinc-300 dark:[&>button]:border-zinc-700">
                        <ControlButton onClick={() => rfInstance?.fitView({ duration: 800, padding: 0.2 })} title="Centralizar Funil">
                            <Maximize className="w-3.5 h-3.5" />
                        </ControlButton>
                    </Controls>

                    <MiniMap
                        className="hidden sm:block rounded-lg shadow-xl m-4 overflow-hidden !w-[200px] !h-[150px]"
                        maskColor={isDarkMode ? '#fafafacc' : '#18181be6'}
                        nodeColor={isDarkMode ? '#f4f4f5' : '#3f3f46'}
                        style={{ backgroundColor: isDarkMode ? '#161618ff' : '#ffffff' }}
                    />

                    <Panel position="bottom-right" className="z-50" style={{ marginRight: '84px', marginBottom: '180px' }}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    className="h-16 w-16 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer border-0"
                                    style={{ backgroundColor: isDarkMode ? '#fafafae6' : '#18181be6' }}
                                >
                                    <Plus className="w-8 h-8" style={{ color: isDarkMode ? '#18181b' : '#fafafa' }} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="center"
                                sideOffset={24}
                                className="w-[200px] p-0 rounded-lg shadow-xl border overflow-hidden flex transition-colors"
                                style={{
                                    backgroundColor: isDarkMode ? '#f4f4f5' : '#18181be6',
                                    borderColor: isDarkMode ? '#d4d4d8' : '#3f3f46'
                                }}
                            >
                                <DropdownMenuItem
                                    onClick={() => handleAddNode('etapa')}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 cursor-pointer outline-none rounded-none border-y-0 border-l-0 border-r ${isDarkMode ? 'focus:[&_*]:!text-[#18181b]' : 'focus:[&_*]:!text-[#fafafa]'}`}
                                    style={{ borderColor: isDarkMode ? '#d4d4d8' : '#3f3f46' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#e4e4e7' : '#27272ae6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <Square className="w-5 h-5" style={{ color: isDarkMode ? '#18181b' : '#fafafa' }} />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: isDarkMode ? '#18181b' : '#fafafa' }}>Etapa</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() => handleAddNode('origem')}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 cursor-pointer outline-none rounded-none border-0 ${isDarkMode ? 'focus:[&_*]:!text-[#18181b]' : 'focus:[&_*]:!text-[#fafafa]'}`}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? '#e4e4e7' : '#27272ae6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <MousePointerClick className="w-5 h-5" style={{ color: isDarkMode ? '#18181b' : '#fafafa' }} />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: isDarkMode ? '#18181b' : '#fafafa' }}>Origem</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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