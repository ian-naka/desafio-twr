//renderiza métricas, categoria e abre editar nó
import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { FunnelNodeData } from '../types/Interfaces';
import { categoryConfig } from '../constants/Constantes';
import NoEditar from './NoEditar';


export default function FunilNode({ id, data, selected }: { id: string; data: FunnelNodeData; selected?: boolean }) {
    const isOrigem = data.formatoNode === 'origem';
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleOpenEdit = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail === id) setIsOpen(true);
        };
        window.addEventListener('openEditNode', handleOpenEdit);
        return () => window.removeEventListener('openEditNode', handleOpenEdit);
    }, [id]);

    const currentCategory = data.category || 'default';
    const config = categoryConfig[currentCategory] || categoryConfig['default'];
    const Icon = config.icon;

    if (isOrigem) {
        const borderClass = config.color.replace('text-', 'border-');

        return (
            <>
                <div
                    className="flex flex-col items-center justify-center group cursor-pointer relative"
                    style={{ backfaceVisibility: 'hidden' }}
                    onDoubleClick={() => setIsOpen(true)}
                >
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10 -mr-2 -mt-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-sm border border-zinc-200 dark:border-zinc-700"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(true);
                            }}
                        >
                            <Settings2 className="w-3 h-3 text-foreground" />
                        </Button>
                    </div>

                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-[3px] shadow-xl transition-all duration-200 ${selected
                        ? 'border-primary bg-primary/10 scale-105 ring-4 ring-primary/20'
                        : `bg-white dark:bg-zinc-800 hover:border-primary/50 ${borderClass}`
                        }`}>
                        <Icon className={`w-8 h-8 transition-colors ${selected ? 'text-primary' : `${config.color} group-hover:text-primary`
                            }`} />
                    </div>

                    <div className="absolute -bottom-8 flex flex-col items-center pointer-events-none text-center">
                        <span className="text-[13px] font-bold text-foreground leading-tight tracking-tight">
                            {data.title}
                        </span>
                    </div>

                    <Handle type="source" position={Position.Right} className="!w-3 !h-3 bg-primary border-2 border-background z-20" />
                </div>

                <NoEditar id={id} data={data} isOpen={isOpen} setIsOpen={setIsOpen} />
            </>
        );
    }

    const conversionRate = data.views > 0 ? ((data.conversions / data.views) * 100).toFixed(1) : '0.0';

    return (
        <>
            <div
                className={`w-[280px] group cursor-pointer relative transition-all duration-200 ${selected ? 'scale-[1.02] -translate-y-1' : 'hover:scale-[1.01]'
                    }`}
                onDoubleClick={() => setIsOpen(true)}
                style={{
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'subpixel-antialiased',
                    transform: 'translateZ(0)'
                }}
            >
                <Handle
                    type="target"
                    position={Position.Left}
                    isConnectableStart={false}
                    className="!w-1.5 !h-10 !bg-primary !border-0 !rounded-sm !-left-[3px] z-20 hover:!w-2 hover:!h-12 transition-all shadow-sm cursor-default"
                />

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(true);
                        }}
                    >
                        <Settings2 className="w-3 h-3 text-foreground" />
                    </Button>
                </div>

                <Card className={`bg-white dark:bg-zinc-800 relative overflow-hidden transition-all duration-200 ${selected ? 'border-zinc-500 ring-2 ring-zinc-500 ring-offset-2 dark:border-primary shadow-xl' : 'border-zinc-200 dark:border-zinc-800 shadow-lg'
                    }`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-zinc-500 dark:bg-primary/70" />

                    <CardHeader className="p-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pt-5">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit mb-2.5 ${config.bg} ${config.color}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                        </div>

                        <CardTitle className="text-[16px] font-bold text-foreground pr-6 tracking-tight whitespace-normal break-words leading-tight">
                            {data.title}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 pt-4 space-y-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3.5 h-3.5" /> Acessos</span>
                                <span className="font-bold antialiased">{data.views.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="w-3.5 h-3.5" /> Conversões</span>
                                <span className="font-bold antialiased">{data.conversions.toLocaleString('pt-BR')}</span>
                            </div>
                        </div>

                        <div className="space-y-1.5 mt-2">
                            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold antialiased">
                                <span>Taxa de Conversão</span>
                                <span className="text-primary">{conversionRate}%</span>
                            </div>
                            <div className="w-full bg-zinc-300 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Number(conversionRate))}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Handle type="source" position={Position.Right} className="!w-3 !h-3 bg-primary border-2 border-background z-20" />
            </div>

            <NoEditar id={id} data={data} isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
}