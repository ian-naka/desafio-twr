import { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
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
import type { FunnelNodeData } from './Interfaces';

interface NoEditarProps {
    id: string;
    data: FunnelNodeData;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function NoEditar({ id, data, isOpen, setIsOpen }: NoEditarProps) {
    const { setNodes } = useReactFlow();

    const [editTitle, setEditTitle] = useState(data.title);
    const [editViews, setEditViews] = useState(data.views.toString());
    const [editConversions, setEditConversions] = useState(data.conversions.toString());
    const [editCategory, setEditCategory] = useState(data.category || 'default');

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                setEditTitle(data.title);
                setEditViews(data.views.toString());
                setEditConversions(data.conversions.toString());
                setEditCategory(data.category || 'default');
            }, 0);
        }
    }, [isOpen, data]);

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

        toast.info("Etapa excluída", {
            description: `A etapa "${data.title}" foi removida do funil.`
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
