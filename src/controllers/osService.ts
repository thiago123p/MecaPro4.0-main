import { osDAO } from "@/dao/osDAO";

// Service - Camada de Serviço para Ordem de Serviço
export const osService = {
  async getAll(limit = 5): Promise<any[]> {
    return osDAO.buscarTodos(limit);
  },

  async getById(id: string): Promise<any> {
    return osDAO.buscarPorId(id);
  },

  async create(os: {
    id_veic: string;
    id_mec: string;
    id_usu: string;
    valor_total: number;
  }): Promise<any> {
    return osDAO.criar(os);
  },

  async update(id: string, os: {
    id_veic?: string;
    id_mec?: string;
    valor_total?: number;
    observacao?: string;
  }): Promise<any> {
    return osDAO.atualizar(id, os);
  },

  async addPeca(idOS: string, idPeca: string, quantidade: number): Promise<void> {
    return osDAO.adicionarPeca(idOS, idPeca, quantidade);
  },

  async addServico(idOS: string, idServ: string, quantidade: number): Promise<void> {
    return osDAO.adicionarServico(idOS, idServ, quantidade);
  },

  async getPecas(idOS: string): Promise<any[]> {
    return osDAO.buscarPecas(idOS);
  },

  async getServicos(idOS: string): Promise<any[]> {
    return osDAO.buscarServicos(idOS);
  },

  async removePeca(idOS: string, idPeca: string): Promise<void> {
    return osDAO.removerPeca(idOS, idPeca);
  },

  async removeServico(idOS: string, idServ: string): Promise<void> {
    return osDAO.removerServico(idOS, idServ);
  },

  async finalizar(idOS: string, formaPagamento: string, descontoPecas: number = 0, descontoServicos: number = 0): Promise<void> {
    return osDAO.finalizar(idOS, formaPagamento, descontoPecas, descontoServicos);
  },

  async delete(id: string): Promise<void> {
    return osDAO.deletar(id);
  },
};
