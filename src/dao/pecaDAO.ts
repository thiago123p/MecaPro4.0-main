import { Peca } from "@/models/types";
import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Peça
export const pecaDAO = {
  async buscarTodos(limite?: number): Promise<Peca[]> {
    const url = limite ? `/pecas?limite=${limite}` : '/pecas';
    return apiRequest<Peca[]>(url);
  },

  async buscarPorId(id: string): Promise<Peca | null> {
    try {
      return await apiRequest<Peca>(`/pecas/${id}`);
    } catch {
      return null;
    }
  },

  async pesquisar(termo: string): Promise<Peca[]> {
    return apiRequest<Peca[]>(`/pecas/pesquisar/${termo}`);
  },

  async criar(peca: Omit<Peca, "id_peca" | "created_at">): Promise<Peca> {
    return apiRequest<Peca>('/pecas', {
      method: 'POST',
      body: JSON.stringify(peca),
    });
  },

  async atualizar(id: string, peca: Partial<Peca>): Promise<Peca> {
    return apiRequest<Peca>(`/pecas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(peca),
    });
  },

  async deletar(id: string): Promise<void> {
    await apiRequest(`/pecas/${id}`, { method: 'DELETE' });
  },
};
