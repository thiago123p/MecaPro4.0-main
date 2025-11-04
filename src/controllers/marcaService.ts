import { Marca } from "@/models/types";
import { marcaDAO } from "@/dao/marcaDAO";

// Service - Camada de Serviço para Marca
export const marcaService = {
  async getAll(limit = 5): Promise<Marca[]> {
    return marcaDAO.buscarTodos(limit);
  },

  async getAllUnlimited(): Promise<Marca[]> {
    return marcaDAO.buscarTodasOrdenadas();
  },

  async getById(id: string): Promise<Marca | null> {
    return marcaDAO.buscarPorId(id);
  },

  async search(searchTerm: string): Promise<Marca[]> {
    return marcaDAO.pesquisar(searchTerm);
  },

  async create(marca: Omit<Marca, "id_marca" | "created_at">): Promise<Marca> {
    return marcaDAO.criar(marca);
  },

  async update(id: string, marca: Partial<Marca>): Promise<Marca> {
    return marcaDAO.atualizar(id, marca);
  },

  async delete(id: string): Promise<void> {
    return marcaDAO.deletar(id);
  },
};
