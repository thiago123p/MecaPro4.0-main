import { Marca } from "@/models/types";
import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Marca
export const marcaDAO = {
  async buscarTodos(limite?: number): Promise<Marca[]> {
    const url = limite ? `/marcas?limite=${limite}` : '/marcas';
    return apiRequest<Marca[]>(url);
  },

  async buscarTodasOrdenadas(): Promise<Marca[]> {
    return apiRequest<Marca[]>('/marcas?ordenar=nome');
  },

  async buscarPorId(id: string): Promise<Marca | null> {
    try {
      return await apiRequest<Marca>(`/marcas/${id}`);
    } catch {
      return null;
    }
  },

  async pesquisar(termo: string): Promise<Marca[]> {
    return apiRequest<Marca[]>(`/marcas/pesquisar/${termo}`);
  },

  async criar(marca: Omit<Marca, "id_marca" | "created_at">): Promise<Marca> {
    return apiRequest<Marca>('/marcas', {
      method: 'POST',
      body: JSON.stringify(marca),
    });
  },

  async atualizar(id: string, marca: Partial<Marca>): Promise<Marca> {
    return apiRequest<Marca>(`/marcas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(marca),
    });
  },

  async deletar(id: string): Promise<void> {
    await apiRequest(`/marcas/${id}`, { method: 'DELETE' });
  },
};
