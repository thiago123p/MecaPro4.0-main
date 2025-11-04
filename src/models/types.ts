// Tipos de dados do sistema MecaPro

export interface Cliente {
  id_cli: string;
  nome_cli: string;
  endereco_cli?: string;
  cpf_cli: string;
  cidade_cli?: string;
  telefone_cli?: string;
  created_at?: string;
}

export interface Mecanico {
  id_mec: string;
  nome_mec: string;
  endereco_mec?: string;
  cpf_mec: string;
  cidade_mec?: string;
  telefone_mec?: string;
  created_at?: string;
}

export interface Usuario {
  id_usu: string;
  nome_usu: string;
  endereco_usu?: string;
  cpf_usu: string;
  cidade_usu?: string;
  telefone_usu?: string;
  senha_usu: string;
  tipo_usu: string;
  palavra_chave_usu?: string;
  auth_user_id?: string;
  created_at?: string;
}

export interface Marca {
  id_marca: string;
  nome_marca: string;
  created_at?: string;
}

export interface Veiculo {
  id_veic: string;
  descricao_veic: string;
  placa_veic: string;
  ano_veic?: number;
  id_marca?: string;
  id_cli: string;
  created_at?: string;
  marca?: Marca;
  cliente?: Cliente;
  // Campos vindos do JOIN no backend
  nome_marca?: string;
  nome_cli?: string;
}

export interface Peca {
  id_peca: string;
  descricao_peca: string;
  preco_peca: number;
  tipo_peca?: string;
  codigo_peca: string;
  id_marca?: string;
  created_at?: string;
  marca?: Marca;
}

export interface ControleEstoque {
  id_estoque: string;
  id_peca: string;
  quantidade: number;
  data_registro: string;
  peca?: Peca;
}

export interface Servico {
  id_serv: string;
  descricao_serv: string;
  valor_serv: number;
  tempo_serv: number;
  cos?: string;
  valor_final_serv?: number;
  created_at?: string;
}

export interface Orcamento {
  id_orc: string;
  numero_orc: number;
  id_veic: string;
  id_usu?: string;
  data_abertura: string;
  valor_total: number;
  veiculo?: Veiculo;
  usuario?: Usuario;
  // Campos do JOIN (quando retornados flat pelo backend)
  descricao_veic?: string;
  placa_veic?: string;
  ano_veic?: number;
  nome_cli?: string;
  telefone_cli?: string;
  nome_marca?: string;
  nome_usu?: string;
}

export interface OrcamentoPeca {
  id: string;
  id_orc: string;
  id_peca: string;
  quantidade: number;
  peca?: Peca;
}

export interface OrcamentoServico {
  id: string;
  id_orc: string;
  id_serv: string;
  quantidade: number;
  servico?: Servico;
}

export interface OS {
  id_os: string;
  numero_os: number;
  id_veic: string;
  id_mec?: string;
  id_usu?: string;
  data_abertura: string;
  data_encerramento?: string;
  valor_total: number;
  forma_pagamento?: string;
  status: string;
  veiculo?: Veiculo;
  mecanico?: Mecanico;
  usuario?: Usuario;
  // Campos do JOIN (quando retornados flat pelo backend)
  descricao_veic?: string;
  placa_veic?: string;
  ano_veic?: number;
  nome_cli?: string;
  telefone_cli?: string;
  nome_marca?: string;
  nome_mec?: string;
  nome_usu?: string;
}

export interface OSPeca {
  id: string;
  id_os: string;
  id_peca: string;
  quantidade: number;
  peca?: Peca;
}

export interface OSServico {
  id: string;
  id_os: string;
  id_serv: string;
  quantidade: number;
  servico?: Servico;
}
