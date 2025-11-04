import { Cliente } from "@/models/types";
import { clienteDAO } from "@/dao/clienteDAO";

// Service - Camada de Serviço para Cliente
// Contém lógica de negócio e usa o DAO para acessar dados
export const clienteService = {
  // Buscar todos os clientes (com limite padrão de 5)
  async getAll(limit = 5): Promise<Cliente[]> {
    return clienteDAO.buscarTodos(limit);
  },

  // Buscar cliente por ID
  async getById(id: string): Promise<Cliente | null> {
    return clienteDAO.buscarPorId(id);
  },

  // Pesquisar clientes por termo
  async search(searchTerm: string): Promise<Cliente[]> {
    return clienteDAO.pesquisar(searchTerm);
  },

  // Criar novo cliente
  async create(cliente: Omit<Cliente, "id_cli" | "created_at">): Promise<Cliente> {
    return clienteDAO.criar(cliente);
  },

  // Atualizar cliente existente
  async update(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    return clienteDAO.atualizar(id, cliente);
  },

  // Deletar cliente
  async delete(id: string): Promise<void> {
    return clienteDAO.deletar(id);
  },
};
