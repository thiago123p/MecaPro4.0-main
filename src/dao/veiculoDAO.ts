import { Veiculo } from "@/models/types";
import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Veículo
export const veiculoDAO = {
  async buscarTodos(limite?: number): Promise<Veiculo[]> {
    const url = limite ? `/veiculos?limite=${limite}` : '/veiculos';
    return apiRequest<Veiculo[]>(url);
  },

  async buscarPorId(id: string): Promise<Veiculo | null> {
    try {
      return await apiRequest<Veiculo>(`/veiculos/${id}`);
    } catch {
      return null;
    }
  },

  async pesquisar(termo: string): Promise<Veiculo[]> {
    return apiRequest<Veiculo[]>(`/veiculos/pesquisar/${termo}`);
  },

  async criar(veiculo: Omit<Veiculo, "id_veic" | "created_at">): Promise<Veiculo> {
    return apiRequest<Veiculo>('/veiculos', {
      method: 'POST',
      body: JSON.stringify(veiculo),
    });
  },

  async atualizar(id: string, veiculo: Partial<Veiculo>): Promise<Veiculo> {
    return apiRequest<Veiculo>(`/veiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(veiculo),
    });
  },

  async deletar(id: string): Promise<void> {
    await apiRequest(`/veiculos/${id}`, { method: 'DELETE' });
  },
};
