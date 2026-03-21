//importação do conector (handle) e enumerador de posição do react flow
import { Handle, Position } from '@xyflow/react';

//importação dos componentes do card
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

//icones visuais
import { Users, TrendingUp } from 'lucide-react';

//tipagem dos dados que o nó vai receber internamente
export type FunilNodeData = {
    title: string; //titulo do bloco
    views: number; //numero de acessos
    conversions: number; //numero de vendas
};

//componente do nó
export default function FunilNode({ data }: { data: FunilNodeData }) {

    //evita divisao por 0 em conversoes
    const conversionRate = data.views > 0 ? ((data.conversions / data.views) * 100).toFixed(1) : '0.0';

    //renderização na tela
    return (
        <div className="w-[280px]">

            {/*conector de entrada no topo do card recebendo conexao*/}
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary border-2 border-background" />

            {/*corpo do card com sombra*/}
            <Card className="shadow-lg border-border bg-card">

                {/*cabeçalho do card com foco no titulo*/}
                <CardHeader className="p-4 pb-3 border-b bg-muted/30">
                    <CardTitle className="text-sm font-bold text-foreground">{data.title}</CardTitle>
                </CardHeader>

                {/*conteúdo de métricas do cartão*/}
                <CardContent className="p-4 pt-4 space-y-4">

                    <div className="flex flex-col gap-2">

                        {/*linha de acessos formatados*/}
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <Users className="w-3.5 h-3.5" /> Acessos
                            </span>
                            <span className="font-semibold">{data.views.toLocaleString('pt-BR')}</span>
                        </div>

                        {/*linha de conversões*/}
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="w-3.5 h-3.5" /> Conversões
                            </span>
                            <span className="font-semibold">{data.conversions.toLocaleString('pt-BR')}</span>
                        </div>
                    </div>

                    {/*sessao da barra de progresso em %*/}
                    <div className="space-y-1.5 mt-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                            <span>Taxa de Conversão</span>
                            <span className="text-primary">{conversionRate}%</span>
                        </div>

                        {/*trilho de fundo vazio da barra*/}
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                            {/*preenchimento dinamico colorido*/}
                            <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Number(conversionRate))}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/*conector de saída puxando conexoes para outros nós em baixo*/}
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary border-2 border-background" />
        </div>
    );
}