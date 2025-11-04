import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Ordem de Serviço
export const osDAO = {
  async buscarTodos(limite?: number): Promise<any[]> {
    const url = limite ? `/os?limite=${limite}` : '/os';
    return apiRequest<any[]>(url);
  },

  async criar(os: {
    id_veic: string;
    id_mec: string;
    id_usu: string;
    valor_total: number;
  }): Promise<any> {
    return apiRequest<any>('/os', {
      method: 'POST',
      body: JSON.stringify(os),
    });
  },

  async adicionarPeca(idOS: string, idPeca: string, quantidade: number): Promise<void> {
    await apiRequest(`/os/${idOS}/pecas`, {
      method: 'POST',
      body: JSON.stringify({ id_peca: idPeca, quantidade }),
    });
  },

  async adicionarServico(idOS: string, idServ: string, quantidade: number): Promise<void> {
    await apiRequest(`/os/${idOS}/servicos`, {
      method: 'POST',
      body: JSON.stringify({ id_serv: idServ, quantidade }),
    });
  },

  async buscarPecas(idOS: string): Promise<any[]> {
    return apiRequest<any[]>(`/os/${idOS}/pecas`);
  },

  async buscarServicos(idOS: string): Promise<any[]> {
    return apiRequest<any[]>(`/os/${idOS}/servicos`);
  },

  async finalizar(idOS: string, formaPagamento: string): Promise<void> {
    await apiRequest(`/os/${idOS}/finalizar`, {
      method: 'PUT',
      body: JSON.stringify({ forma_pagamento: formaPagamento }),
    });
  },

  async deletar(id: string): Promise<void> {
    await apiRequest(`/os/${id}`, { method: 'DELETE' });
  },
};
