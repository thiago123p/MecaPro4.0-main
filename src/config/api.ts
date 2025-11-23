// Configuração da URL da API
// Para desenvolvimento local: http://localhost:3000/api
// Para produção (Heroku): https://seu-app.herokuapp.com/api

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper para fazer requisições à API
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    console.log(`🚀 Fazendo requisição para ${API_URL}${endpoint}`, options?.method || 'GET');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();
    
    console.log(`✅ Resposta recebida de ${API_URL}${endpoint}:`, data);
    console.log(`📊 Tipo da resposta:`, Array.isArray(data) ? `Array com ${data.length} itens` : typeof data);

    if (!response.ok) {
      // Se o servidor retornou um erro com mensagem
      if (data.error) {
        throw new Error(data.error);
      }
      // Mensagens de erro padrão baseadas no status HTTP
      switch (response.status) {
        case 400:
          throw new Error('Dados inválidos. Verifique as informações e tente novamente.');
        case 404:
          throw new Error('Registro não encontrado.');
        case 409:
          throw new Error('Já existe um registro com estas informações.');
        case 500:
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
        default:
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro na comunicação com o servidor. Verifique sua conexão.');
  }
}