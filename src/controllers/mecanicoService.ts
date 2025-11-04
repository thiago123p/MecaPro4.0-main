import { Mecanico } from "@/models/types";
import { mecanicoDAO } from "@/dao/mecanicoDAO";

// Service - Camada de Serviço para Mecânico
export const mecanicoService = {
  async getAll(limit = 5): Promise<Mecanico[]> {
    return mecanicoDAO.buscarTodos(limit);
  },

  async getById(id: string): Promise<Mecanico | null> {
    return mecanicoDAO.buscarPorId(id);
  },

  async search(searchTerm: string): Promise<Mecanico[]> {
    return mecanicoDAO.pesquisar(searchTerm);
  },

  async create(mecanico: Omit<Mecanico, "id_mec" | "created_at">): Promise<Mecanico> {
    return mecanicoDAO.criar(mecanico);
  },

  async update(id: string, mecanico: Partial<Mecanico>): Promise<Mecanico> {
    return mecanicoDAO.atualizar(id, mecanico);
  },

  async delete(id: string): Promise<void> {
    return mecanicoDAO.deletar(id);
  },
};
