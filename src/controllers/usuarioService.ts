import { Usuario } from "@/models/types";
import { usuarioDAO } from "@/dao/usuarioDAO";

// Service - Camada de Serviço para Usuário
export const usuarioService = {
  async getAll(limit = 5): Promise<Usuario[]> {
    return usuarioDAO.buscarTodos(limit);
  },

  async getById(id: string): Promise<Usuario | null> {
    return usuarioDAO.buscarPorId(id);
  },

  async getByAuthId(authId: string): Promise<Usuario | null> {
    return usuarioDAO.buscarPorAuthId(authId);
  },

  async search(searchTerm: string): Promise<Usuario[]> {
    return usuarioDAO.pesquisar(searchTerm);
  },

  async create(usuario: Omit<Usuario, "id_usu" | "created_at">): Promise<Usuario> {
    return usuarioDAO.criar(usuario);
  },

  async update(id: string, usuario: Partial<Usuario>): Promise<Usuario> {
    return usuarioDAO.atualizar(id, usuario);
  },

  async delete(id: string): Promise<void> {
    return usuarioDAO.deletar(id);
  },

  async login(login: string, senha_usu: string): Promise<Usuario> {
    return usuarioDAO.login(login, senha_usu);
  },
};
