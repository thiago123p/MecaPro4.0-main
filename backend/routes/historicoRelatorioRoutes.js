const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar todos os históricos de relatórios
router.get('/', async (req, res) => {
  try {
    // Verifica se a tabela existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'historico_relatorio'
      );
    `);
    
    // Se a tabela não existe, retorna array vazio
    if (!checkTable.rows[0].exists) {
      console.warn('⚠️ Tabela historico_relatorio não existe ainda');
      return res.json([]);
    }
    
    const result = await pool.query(`
      SELECT 
        hr.*,
        uc.nome_usu as nome_usuario_consultado,
        ug.nome_usu as nome_usuario_gerador
      FROM historico_relatorio hr
      LEFT JOIN usuario uc ON hr.id_usuario_consultado = uc.id_usu
      LEFT JOIN usuario ug ON hr.id_usuario_gerador = ug.id_usu
      ORDER BY hr.data_geracao DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar histórico:', err.message);
    res.status(500).json({ error: 'Erro ao buscar histórico de relatórios' });
  }
});

// Buscar histórico por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        hr.*,
        uc.nome_usu as nome_usuario_consultado,
        ug.nome_usu as nome_usuario_gerador
      FROM historico_relatorio hr
      LEFT JOIN usuario uc ON hr.id_usuario_consultado = uc.id_usu
      LEFT JOIN usuario ug ON hr.id_usuario_gerador = ug.id_usu
      WHERE hr.id_historico = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Histórico não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

// Criar novo registro de histórico
router.post('/', async (req, res) => {
  try {
    // Verifica se a tabela existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'historico_relatorio'
      );
    `);
    
    // Se a tabela não existe, retorna aviso
    if (!checkTable.rows[0].exists) {
      console.warn('⚠️ Tabela historico_relatorio não existe. Execute o script create_historico_relatorio.sql');
      return res.status(200).json({ message: 'Histórico não disponível - tabela não criada' });
    }
    
    const {
      id_usuario_consultado,
      id_usuario_gerador,
      data_inicio,
      data_fim,
      total_orcamentos,
      valor_total_orcamentos,
      total_os,
      valor_total_os,
      valor_total_geral
    } = req.body;

    // Converte "admin" para null
    const usuarioConsultado = (id_usuario_consultado === "admin" || !id_usuario_consultado) ? null : id_usuario_consultado;
    const usuarioGerador = (id_usuario_gerador === "admin" || !id_usuario_gerador) ? null : id_usuario_gerador;

    const result = await pool.query(
      `INSERT INTO historico_relatorio (
        id_usuario_consultado,
        id_usuario_gerador,
        data_inicio,
        data_fim,
        total_orcamentos,
        valor_total_orcamentos,
        total_os,
        valor_total_os,
        valor_total_geral
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        usuarioConsultado,
        usuarioGerador,
        data_inicio,
        data_fim,
        total_orcamentos || 0,
        valor_total_orcamentos || 0,
        total_os || 0,
        valor_total_os || 0,
        valor_total_geral || 0
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar histórico:', err.message);
    res.status(500).json({ error: 'Erro ao criar histórico de relatório' });
  }
});

// Deletar histórico
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM historico_relatorio WHERE id_historico = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Histórico não encontrado' });
    }
    
    res.json({ message: 'Histórico deletado com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erro ao deletar histórico' });
  }
});

module.exports = router;
