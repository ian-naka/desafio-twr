import { useCallback, useEffect, useState, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    reconnectEdge,
    addEdge,
    Panel,
    type Connection,
    type Edge,
    BackgroundVariant,
    type ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FunilNode from './FunilNode';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { Plus, Menu, LayoutList, Target, X, Sun, Moon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { useTheme } from '@/components/theme-provider';

const nodeTypes = {
    funilCard: FunilNode,
};

interface FunnelNodeData {
    title: string;
    views: number;
    conversions: number;
}

const NodesIniciais = [
    { id: 'node-1', position: { x: 100, y: 250 }, type: 'funilCard', data: { title: 'Anúncio no Instagram', views: 15400, conversions: 820 } },
    { id: 'node-2', position: { x: 500, y: 250 }, type: 'funilCard', data: { title: 'Página de Vendas (LP)', views: 820, conversions: 105 } }
];

const EdgeIniciais: Edge[] = [
    { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true }
];

const getInitialNodes = () => {
    const saved = localStorage.getItem('twr-nodes');
    return saved ? JSON.parse(saved) : NodesIniciais;
};

const getInitialEdges = (): Edge[] => {
    const saved = localStorage.getItem('twr-edges');
    return saved ? JSON.parse(saved) : EdgeIniciais;
};

const getInitialGridState = (): boolean => {
    const saved = localStorage.getItem('twr-showgrid');
    return saved !== null ? JSON.parse(saved) : true;
};

export default function FunilGrid() {
    const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(getInitialEdges());

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showGrid, setShowGrid] = useState<boolean>(getInitialGridState());
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

    const { theme, setTheme } = useTheme();

    useEffect(() => {
        localStorage.setItem('twr-nodes', JSON.stringify(nodes));
        localStorage.setItem('twr-edges', JSON.stringify(edges));
        localStorage.setItem('twr-showgrid', JSON.stringify(showGrid));
    }, [nodes, edges, showGrid]);

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

    const onReconnect = useCallback(
        (oldEdge: Edge, newConnection: Connection) => {
            edgeReconnectSuccessful.current = true;
            if (oldEdge.source !== newConnection.source || oldEdge.target !== newConnection.target) {
                setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
                toast.success("Conexão atualizada!");
            }
        },
        [setEdges]
    );

    const onReconnectEnd = useCallback(
        (_: any, edge: Edge) => {
            if (!edgeReconnectSuccessful.current) {
                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
                toast.info("Conexão removida.");
            }
            edgeReconnectSuccessful.current = true;
        },
        [setEdges]
    );

    const handleAddNode = useCallback(() => {
        const newNodeId = `node-${Date.now()}`;

        let position = { x: 100, y: 100 };

        if (rfInstance) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            position = rfInstance.screenToFlowPosition({
                x: centerX,
                y: centerY,
            });

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

    const handleSelectFromSidebar = (nodeId: string) => {
        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                selected: n.id === nodeId,
            }))
        );
    };

    const styledEdges = edges.map(edge => ({
        ...edge,
        style: {
            ...edge.style,
            strokeWidth: 2,
            stroke: theme === 'dark' ? '#d4d4d8' : '#27272a',
        }
    }));

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

            <div className={`relative flex-1 h-full transition-all duration-300 ease-in-out bg-zinc-200 dark:bg-background overflow-hidden ${isMenuOpen ? 'sm:mr-[350px]' : 'mr-0'}`}>
                <ReactFlow
                    nodes={nodes}
                    edges={styledEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onReconnect={onReconnect}
                    onReconnectStart={onReconnectStart}
                    onReconnectEnd={onReconnectEnd}
                    nodeTypes={nodeTypes}
                    onPaneClick={() => setIsMenuOpen(false)}
                    colorMode={theme === 'dark' ? 'dark' : 'light'}
                    fitView
                    onInit={setRfInstance}
                    defaultEdgeOptions={{
                        interactionWidth: 20,
                    }}
                >
                    {!isMenuOpen && (
                        <Panel position="top-right" className="m-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setIsMenuOpen(true)}
                                className="h-12 w-12 bg-background/80 backdrop-blur-sm border-border shadow-sm transition-transform hover:scale-105"
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
                            color={theme === 'dark' ? '#3f3f46' : '#71717a'}
                        />
                    )}

                    <Controls className="bg-background border-border shadow-sm m-4 scale-[1.2] origin-bottom-left fill-foreground" />

                    <MiniMap
                        className="hidden sm:block rounded-lg shadow-xl m-4 overflow-hidden !w-[200px] !h-[150px]"
                        maskColor={theme === 'dark' ? '#fafafacc' : '#18181be6'}
                        maskStrokeWidth={0}
                        nodeColor={theme === 'dark' ? '#f4f4f5' : '#3f3f46'}
                        nodeStrokeWidth={0}
                        style={{
                            backgroundColor: theme === 'dark' ? '#161618ff' : '#ffffff',
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
                                backgroundColor: theme === 'dark' ? '#fafafae6' : '#18181be6',
                            }}
                        >
                            <Plus className="w-8 h-8" />
                        </Button>
                    </Panel>

                </ReactFlow>
            </div>

            <aside
                className={`fixed top-0 right-0 h-full w-full sm:w-[350px] bg-zinc-50 dark:bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out z-50 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="p-6 border-b border-border flex justify-between items-center bg-zinc-50 dark:bg-card">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <h2 className="font-bold text-lg">Painel do Funil</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 flex flex-col gap-8 flex-1 overflow-hidden">
                    <div className="flex-1 overflow-hidden flex flex-col gap-3">
                        <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                            <LayoutList className="w-4 h-4" />
                            Etapas ({nodes.length})
                        </Label>

                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="grid grid-cols-1 gap-2">
                                {nodes.map((node) => {
                                    const nodeData = node.data as unknown as FunnelNodeData;
                                    return (
                                        <div
                                            key={node.id}
                                            onClick={() => handleSelectFromSidebar(node.id)}
                                            className={`p-3 rounded-md border flex items-center justify-between group hover:border-primary transition-colors cursor-pointer ${node.selected ? 'bg-primary/10 border-primary' : 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800/40 border-border'
                                                }`}
                                        >
                                            <div className="flex flex-col truncate pr-2">
                                                <span className="text-sm font-bold truncate">{nodeData.title}</span>
                                                <span className="text-[10px] text-muted-foreground">ID: {node.id.split('-')[1] || 'init'}</span>
                                            </div>

                                            <div className="flex items-center">
                                                <Button
                                                    variant="ghost"
                                                    className="h-auto py-1 px-2 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.dispatchEvent(new CustomEvent('openEditNode', { detail: node.id }));
                                                    }}
                                                >
                                                    Editar
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border mt-auto mb-4 space-y-4">
                        <Label className="text-xs uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2 mb-4">
                            Configurações
                        </Label>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-zinc-200 dark:bg-zinc-800/40">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold">Exibir Grid</span>
                                    <span className="text-[10px] text-muted-foreground">Mostrar pontilhado de fundo</span>
                                </div>
                                <Switch
                                    checked={showGrid}
                                    onCheckedChange={setShowGrid}
                                    className="data-[state=unchecked]:!bg-zinc-400 dark:data-[state=unchecked]:!bg-zinc-700 border border-zinc-400 dark:border-transparent"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-zinc-200 dark:bg-zinc-800/40">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-semibold flex items-center gap-2">
                                        Tema Escuro
                                        {theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">Alternar cores da interface</span>
                                </div>
                                <Switch
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                    className="data-[state=unchecked]:!bg-zinc-400 dark:data-[state=unchecked]:!bg-zinc-700 border border-zinc-400 dark:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <span className={`text-sm font-medium leading-none ${className}`}>{children}</span>;
}