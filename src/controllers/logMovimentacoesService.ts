import { apiRequest } from '../config/api';

export interface LogMovimentacao {
  id_log: string;
  id_usuario: string;
  tipo_movimentacao: 'orcamento' | 'os';
  acao: 'criar' | 'editar' | 'excluir' | 'encerrar';
  id_registro: string;
  numero_registro: number;
  valor_total: number;
  data_movimentacao: string;
  detalhes?: string;
  nome_usu?: string;
}

export const logMovimentacoesService = {
  // Buscar movimentações de um usuário em um período
  getByUsuario: async (idUsuario: string, dataInicio?: string, dataFim?: string): Promise<LogMovimentacao[]> => {
    let url = `/log-movimentacoes/usuario/${idUsuario}`;
    if (dataInicio && dataFim) {
      url += `?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    }
    return apiRequest<LogMovimentacao[]>(url);
  },

  // Buscar todas as movimentações
  getAll: async (limite?: number): Promise<LogMovimentacao[]> => {
    const url = limite ? `/log-movimentacoes?limite=${limite}` : '/log-movimentacoes';
    return apiRequest<LogMovimentacao[]>(url);
  },
};
