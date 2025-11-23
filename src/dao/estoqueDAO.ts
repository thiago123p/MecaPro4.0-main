import { ControleEstoque } from "@/models/types";
import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Estoque
export const estoqueDAO = {
  async buscarTodos(): Promise<ControleEstoque[]> {
    return apiRequest<ControleEstoque[]>('/estoque');
  },

  async buscarResumo(): Promise<ControleEstoque[]> {
    try {
      console.log('📦 DAO: Buscando resumo de estoque...');
      const resultado = await apiRequest<ControleEstoque[]>('/estoque/resumo');
      console.log('📦 DAO: Resumo recebido:', resultado);
      console.log('📦 DAO: Tipo do resultado:', Array.isArray(resultado) ? 'Array' : typeof resultado);
      console.log('📦 DAO: Quantidade de itens:', Array.isArray(resultado) ? resultado.length : 'N/A');
      return resultado;
    } catch (error) {
      console.error('📦 DAO: Erro ao buscar resumo:', error);
      throw error;
    }
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
