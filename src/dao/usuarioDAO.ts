import { Usuario } from "@/models/types";
import { apiRequest } from "@/config/api";

// DAO - Data Access Object para Usuario
export const usuarioDAO = {
  async buscarTodos(limite?: number): Promise<Usuario[]> {
    const url = limite ? `/usuarios?limite=${limite}` : '/usuarios';
    return apiRequest<Usuario[]>(url);
  },

  async buscarPorId(id: string): Promise<Usuario | null> {
    try {
      return await apiRequest<Usuario>(`/usuarios/${id}`);
    } catch {
      return null;
    }
  },

  async buscarPorAuthId(authId: string): Promise<Usuario | null> {
    // Essa funcionalidade não existe mais sem Supabase Auth
    return null;
  },

  async pesquisar(termo: string): Promise<Usuario[]> {
    return apiRequest<Usuario[]>(`/usuarios/pesquisar/${termo}`);
  },

  async criar(usuario: Omit<Usuario, "id_usu" | "created_at">): Promise<Usuario> {
    return apiRequest<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  },

  async atualizar(id: string, usuario: Partial<Usuario>): Promise<Usuario> {
    return apiRequest<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    });
  },

  async deletar(id: string): Promise<void> {
    await apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
  },

  async login(cpf_usu: string, senha_usu: string): Promise<Usuario> {
    return apiRequest<Usuario>('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ cpf_usu, senha_usu }),
    });
  },
};
