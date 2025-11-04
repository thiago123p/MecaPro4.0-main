import { Mecanico } from "@/models/types";
import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Mecânico
export const mecanicoDAO = {
  async buscarTodos(limite?: number): Promise<Mecanico[]> {
    const url = limite ? `/mecanicos?limite=${limite}` : '/mecanicos';
    return apiRequest<Mecanico[]>(url);
  },

  async buscarPorId(id: string): Promise<Mecanico | null> {
    try {
      return await apiRequest<Mecanico>(`/mecanicos/${id}`);
    } catch {
      return null;
    }
  },

  async pesquisar(termo: string): Promise<Mecanico[]> {
    return apiRequest<Mecanico[]>(`/mecanicos/pesquisar/${termo}`);
  },

  async criar(mecanico: Omit<Mecanico, "id_mec" | "created_at">): Promise<Mecanico> {
    return apiRequest<Mecanico>('/mecanicos', {
      method: 'POST',
      body: JSON.stringify(mecanico),
    });
  },

  async atualizar(id: string, mecanico: Partial<Mecanico>): Promise<Mecanico> {
    return apiRequest<Mecanico>(`/mecanicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mecanico),
    });
  },

  async deletar(id: string): Promise<void> {
    await apiRequest(`/mecanicos/${id}`, { method: 'DELETE' });
  },
};
