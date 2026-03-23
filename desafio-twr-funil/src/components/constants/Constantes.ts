//configurações centrais: categorias visuais, nós/arestas padrão e leitura do localStorage
import {
    Target,
    Megaphone,
    MousePointerClick,
    FileText,
    ShoppingCart,
    Mail
} from 'lucide-react';
import type { ElementType } from 'react';
import type { Edge } from '@xyflow/react';

//cada categoria tem ícone, cor e label próprios pra renderizar o nó
export const categoryConfig: Record<string, { icon: ElementType, color: string, bg: string, label: string }> = {
    'anuncio': { icon: Megaphone, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', label: 'Anúncio' },
    'landing-page': { icon: MousePointerClick, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', label: 'Landing Page' },
    'formulario': { icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', label: 'Formulário' },
    'checkout': { icon: ShoppingCart, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', label: 'Checkout' },
    'email': { icon: Mail, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', label: 'E-mail' },
    'default': { icon: Target, color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-500/10', label: 'Etapa' }
};

//dados de demonstração pro primeiro acesso (localStorage está vazio)
export const NodesIniciais = [
    { id: 'node-1', position: { x: 100, y: 250 }, type: 'funilCard', data: { title: 'Anúncio no Instagram', views: 15400, conversions: 820 } },
    { id: 'node-2', position: { x: 500, y: 250 }, type: 'funilCard', data: { title: 'Página de Vendas (LP)', views: 820, conversions: 105 } }
];

export const EdgeIniciais: Edge[] = [
    { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true }
];

//trava pra impedir que o usuário se perca no infinito
export const MAP_LIMIT: [[number, number], [number, number]] = [
    [-3500, -3500],
    [3500, 3500]
];

//cada getter tenta recuperar do storage - se não existir, fallback padrão
export const getInitialNodes = () => {
    const saved = localStorage.getItem('twr-nodes');
    return saved ? JSON.parse(saved) : NodesIniciais;
};

export const getInitialEdges = (): Edge[] => {
    const saved = localStorage.getItem('twr-edges');
    return saved ? JSON.parse(saved) : EdgeIniciais;
};

export const getInitialGridState = (): boolean => {
    const saved = localStorage.getItem('twr-showgrid');
    return saved !== null ? JSON.parse(saved) : true;
};

export const getInitialAnimateState = (): boolean => {
    const saved = localStorage.getItem('twr-animate');
    return saved !== null ? JSON.parse(saved) : true;
};
