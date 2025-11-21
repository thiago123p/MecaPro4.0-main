import { ControleEstoque } from "@/models/types";
import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Estoque
export const estoqueDAO = {
  async buscarTodos(): Promise<ControleEstoque[]> {
    return apiRequest<ControleEstoque[]>('/estoque');
  },

  async buscarResumo(): Promise<ControleEstoque[]> {
    return apiRequest<ControleEstoque[]>('/estoque/resumo');
  },

  async buscarPorPeca(idPeca: string): Promise<ControleEstoque | null> {
    try {
      return await apiRequest<ControleEstoque>(`/estoque/peca/${idPeca}`);
    } catch {
      return null;
    }
  },

  async registrarMovimentacao(idPeca: string, quantidade: number): Promise<void> {
    await apiRequest('/estoque/movimentacao', {
      method: 'POST',
      body: JSON.stringify({ id_peca: idPeca, quantidade }),
    });
  },
};
