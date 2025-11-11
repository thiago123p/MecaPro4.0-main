import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Ordem de Serviço
export const osDAO = {
  async buscarTodos(limite?: number): Promise<any[]> {
    const url = limite ? `/os?limite=${limite}` : '/os';
    return apiRequest<any[]>(url);
  },

  async buscarPorId(id: string): Promise<any> {
    return apiRequest<any>(`/os/${id}`);
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

  async atualizar(id: string, os: {
    id_veic?: string;
    id_mec?: string;
    valor_total?: number;
    observacao?: string;
  }): Promise<any> {
    return apiRequest<any>(`/os/${id}`, {
      method: 'PUT',
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

  async removerPeca(idOS: string, idPeca: string): Promise<void> {
    await apiRequest(`/os/${idOS}/pecas/${idPeca}`, { method: 'DELETE' });
  },

  async removerServico(idOS: string, idServ: string): Promise<void> {
    await apiRequest(`/os/${idOS}/servicos/${idServ}`, { method: 'DELETE' });
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
