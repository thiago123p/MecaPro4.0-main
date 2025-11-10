import { apiRequest } from '../config/api';

export interface HistoricoRelatorio {
  id_historico: string;
  id_usuario_consultado: string | null;
  id_usuario_gerador: string | null;
  data_geracao: string;
  data_inicio: string;
  data_fim: string;
  total_orcamentos: number;
  valor_total_orcamentos: number;
  total_os: number;
  valor_total_os: number;
  valor_total_geral: number;
  nome_usuario_consultado?: string;
  nome_usuario_gerador?: string;
}

export const historicoRelatorioService = {
  getAll: async (): Promise<HistoricoRelatorio[]> => {
    return apiRequest<HistoricoRelatorio[]>('/historico-relatorio');
  },

  getById: async (id: string): Promise<HistoricoRelatorio> => {
    return apiRequest<HistoricoRelatorio>(`/historico-relatorio/${id}`);
  },

  create: async (data: Omit<HistoricoRelatorio, 'id_historico' | 'data_geracao'>): Promise<HistoricoRelatorio> => {
    return apiRequest<HistoricoRelatorio>('/historico-relatorio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest<void>(`/historico-relatorio/${id}`, {
      method: 'DELETE',
    });
  },
};
