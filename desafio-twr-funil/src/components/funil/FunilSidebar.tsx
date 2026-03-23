//painel lateral - lista etapas do funil e controla configurações visuais 
import { Target, X, Sun, Moon, Activity, Circle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import type { Node } from '@xyflow/react';
import type { FunnelNodeData } from '../types/Interfaces';

interface FunilSidebarProps {
    isMenuOpen: boolean;
    setIsMenuOpen: (val: boolean) => void;
    nodes: Node[];
    setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
    showGrid: boolean;
    setShowGrid: (val: boolean) => void;
    theme: string;
    setTheme: (theme: any) => void;
    animateFlow: boolean;
    setAnimateFlow: (val: boolean) => void;
}

export default function FunilSidebar({
    isMenuOpen, setIsMenuOpen, nodes, setNodes, showGrid, setShowGrid, theme, setTheme, animateFlow, setAnimateFlow
}: FunilSidebarProps) {
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);



    //marca o no clicado como selecionado e desmarca todos os outros
    const handleSelectFromSidebar = (nodeId: string) => {
        setNodes((nds) =>
            nds.map((n) => ({
                ...n,
                selected: n.id === nodeId,
            }))
        );
    };

    return (
        <aside className={`fixed top-0 right-0 h-full w-full sm:w-[350px] bg-zinc-50 dark:bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-in-out z-50 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 border-b border-border flex justify-between items-center bg-zinc-50 dark:bg-card">
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <h2 className="font-bold text-lg">Painel</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="p-6 flex flex-col gap-8 flex-1 overflow-hidden">
                <div className="flex-1 overflow-hidden flex flex-col gap-3">
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <div className="grid grid-cols-1 gap-2">
                            {nodes.map((node) => {
                                const nodeData = node.data as unknown as FunnelNodeData;
                                const isOrigem = nodeData.formatoNode === 'origem';

                                return (
                                    <div
                                        key={node.id}
                                        onClick={() => handleSelectFromSidebar(node.id)}
                                        className={`p-3 rounded-md border flex items-center justify-between group hover:border-primary transition-colors cursor-pointer ${node.selected ? 'bg-primary/10 border-primary' : 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800/40 border-border'}`}
                                    >
                                        <div className="flex items-center gap-3 truncate pr-2">
                                            <div className="p-1.5 rounded bg-primary/10 text-primary">
                                                {isOrigem ? <Circle className="w-3 h-3 fill-current" /> : <Square className="w-3 h-3 fill-current" />}
                                            </div>

                                            <div className="flex flex-col truncate">
                                                <span className="text-sm font-bold truncate leading-tight">{nodeData.title}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {isOrigem ? 'Origem de Tráfego' : 'Etapa do Funil'}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="h-auto py-1 px-2 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.dispatchEvent(new CustomEvent('openEditNode', { detail: node.id }));
                                            }}
                                        >
                                            Editar
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border mt-auto mb-4 space-y-4">
                    <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2 font-medium leading-none mb-4">Configurações globais</span>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-zinc-200 dark:bg-zinc-800/40">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-semibold">Exibir Grid</span>
                                <span className="text-[10px] text-muted-foreground">Mostrar pontilhado de fundo</span>
                            </div>
                            <Switch checked={showGrid} onCheckedChange={setShowGrid} className="data-[state=unchecked]:!bg-zinc-400 dark:data-[state=unchecked]:!bg-zinc-700 border border-zinc-400 dark:border-transparent" />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-zinc-200 dark:bg-zinc-800/40">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-semibold flex items-center gap-2">Tema Escuro {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}</span>
                                <span className="text-[10px] text-muted-foreground">Alternar cores da interface</span>
                            </div>
                            <Switch checked={isDarkMode} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} className="data-[state=unchecked]:!bg-zinc-400 dark:data-[state=unchecked]:!bg-zinc-700 border border-zinc-400 dark:border-transparent" />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-zinc-200 dark:bg-zinc-800/40">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-semibold flex items-center gap-2">Animar Fluxo <Activity className="w-3.5 h-3.5 text-primary" /></span>
                                <span className="text-[10px] text-muted-foreground">Movimento nas conexões</span>
                            </div>
                            <Switch checked={animateFlow} onCheckedChange={setAnimateFlow} className="data-[state=unchecked]:!bg-zinc-400 dark:data-[state=unchecked]:!bg-zinc-700 border border-zinc-400 dark:border-transparent" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}