import { Peca } from "@/models/types";
import { pecaDAO } from "@/dao/pecaDAO";

// Service - Camada de Serviço para Peça
export const pecaService = {
  async getAll(limit = 5): Promise<Peca[]> {
    const data = await pecaDAO.buscarTodos(limit);
    return data.map((p) => ({
      ...p,
      preco_peca: Number((p as any).preco_peca),
    }));
  },

  async getAllUnlimited(): Promise<Peca[]> {
    const data = await pecaDAO.buscarTodos();
    return data.map((p) => ({
      ...p,
      preco_peca: Number((p as any).preco_peca),
    }));
  },

  async getById(id: string): Promise<Peca | null> {
    const p = await pecaDAO.buscarPorId(id);
    if (!p) return null;
    return {
      ...p,
      preco_peca: Number((p as any).preco_peca),
    } as Peca;
  },

  async search(searchTerm: string): Promise<Peca[]> {
    const data = await pecaDAO.pesquisar(searchTerm);
    return data.map((p) => ({
      ...p,
      preco_peca: Number((p as any).preco_peca),
    }));
  },

  async create(peca: Omit<Peca, "id_peca" | "created_at">): Promise<Peca> {
    return pecaDAO.criar(peca);
  },

  async update(id: string, peca: Partial<Peca>): Promise<Peca> {
    return pecaDAO.atualizar(id, peca);
  },

  async delete(id: string): Promise<void> {
    return pecaDAO.deletar(id);
  },
};
