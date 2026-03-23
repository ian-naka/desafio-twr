//dados que cada nó do funil precisa carregar
export interface FunnelNodeData {
    title: string;
    views: number;
    conversions: number;
    category?: string;
    formatoNode?: 'etapa' | 'origem';
}
