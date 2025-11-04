import { Servico } from "@/models/types";
import { servicoDAO } from "@/dao/servicoDAO";

// Service - Camada de Serviço para Serviço
export const servicoService = {
  async getAll(limit = 5): Promise<Servico[]> {
    return servicoDAO.buscarTodos(limit);
  },

  async getAllUnlimited(): Promise<Servico[]> {
    return servicoDAO.buscarTodos();
  },

  async getById(id: string): Promise<Servico | null> {
    return servicoDAO.buscarPorId(id);
  },

  async search(searchTerm: string): Promise<Servico[]> {
    return servicoDAO.pesquisar(searchTerm);
  },

  async create(servico: Omit<Servico, "id_serv" | "created_at" | "valor_final_serv">): Promise<Servico> {
    return servicoDAO.criar(servico);
  },

  async update(id: string, servico: Partial<Servico>): Promise<Servico> {
    return servicoDAO.atualizar(id, servico);
  },

  async delete(id: string): Promise<void> {
    return servicoDAO.deletar(id);
  },
};
