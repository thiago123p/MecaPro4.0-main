import { Cliente } from "@/models/types";
import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Cliente
export const clienteDAO = {
  async buscarTodos(limite?: number): Promise<Cliente[]> {
    const url = limite ? `/clientes?limite=${limite}` : '/clientes';
    return apiRequest<Cliente[]>(url);
  },

  async buscarPorId(id: string): Promise<Cliente | null> {
    try {
      return await apiRequest<Cliente>(`/clientes/${id}`);
    } catch {
      return null;
    }
  },

  async pesquisar(termo: string): Promise<Cliente[]> {
    return apiRequest<Cliente[]>(`/clientes/pesquisar/${termo}`);
  },

  async criar(cliente: Omit<Cliente, "id_cli" | "created_at">): Promise<Cliente> {
    return apiRequest<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  },

  async atualizar(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    return apiRequest<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    });
  },

  async deletar(id: string): Promise<void> {
    await apiRequest(`/clientes/${id}`, { method: 'DELETE' });
  },
};
