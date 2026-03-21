import { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Settings2, Trash2 } from 'lucide-react';

//importações da ui do shadcn para o modal de edição
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
};

//adicionamos a propriedade 'selected' que o react flow envia automaticamente
export default function FunilNode({ id, data, selected }: { id: string; data: FunnelNodeData; selected?: boolean }) {
    //hook do react flow para manipular o estado global do mapa de dentro do nó
    const { setNodes } = useReactFlow();

    //estado local para controlar se o modal está aberto ou fechado
    const [isOpen, setIsOpen] = useState(false);

    //estados locais temporários para guardar os valores enquanto o usuário digita no modal
    const [editTitle, setEditTitle] = useState(data.title);
    const [editViews, setEditViews] = useState(data.views.toString());
    const [editConversions, setEditConversions] = useState(data.conversions.toString());

    //cálculo da taxa de conversão
    const conversionRate = data.views > 0 ? ((data.conversions / data.views) * 100).toFixed(1) : '0.0';

    //função para salvar as edições com sanitização
    const handleSave = () => {
        //sanitização básica dos dados
        const tituloLimpo = editTitle.trim();
        const acessosSeguros = Math.abs(Number(editViews)) || 0;
        const conversoesSeguras = Math.abs(Number(editConversions)) || 0;

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
                        },
                    };
                }
                return node;
            })
        );
        setIsOpen(false);
    };

    //função para remover o nó do mapa
    const handleDelete = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div
                className={`w-[280px] group cursor-pointer relative transition-all duration-200 ${selected ? 'scale-[1.02] -translate-y-1' : 'hover:scale-[1.01]'
                    }`}
                onDoubleClick={() => setIsOpen(true)}
            >

                {/* conector de entrada (topo) */}
                <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary border-2 border-background" />

                {/* botão de engrenagem que aparece apenas no hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full bg-background/50 hover:bg-background"
                        onClick={() => setIsOpen(true)}
                    >
                        <Settings2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                </div>

                {/* o corpo do cartão com a lógica visual de seleção */}
                <Card className={`bg-card transition-all duration-200 ${selected
                        ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl'
                        : 'border-border shadow-lg'
                    }`}>
                    <CardHeader className="p-4 pb-3 border-b bg-muted/30">
                        <CardTitle className="text-sm font-bold text-foreground pr-6">{data.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 pt-4 space-y-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3.5 h-3.5" /> Acessos</span>
                                <span className="font-semibold">{data.views.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="w-3.5 h-3.5" /> Conversões</span>
                                <span className="font-semibold">{data.conversions.toLocaleString('pt-BR')}</span>
                            </div>
                        </div>

                        {/* barra de progresso visual */}
                        <div className="space-y-1.5 mt-2">
                            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                                <span>Taxa de Conversão</span>
                                <span className="text-primary">{conversionRate}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Number(conversionRate))}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* conector de saída (base) */}
                <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary border-2 border-background" />
            </div>

            {/* conteúdo do modal de edição (mantido igual) */}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Etapa do Funil</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Título</Label>
                        <Input
                            id="title"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="views" className="text-right">Acessos</Label>
                        <Input
                            id="views"
                            type="number"
                            value={editViews}
                            onChange={(e) => setEditViews(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="conversions" className="text-right">Conversões</Label>
                        <Input
                            id="conversions"
                            type="number"
                            value={editConversions}
                            onChange={(e) => setEditConversions(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    <Button variant="destructive" onClick={handleDelete} className="flex gap-2">
                        <Trash2 className="w-4 h-4" />
                        Excluir Etapa
                    </Button>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}