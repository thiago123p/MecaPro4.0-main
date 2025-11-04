import { Veiculo } from "@/models/types";
import { veiculoDAO } from "@/dao/veiculoDAO";

// Service - Camada de Serviço para Veículo
export const veiculoService = {
  async getAll(limit = 5): Promise<Veiculo[]> {
    return veiculoDAO.buscarTodos(limit);
  },

  async getAllUnlimited(): Promise<Veiculo[]> {
    return veiculoDAO.buscarTodos();
  },

  async getById(id: string): Promise<Veiculo | null> {
    return veiculoDAO.buscarPorId(id);
  },

  async search(searchTerm: string): Promise<Veiculo[]> {
    return veiculoDAO.pesquisar(searchTerm);
  },

  async create(veiculo: Omit<Veiculo, "id_veic" | "created_at">): Promise<Veiculo> {
    return veiculoDAO.criar(veiculo);
  },

  async update(id: string, veiculo: Partial<Veiculo>): Promise<Veiculo> {
    return veiculoDAO.atualizar(id, veiculo);
  },

  async delete(id: string): Promise<void> {
    return veiculoDAO.deletar(id);
  },
};
