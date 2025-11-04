import { Servico } from "@/models/types";
import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Serviço
export const servicoDAO = {
  async buscarTodos(limite?: number): Promise<Servico[]> {
    const url = limite ? `/servicos?limite=${limite}` : '/servicos';
    return apiRequest<Servico[]>(url);
  },

  async buscarPorId(id: string): Promise<Servico | null> {
    try {
      return await apiRequest<Servico>(`/servicos/${id}`);
    } catch {
      return null;
    }
  },

  async pesquisar(termo: string): Promise<Servico[]> {
    return apiRequest<Servico[]>(`/servicos/pesquisar/${termo}`);
  },

  async criar(servico: Omit<Servico, "id_serv" | "created_at" | "valor_final_serv">): Promise<Servico> {
    return apiRequest<Servico>('/servicos', {
      method: 'POST',
      body: JSON.stringify(servico),
    });
  },

  async atualizar(id: string, servico: Partial<Servico>): Promise<Servico> {
    return apiRequest<Servico>(`/servicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(servico),
    });
  },

  async deletar(id: string): Promise<void> {
    await apiRequest(`/servicos/${id}`, { method: 'DELETE' });
  },
};
