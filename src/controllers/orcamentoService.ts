import { orcamentoDAO } from "@/dao/orcamentoDAO";

// Service - Camada de Serviço para Orçamento
export const orcamentoService = {
  async getAll(limit = 5): Promise<any[]> {
    return orcamentoDAO.buscarTodos(limit);
  },

  async getById(id: string): Promise<any | null> {
    return orcamentoDAO.buscarPorId(id);
  },

  async create(orcamento: { id_veic: string; id_usu: string; valor_total: number }): Promise<any> {
    return orcamentoDAO.criar(orcamento);
  },

  async addPeca(idOrc: string, idPeca: string, quantidade: number): Promise<void> {
    return orcamentoDAO.adicionarPeca(idOrc, idPeca, quantidade);
  },

  async addServico(idOrc: string, idServ: string, quantidade: number): Promise<void> {
    return orcamentoDAO.adicionarServico(idOrc, idServ, quantidade);
  },

  async getPecas(idOrc: string): Promise<any[]> {
    return orcamentoDAO.buscarPecas(idOrc);
  },

  async getServicos(idOrc: string): Promise<any[]> {
    return orcamentoDAO.buscarServicos(idOrc);
  },

  async update(id: string, data: { id_veic?: string; valor_total?: number; observacao?: string }): Promise<any> {
    return orcamentoDAO.atualizar(id, data);
  },

  async removePeca(idOrc: string, idPeca: string): Promise<void> {
    return orcamentoDAO.removerPeca(idOrc, idPeca);
  },

  async removeServico(idOrc: string, idServ: string): Promise<void> {
    return orcamentoDAO.removerServico(idOrc, idServ);
  },

  async delete(id: string): Promise<void> {
    return orcamentoDAO.deletar(id);
  },
};
