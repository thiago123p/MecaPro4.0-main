const express = require('express');
const router = express.Router();
const pool = require('../db');

// Função auxiliar para registrar movimentação
async function registrarMovimentacao(idUsuario, tipoMovimentacao, acao, idRegistro, numeroRegistro, valorTotal, detalhes = null) {
  try {
    // Verificar se a tabela existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'log_movimentacoes'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      console.warn('⚠️ Tabela log_movimentacoes não existe. Execute o script add_movimentacoes_log.sql');
      return null;
    }

    const result = await pool.query(
      `INSERT INTO log_movimentacoes (
        id_usuario, 
        tipo_movimentacao, 
        acao, 
        id_registro, 
        numero_registro, 
        valor_total,
        detalhes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [idUsuario, tipoMovimentacao, acao, idRegistro, numeroRegistro, valorTotal, detalhes]
    );
    
    console.log(`✓ Movimentação registrada: ${tipoMovimentacao} - ${acao} - Usuário: ${idUsuario}`);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error.message);
    return null;
  }
}

// Buscar movimentações de um usuário em um período
router.get('/usuario/:idUsuario', async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const { dataInicio, dataFim } = req.query;
    
    // Verificar se a tabela existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'log_movimentacoes'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      console.warn('⚠️ Tabela log_movimentacoes não existe');
      return res.json([]);
    }

    let query = `
      SELECT 
        lm.*,
        u.nome_usu
      FROM log_movimentacoes lm
      LEFT JOIN usuario u ON lm.id_usuario = u.id_usu
      WHERE lm.id_usuario = $1
    `;
    
    const params = [idUsuario];
    
    if (dataInicio && dataFim) {
      query += ` AND lm.data_movimentacao >= $2 AND lm.data_movimentacao <= $3`;
      params.push(dataInicio, dataFim);
    }
    
    query += ` ORDER BY lm.data_movimentacao DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error.message);
    res.status(500).json({ error: 'Erro ao buscar movimentações' });
  }
});

// Buscar todas as movimentações (com limite e filtros)
router.get('/', async (req, res) => {
  try {
    const { limite, tipo, acao, dataInicio, dataFim } = req.query;
    
    // Verificar se a tabela existe
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'log_movimentacoes'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      console.warn('⚠️ Tabela log_movimentacoes não existe');
      return res.json([]);
    }

    let query = `
      SELECT 
        lm.*,
        u.nome_usu
      FROM log_movimentacoes lm
      LEFT JOIN usuario u ON lm.id_usuario = u.id_usu
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (tipo) {
      query += ` AND lm.tipo_movimentacao = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }
    
    if (acao) {
      query += ` AND lm.acao = $${paramIndex}`;
      params.push(acao);
      paramIndex++;
    }
    
    if (dataInicio && dataFim) {
      query += ` AND lm.data_movimentacao >= $${paramIndex} AND lm.data_movimentacao <= $${paramIndex + 1}`;
      params.push(dataInicio, dataFim);
      paramIndex += 2;
    }
    
    query += ` ORDER BY lm.data_movimentacao DESC`;
    
    if (limite) {
      query += ` LIMIT ${parseInt(limite)}`;
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error.message);
    res.status(500).json({ error: 'Erro ao buscar movimentações' });
  }
});

// Exportar a função auxiliar para uso em outras rotas
module.exports = router;
module.exports.registrarMovimentacao = registrarMovimentacao;
