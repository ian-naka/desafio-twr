import { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Users,
    TrendingUp,
    Settings2,
    Trash2,
    Target,
    Megaphone,
    MousePointerClick,
    FileText,
    ShoppingCart,
    Mail
} from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type FunnelNodeData = {
    title: string;
    views: number;
    conversions: number;
    category?: string;
};

const categoryConfig: Record<string, { icon: any, color: string, bg: string, label: string }> = {
    'anuncio': { icon: Megaphone, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', label: 'Anúncio' },
    'landing-page': { icon: MousePointerClick, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', label: 'Landing Page' },
    'formulario': { icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', label: 'Formulário' },
    'checkout': { icon: ShoppingCart, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', label: 'Checkout' },
    'email': { icon: Mail, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', label: 'E-mail' },
    'default': { icon: Target, color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-500/10', label: 'Etapa' }
};

export default function FunilNode({ id, data, selected }: { id: string; data: FunnelNodeData; selected?: boolean }) {
    const { setNodes } = useReactFlow();
    const [isOpen, setIsOpen] = useState(false);

    const [editTitle, setEditTitle] = useState(data.title);
    const [editViews, setEditViews] = useState(data.views.toString());
    const [editConversions, setEditConversions] = useState(data.conversions.toString());
    const [editCategory, setEditCategory] = useState(data.category || 'default');

    const conversionRate = data.views > 0 ? ((data.conversions / data.views) * 100).toFixed(1) : '0.0';

    useEffect(() => {
        if (isOpen) {
            setEditTitle(data.title);
            setEditViews(data.views.toString());
            setEditConversions(data.conversions.toString());
            setEditCategory(data.category || 'default');
        }
    }, [isOpen, data]);

    useEffect(() => {
        const handleOpenEdit = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail === id) setIsOpen(true);
        };
        window.addEventListener('openEditNode', handleOpenEdit);
        return () => window.removeEventListener('openEditNode', handleOpenEdit);
    }, [id]);

    const preventInvalidChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleViewsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (newValue.length <= 8) {
            setEditViews(newValue);
        }
    };

    const handleConversionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (newValue.length <= 8) {
            setEditConversions(newValue);
        }
    };

    const handleSave = () => {
        const tituloLimpo = editTitle.trim();
        const acessosSeguros = Math.abs(Number(editViews)) || 0;
        const conversoesSeguras = Math.abs(Number(editConversions)) || 0;
        const viewsNum = Number(editViews);
        const conversionsNum = Number(editConversions);

        if (!tituloLimpo) {
            toast.error("O título da etapa não pode estar vazio.");
            return;
        }

        if (viewsNum < 0 || conversionsNum < 0) {
            toast.error("Os valores não podem ser negativos.");
            return;
        }

        if (conversionsNum > viewsNum) {
            toast.error("As conversões não podem ser maiores que os acessos!");
            return;
        }

        if (viewsNum > 99999999) {
            toast.error("O limite máximo de acessos é 99 milhões.");
            return;
        }

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            title: tituloLimpo,
                            views: acessosSeguros,
                            conversions: conversoesSeguras,
                            category: editCategory
                        },
                    };
                }
                return node;
            })
        );
        setIsOpen(false);
        toast.success("Etapa atualizada com sucesso!");
    };

    const handleDelete = () => {
        window.dispatchEvent(new CustomEvent('manualNodeDelete'));

        setNodes((nds) => nds.filter((node) => node.id !== id));
        setIsOpen(false);

        toast("Etapa excluída", {
            description: `A etapa "${data.title}" foi removida do funil.`
        });
    };

    const currentCategory = data.category || 'default';
    const config = categoryConfig[currentCategory] || categoryConfig['default'];
    const Icon = config.icon;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                        onClick={() => setIsOpen(true)}
                    >
                        <Settings2 className="w-3 h-3" />
                    </Button>
                </div>

                <Card className={`bg-white dark:bg-zinc-900 relative overflow-hidden transition-all duration-200 ${selected ? 'border-zinc-500 ring-2 ring-zinc-500 ring-offset-2 dark:border-primary shadow-xl' : 'border-zinc-200 dark:border-zinc-800 shadow-lg'
                    }`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-zinc-500 dark:bg-primary/70" />

                    <CardHeader className="p-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pt-5">

                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider w-fit mb-2.5 ${config.bg} ${config.color}`}>
                            <Icon className="w-3 h-3" />
                            {config.label}
                        </div>

                        <CardTitle
                            className="text-[16px] font-bold text-foreground pr-6 tracking-tight whitespace-normal break-words leading-tight"
                            style={{
                                textRendering: 'optimizeLegibility',
                                WebkitFontSmoothing: 'subpixel-antialiased',
                                letterSpacing: '-0.01em'
                            }}
                        >
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
                            <div className="w-full bg-zinc-300 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
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

            <DialogContent className="sm:max-w-[425px] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Editar Etapa</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Categoria</Label>
                        <select
                            id="category"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="default">Etapa Genérica</option>
                            <option value="anuncio">Anúncio</option>
                            <option value="landing-page">Landing Page</option>
                            <option value="formulario">Formulário</option>
                            <option value="checkout">Checkout</option>
                            <option value="email">E-mail</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <Input id="title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="col-span-3" maxLength={50} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="views" className="text-right">Acessos</Label>
                        <Input
                            id="views"
                            type="number"
                            min="0"
                            value={editViews}
                            onChange={handleViewsChange}
                            onKeyDown={preventInvalidChars}
                            className="col-span-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="conversions" className="text-right">Conversões</Label>
                        <Input
                            id="conversions"
                            type="number"
                            min="0"
                            value={editConversions}
                            onChange={handleConversionsChange}
                            onKeyDown={preventInvalidChars}
                            className="col-span-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                </div>
                <DialogFooter className="flex flex-row items-center !justify-between sm:!justify-between sm:space-x-0 mt-6 -mx-6 -mb-6 px-6 pt-4 pb-6 bg-zinc-100 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 rounded-b-lg">
                    <Button variant="destructive" onClick={handleDelete} className="flex gap-2">
                        <Trash2 className="w-4 h-4" /> Excluir
                    </Button>
                    <Button onClick={handleSave}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}