import { osDAO } from "@/dao/osDAO";

// Service - Camada de Serviço para Ordem de Serviço
export const osService = {
  async getAll(limit = 5): Promise<any[]> {
    return osDAO.buscarTodos(limit);
  },

  async create(os: {
    id_veic: string;
    id_mec: string;
    id_usu: string;
    valor_total: number;
  }): Promise<any> {
    return osDAO.criar(os);
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

  async finalizar(idOS: string, formaPagamento: string): Promise<void> {
    return osDAO.finalizar(idOS, formaPagamento);
  },

  async delete(id: string): Promise<void> {
    return osDAO.deletar(id);
  },
};
