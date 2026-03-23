//grava snapshots do estado do funil e restaura via ctrl+z
import { useEffect, useRef, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { getInitialNodes, getInitialEdges } from '../constants/Constantes';

export function useFunilHistorico(
    nodes: Node[],
    edges: Edge[],
    setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void,
    setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void
) {
    const pastRef = useRef<{ nodes: Node[], edges: Edge[] }[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isUndoing = useRef(false);

    //carrega o estado salvo como ponto zero do histórico
    useEffect(() => {
        pastRef.current = [{ nodes: getInitialNodes(), edges: getInitialEdges() }];
    }, []);

    //300ms pra não gravar cada micro-mudança 
    useEffect(() => {
        if (isUndoing.current) {
            isUndoing.current = false;
            return;
        }

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            const currentStateStr = JSON.stringify({ nodes, edges });
            const lastState = pastRef.current[pastRef.current.length - 1];

            //compara serializado pra evitar push de estado idêntico
            if (!lastState || JSON.stringify(lastState) !== currentStateStr) {
                pastRef.current.push({
                    nodes: JSON.parse(JSON.stringify(nodes)),
                    edges: JSON.parse(JSON.stringify(edges))
                });
                //limite de 30 snapshots
                if (pastRef.current.length > 30) pastRef.current.shift();
            }
        }, 300);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [nodes, edges]);

    const undo = useCallback(() => {
        if (pastRef.current.length > 1) {
            isUndoing.current = true;
            pastRef.current.pop();
            const previousState = pastRef.current[pastRef.current.length - 1];
            setNodes(previousState.nodes);
            setEdges(previousState.edges);
            toast.info("Ação desfeita");
        } else {
            toast.error("Nada mais para desfazer");
        }
    }, [setNodes, setEdges]);

    //ignora ctrl+z quando o foco está num input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
                    return;
                }
                e.preventDefault();
                undo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo]);

    return { undo };
}
