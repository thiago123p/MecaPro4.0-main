import { ControleEstoque } from "@/models/types";
import { estoqueDAO } from "@/dao/estoqueDAO";

// Service - Camada de Serviço para Estoque
export const estoqueService = {
  async getAll(): Promise<ControleEstoque[]> {
    return estoqueDAO.buscarTodos();
  },

  async getByPecaId(idPeca: string): Promise<ControleEstoque | null> {
    return estoqueDAO.buscarPorPeca(idPeca);
  },

  async registrarMovimentacao(idPeca: string, quantidade: number): Promise<void> {
    return estoqueDAO.registrarMovimentacao(idPeca, quantidade);
  },
};
