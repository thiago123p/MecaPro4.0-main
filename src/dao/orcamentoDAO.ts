import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Orçamento
export const orcamentoDAO = {
  async buscarTodos(limite?: number): Promise<any[]> {
    const url = limite ? `/orcamentos?limite=${limite}` : '/orcamentos';
    return apiRequest<any[]>(url);
  },

  async buscarPorId(id: string): Promise<any | null> {
    try {
      return await apiRequest<any>(`/orcamentos/${id}`);
    } catch {
      return null;
    }
  },

  async criar(orcamento: { id_veic: string; id_usu: string; valor_total: number }): Promise<any> {
    return apiRequest<any>('/orcamentos', {
      method: 'POST',
      body: JSON.stringify(orcamento),
    });
  },

  async adicionarPeca(idOrc: string, idPeca: string, quantidade: number): Promise<void> {
    await apiRequest(`/orcamentos/${idOrc}/pecas`, {
      method: 'POST',
      body: JSON.stringify({ id_peca: idPeca, quantidade }),
    });
  },

  async adicionarServico(idOrc: string, idServ: string, quantidade: number): Promise<void> {
    await apiRequest(`/orcamentos/${idOrc}/servicos`, {
      method: 'POST',
      body: JSON.stringify({ id_serv: idServ, quantidade }),
    });
  },

  async buscarPecas(idOrc: string): Promise<any[]> {
    return apiRequest<any[]>(`/orcamentos/${idOrc}/pecas`);
  },

  async buscarServicos(idOrc: string): Promise<any[]> {
    return apiRequest<any[]>(`/orcamentos/${idOrc}/servicos`);
  },

  async deletar(id: string): Promise<void> {
    await apiRequest(`/orcamentos/${id}`, { method: 'DELETE' });
  },
};
